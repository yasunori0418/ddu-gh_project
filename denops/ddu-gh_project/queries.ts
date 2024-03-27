import { Denops, JSONLinesParseStream } from "./deps.ts";
import {
  GHProjectTaskCreateResponse,
  TaskCreate,
  TaskEdit,
  TaskField,
  TaskFieldOption,
} from "./type/task.ts";
import { cmd, getGHCmd } from "./utils.ts";

/**
 * update target task status.
 * @param denops instance object.
 * @param taskData target task data.
 * @param taskId id of `PVIT_` prefix
 */
export async function updateTaskStatus<T extends TaskEdit | TaskCreate>(
  denops: Denops,
  taskData: T,
  taskId: string,
): Promise<void> {
  const ghCmd = await getGHCmd(denops);
  const statusField = taskData.taskFields.find((taskField) =>
    taskField.name === "Status"
  ) as TaskField;
  const currentStatusItem = statusField.options?.find((option) =>
    option.currentStatusFlag
  ) as TaskFieldOption;
  await cmd(denops, ghCmd, {
    args: [
      "project",
      "item-edit",
      "--id",
      taskId,
      "--project-id",
      taskData.projectId,
      "--field-id",
      statusField.id,
      "--single-select-option-id",
      currentStatusItem.id,
    ],
  });
}

/**
 * update DraftIssue title and body
 * @param denops instance object.
 * @param taskData target task data.
 */
export async function updateDraftIssueContent(
  denops: Denops,
  taskData: TaskEdit,
): Promise<void> {
  if (taskData.taskType !== "DraftIssue") return;
  const ghCmd = await getGHCmd(denops);
  await cmd(denops, ghCmd, {
    args: [
      "project",
      "item-edit",
      "--id",
      taskData.draftIssueID,
      "--title",
      taskData.title,
      "--body",
      taskData.body.join("\n"),
    ],
  });
}

/**
 * update task field content.
 * @param denops instance object.
 * @param taskData target task data.
 */
export async function updateTaskFields(
  denops: Denops,
  taskData: TaskEdit,
): Promise<void> {
  const ghCmd = await getGHCmd(denops);
  for (const field of taskData.taskFields) {
    const editFieldArgs: string[] = [
      "project",
      "item-edit",
      "--id",
      taskData.taskId,
      "--project-id",
      taskData.projectId,
      "--field-id",
      field.id,
    ];
    if (field.text) {
      await cmd(denops, ghCmd, {
        args: [
          ...editFieldArgs,
          "--text",
          field.text,
        ],
      });
    }
  }
}

/**
 * create task
 * @param denops instance object.
 * @param taskData target task data.
 */
export async function createTask(
  denops: Denops,
  taskData: TaskCreate,
): Promise<string> {
  const ghCmd = await getGHCmd(denops);
  const { pipeOut, finalize } = await cmd(denops, ghCmd, {
    args: [
      "project",
      "item-create",
      taskData.projectNumber.toString(),
      "--owner",
      taskData.owner,
      "--title",
      taskData.title,
      "--body",
      taskData.body.join("\n"),
      "--format",
      "json",
    ],
  });

  let createResponse = {} as GHProjectTaskCreateResponse;
  await pipeOut
    .pipeThrough(new JSONLinesParseStream())
    .pipeTo(
      new WritableStream<GHProjectTaskCreateResponse>({
        write(response: GHProjectTaskCreateResponse) {
          createResponse = response;
        },
      }),
    );
  await finalize();
  return await Promise.resolve(createResponse.id);
}
