import {
  BaseSource,
  Denops,
  GatherArguments,
  Item,
  JSONLinesParseStream,
} from "../ddu-gh_project/deps.ts";
import {
  ActionData,
  GHProjectTask,
  GHProjectTaskField,
  SourceParams as Params,
} from "../ddu-gh_project/type/task.ts";
import { cmd, getGHCmd } from "../ddu-gh_project/utils.ts";

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
    owner: sourceParams.owner,
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

async function getProjectTaskFields(
  denops: Denops,
  sourceParams: Params,
  ghCmd: string,
): Promise<GHProjectTaskField[]> {
  const projectNumber = sourceParams.projectNumber;
  if (!projectNumber) throw "required projectNumber";
  const projectId = sourceParams.projectId;
  if (!projectId) throw "required projectId";

  const { pipeOut, finalize } = await cmd(denops, ghCmd, {
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
  });

  const taskFields: GHProjectTaskField[] = [];
  await pipeOut
    .pipeThrough(new JSONLinesParseStream())
    .pipeTo(
      new WritableStream<{ fields: GHProjectTaskField[] }>({
        write(chunk: { fields: GHProjectTaskField[] }) {
          for (const filed of chunk.fields) {
            taskFields.push(filed);
          }
        },
      }),
    );
  await finalize();

  return taskFields;
}

async function getTaskItems(
  denops: Denops,
  sourceParams: Params,
  taskFields: GHProjectTaskField[],
  ghCmd: string,
): Promise<Item<ActionData>[]> {
  const projectNumber = sourceParams.projectNumber;
  if (!projectNumber) throw "required projectNumber";

  const { pipeOut, finalize } = await cmd(denops, ghCmd, {
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
  });

  const taskItems: Item<ActionData>[] = [];
  await pipeOut
    .pipeThrough(new JSONLinesParseStream())
    .pipeTo(
      new WritableStream<{ items: GHProjectTask[] }>({
        write(task: { items: GHProjectTask[] }) {
          for (const item of task.items) {
            taskItems.push(parseSourceItems(item, taskFields, sourceParams));
          }
        },
      }),
    );
  await finalize();

  return taskItems;
}

export class Source extends BaseSource<Params> {
  override kind = "gh_project_task";

  override gather(
    { denops, sourceParams }: GatherArguments<Params>,
  ): ReadableStream<Item<ActionData>[]> {
    return new ReadableStream({
      async start(controller) {
        const projectNumber = sourceParams.projectNumber;
        if (!projectNumber) throw "required projectNumber";
        const ghCmd = await getGHCmd(denops);

        const taskFields = await getProjectTaskFields(
          denops,
          sourceParams,
          ghCmd,
        );
        const taskItems = await getTaskItems(
          denops,
          sourceParams,
          taskFields,
          ghCmd,
        );
        controller.enqueue(taskItems.reverse());
        controller.close();
      },
    });
  }

  override params(): Params {
    return {
      owner: "@me",
      limit: 1000,
    };
  }
}
