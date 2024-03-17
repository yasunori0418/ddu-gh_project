import { ActionArguments, ActionFlags, tomlStringify } from "../../deps.ts";
import { createScratchBuffer, defineAutocmd } from "../../utils.ts";
import {
  ActionData,
  KindParams as Params,
  TaskCreate,
  TaskField,
} from "../../type/task.ts";

function createTomlData(action: ActionData): string[] {
  const task: TaskCreate = {
    title: "",
    body: [],
    projectNumber: action.projectNumber,
    projectId: action.projectId,
    owner: action.owner,
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
  const action = args.items[0].action as ActionData;
  const { bufnr } = await createScratchBuffer(
    denops,
    "create_new_task",
    createTomlData(action),
  );

  defineAutocmd(denops, bufnr, `call ddu_source_gh_project#send(${bufnr}, "create")`);

  denops.call(
    "ddu_source_gh_project#open_buffer",
    bufnr,
    "horizontal",
  ) as Promise<void>;

  return Promise.resolve(ActionFlags.None);
}
