import {
  ActionArguments,
  ActionFlags,
  autocmd,
  Denops,
  fn,
  tomlStringify,
} from "../../deps.ts";
import { KindParams as Params } from "../../type/common.ts";
import {
  BufInfo,
  ActionData,
  TaskEdit,
  TaskField,
} from "../../type/task.ts";

function defineAutocmd(
  denops: Denops,
  bufnr: number,
  ctx: string,
) {
  autocmd.define(denops, "QuitPre", `<buffer=${bufnr}>`, ctx, {
    once: true,
  });
}

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

export async function edit(args: ActionArguments<Params>) {
  const denops = args.denops;
  const action = args.items[0].action as ActionData;
  const { bufnr, bufname } = await denops.call(
    "ddu_source_gh_project#create_scratch_buffer",
    action.taskId,
  ) as BufInfo;
  await fn.appendbufline(denops, bufname, 0, createTomlData(action));

  defineAutocmd(denops, bufnr, `call ddu_source_gh_project#send(${bufnr})`);

  denops.call(
    "ddu_source_gh_project#open_buffer",
    bufnr,
    "horizontal",
  ) as Promise<void>;
  return Promise.resolve(ActionFlags.None);
}
