import {
  BaseSource,
  // DduOptions,
  Item,
  // SourceOptions,
} from "https://deno.land/x/ddu_vim@v3.10.3/types.ts";
import {
  GatherArguments,
} from "https://deno.land/x/ddu_vim@v3.10.3/base/source.ts";
import { JSONLinesParseStream } from "https://deno.land/x/jsonlines@v1.2.2/mod.ts";
import {
  GHProjectTask,
  GHProjectTaskField,
  KindActionData as ActionData,
  SourceParams as Params,
} from "../ddu-source-gh_project/type/task.ts";

function parseActionData(
  task: GHProjectTask,
  taskFields: GHProjectTaskField[],
  sourceParams: Params,
): ActionData {
  const projectNumber = sourceParams.projectNumber;
  if (!projectNumber) throw "required projectNumber";
  const projectId = sourceParams.projectId;
  if (!projectId) throw "required projectId";
  const draftIssueID = task.content.id ?? "";

  return {
    projectId: projectId,
    taskId: task.id,
    draftIssueID: draftIssueID,
    projectNumber: projectNumber,
    title: task.title,
    body: task.content.body,
    type: task.content.type,
    currentStatus: task.status,
    fields: taskFields,
  };
}

function parseSourceItems(
  task: GHProjectTask,
  taskFields: GHProjectTaskField[],
  sourceParams: Params,
): Item<ActionData> {
  return {
    word: task.title,
    display: `[${task.status}] ${task.title}`,
    action: parseActionData(task, taskFields, sourceParams),
  };
}

async function getProjectTaskFields(sourceParams: Params): Promise<GHProjectTaskField[]> {
  const projectNumber = sourceParams.projectNumber;
  if (!projectNumber) throw "required projectNumber";
  const projectId = sourceParams.projectId;
  if (!projectId) throw "required projectId";

  const { stdout } = new Deno.Command(sourceParams.cmd, {
    args: [
      "project",
      "field-list",
      projectNumber.toString(),
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

  const taskFields: GHProjectTaskField[] = [];
  await stdout
    .pipeThrough(new TextDecoderStream())
    .pipeThrough(new JSONLinesParseStream())
    .pipeTo(
      new WritableStream<{ fields: GHProjectTaskField[] }>({
        write(chunk: { fields: GHProjectTaskField[] }) {
          for (const filed of chunk.fields) {
            taskFields.push(filed);
          }
        },
      }),
    ).finally(async () => {
      await stdout.cancel();
    });
  return taskFields;
}

export class Source extends BaseSource<Params> {
  override kind = "gh_project_task";

  override gather(
    { sourceParams }: GatherArguments<Params>,
  ): ReadableStream<Item<ActionData>[]> {
    return new ReadableStream({
      async start(controller) {
        const projectNumber = sourceParams.projectNumber;
        if (!projectNumber) throw "required projectNumber";

        const taskFields = await getProjectTaskFields(sourceParams);
        const { stdout } = new Deno.Command(sourceParams.cmd, {
          args: [
            "project",
            "item-list",
            projectNumber.toString(),
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
            new WritableStream<{ items: GHProjectTask[] }>({
              write(task: { items: GHProjectTask[] }) {
                controller.enqueue(
                  task.items.map((item) =>
                    parseSourceItems(item, taskFields, sourceParams)
                  ).reverse(),
                );
              },
            }),
          ).finally(async () => {
            await stdout.cancel();
          });
      },
    });
  }

  override params(): Params {
    return {
      cmd: "gh",
      owner: "@me",
      limit: 1000,
    };
  }
}
