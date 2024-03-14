import { ActionArguments, ActionFlags, fn, tomlStringify } from "../../deps.ts";
import { KindParams as Params } from "../../type/common.ts";
import { defineAutocmd } from "../../utils.ts";
import {
  ActionData,
  BufInfo,
  SourceParams,
  TaskField,
} from "../../type/task.ts";

// gh project item-create 4 --owner @me --title "test item" --body "test item body" --format json

type TaskCreate = {
  title: string;
  body: string[];
  owner: string;
  projectNumber: number;
  taskFields: TaskField[];
};

function createTomlData(action: ActionData, owner: string): string[] {
  const task: TaskCreate = {
    title: "",
    body: [],
    projectNumber: action.projectNumber,
    owner: owner,
    taskFields: [],
  };

  for (const field of action.fields) {
    const taskField: TaskField = {
      id: field.id,
      name: field.name,
    };
    if (!field.options) taskField.text = "";
    if (field.options) {
      taskField.options = [];
      for (const option of field.options) {
        taskField.options.push({
          id: option.id,
          name: option.name,
        });
      }
      if (field.name === "Status") {
        taskField.options[0].currentStatusFlag = true;
      }
    }
    task.taskFields.push(taskField);
  }

  return tomlStringify(task).split(/\n/);
}

export async function create(
  args: ActionArguments<Params>,
): Promise<ActionFlags> {
  const denops = args.denops;
  const sourceParams = args.sourceParams as SourceParams;
  const action = args.items[0].action as ActionData;
  const { bufnr, bufname } = await denops.call(
    "ddu_source_gh_project#create_scratch_buffer",
    action.taskId,
  ) as BufInfo;
  await fn.appendbufline(
    denops,
    bufname,
    0,
    createTomlData(action, sourceParams.owner),
  );

  // defineAutocmd(denops, bufnr, `call ddu_source_gh_project#send(${bufnr})`);

  denops.call(
    "ddu_source_gh_project#open_buffer",
    bufnr,
    "horizontal",
  ) as Promise<void>;

  return Promise.resolve(ActionFlags.None);
}
