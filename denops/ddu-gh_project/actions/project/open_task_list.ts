import { ActionArguments, ActionFlags, DduOptions } from "../../deps.ts";
import { ActionData, KindParams as Params } from "../../type/project.ts";
import { SourceParams as TaskSourceParams } from "../../type/task.ts";

export async function openTaskList(
  args: ActionArguments<Params>,
): Promise<ActionFlags> {
  const action = args.items[0].action as ActionData;
  const selectProjectSourceParams: TaskSourceParams = {
    limit: args.kindParams.limit,
    owner: action.ownerLogin,
    projectId: action.id,
    projectNumber: action.number,
  };
  const option: Partial<DduOptions> = {
    ui: "ff",
    sources: [
      {
        name: "gh_project_task",
        params: selectProjectSourceParams,
      },
    ],
  };
  if (args.kindParams.uiFfParams) {
    option.uiParams = {
      ff: args.kindParams.uiFfParams,
    };
  }
  args.denops.dispatch("ddu", "start", option);

  return await Promise.resolve(ActionFlags.None);
}
