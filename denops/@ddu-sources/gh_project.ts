import {
  BaseSource,
  Denops,
  GatherArguments,
  Item,
  JSONLinesParseStream,
} from "../ddu-gh_project/deps.ts";
import {
  ActionData,
  GHProject,
  SourceParams as Params,
} from "../ddu-gh_project/type/project.ts";
import { getGHCmd } from "../ddu-gh_project/utils.ts";

function parseGHProjectAction(project: GHProject): ActionData {
  const {
    closed,
    id,
    number,
    readme,
    shortDescription,
    title,
    url,
  } = project;
  const fieldsTotalCount = project.fields.totalCount;
  const itemsTotalCount = project.items.totalCount;
  const ownerLogin = project.owner.login;
  const ownerType = project.owner.type;
  const isPublic = project.public;

  return {
    closed,
    fieldsTotalCount,
    id,
    itemsTotalCount,
    number,
    ownerLogin,
    ownerType,
    isPublic,
    readme,
    shortDescription,
    title,
    url,
  };
}

function parseGHProjectItem(project: GHProject): Item<ActionData> {
  return {
    word: project.title,
    display: project.title,
    action: parseGHProjectAction(project),
    kind: "gh_project",
  };
}

async function getProjectItems(
  denops: Denops,
  sourceParams: Params,
): Promise<Item<ActionData>[]> {
  const ghCmd = await getGHCmd(denops);
  const { stdout } = new Deno.Command(ghCmd, {
    args: [
      "project",
      "list",
      "--owner",
      sourceParams.owner,
      "--limit",
      sourceParams.limit.toString(),
      "--format",
      "json",
    ],
    stdin: "null",
    stderr: "null",
    stdout: "piped",
  }).spawn();

  const projectItems: Item<ActionData>[] = [];
  await stdout
    .pipeThrough(new TextDecoderStream())
    .pipeThrough(new JSONLinesParseStream())
    .pipeTo(
      new WritableStream<{ projects: GHProject[] }>({
        write(chunk: { projects: GHProject[] }) {
          for (const project of chunk.projects) {
            projectItems.push(parseGHProjectItem(project));
          }
        },
      }),
    ).finally(async () => {
      await stdout.cancel();
    });

  return projectItems;
}

export class Source extends BaseSource<Params> {
  override kind = "gh_project";

  override gather(
    { denops, sourceParams }: GatherArguments<Params>,
  ): ReadableStream<Item<ActionData>[]> {
    return new ReadableStream({
      async start(controller) {
        const projectItems = await getProjectItems(denops, sourceParams);
        controller.enqueue(projectItems);
        controller.close();
      },
    });
  }

  override params(): Params {
    return {
      owner: "@me",
      limit: 30,
    };
  }
}
