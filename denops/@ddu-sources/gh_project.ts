import {
  BaseSource,
  // SourceOptions,
  GatherArguments,
  // DduOptions,
  Item,
  JSONLinesParseStream,
} from "../ddu-gh_project/deps.ts";
import {
  GHProject,
  ActionData,
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

export class Source extends BaseSource<Params> {
  override kind = "gh_project";

  override gather(
    { denops, sourceParams }: GatherArguments<Params>,
  ): ReadableStream<Item<ActionData>[]> {
    return new ReadableStream({
      async start(controller) {
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

        await stdout
          .pipeThrough(new TextDecoderStream())
          .pipeThrough(new JSONLinesParseStream())
          .pipeTo(
            new WritableStream<{ projects: GHProject[] }>({
              write(chunk: { projects: GHProject[] }) {
                controller.enqueue(
                  chunk.projects.map((project) => parseGHProjectItem(project)),
                );
              },
            }),
          ).finally(async () => {
            await stdout.cancel();
          });
        controller.close();
      },
    });
  }

  override params(): Params {
    return {
      owner: "@me",
      limit: 0,
    };
  }
}
