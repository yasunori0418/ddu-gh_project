import { ActionArguments, ActionFlags, tomlStringify } from "../../deps.ts";
import { createScratchBuffer, quitPreBufferAutocmd } from "../../utils.ts";
import {
  ActionData,
  KindParams as Params,
  TaskEdit,
  TaskField,
} from "../../type/task.ts";

function createTomlData(action: ActionData): string[] {
  const task: TaskEdit = {
    projectId: action.projectId,
    projectNumber: action.projectNumber,
    taskId: action.taskId,
    draftIssueID: action.draftIssueID,
    title: action.title,
    body: action.body.split(/\n/),
    taskType: action.type,
    currentStatus: action.currentStatus,
    taskFields: [],
  };

  for (const field of action.fields) {
    const taskField: TaskField = {
      id: field.id,
      name: field.name,
    };
    if (!field.options) {
      if (field.name === "Title") {
        taskField.text = action.title;
      } else {
        taskField.text = "";
      }
    }
    if (field.options) {
      taskField.options = [];
      for (const option of field.options) {
        let currentStatusFlag = undefined;
        if (field.name === "Status" && option.name === action.currentStatus) {
          currentStatusFlag = true;
        }
        taskField.options.push({
          id: option.id,
          name: option.name,
          currentStatusFlag,
        });
      }
    }
    task.taskFields.push(taskField);
  }

  return tomlStringify(task).split(/\n/);
}

export async function edit(
  args: ActionArguments<Params>,
): Promise<ActionFlags> {
  const denops = args.denops;
  const action = args.items[0].action as ActionData;
  const { bufnr } = await createScratchBuffer(
    denops,
    action.taskId,
    createTomlData(action),
  );

  quitPreBufferAutocmd(
    denops,
    bufnr,
    `call ddu_gh_project#send(${bufnr}, "edit")`,
  );

  denops.call(
    "ddu_gh_project#open_buffer",
    bufnr,
    args.kindParams.split,
  ) as Promise<void>;
  return await Promise.resolve(ActionFlags.None);
}

