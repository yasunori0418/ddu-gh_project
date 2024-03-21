import { ActionArguments, ActionFlags } from "../../deps.ts";
import { ActionData, KindParams as Params } from "../../type/project.ts";
import { SourceParams as TaskSourceParams } from "../../type/task.ts";

export async function openTaskList(
  args: ActionArguments<Params>,
): Promise<ActionFlags> {
  const denops = args.denops;
  const action = args.items[0].action as ActionData;
  const dduOptions = args.kindParams.dduOptions;
  const ghProjectTaskSourceParams = dduOptions.sourceParams
    .gh_project_task as TaskSourceParams;
  const selectProjectSourceParams: TaskSourceParams = {
    limit: ghProjectTaskSourceParams.limit ?? 1000,
    owner: action.ownerLogin,
    projectId: action.id,
    projectNumber: action.number,
  };
  dduOptions.ui = "ff";
  dduOptions.sources = ["gh_project_task"];
  dduOptions.sourceParams.gh_project_task = selectProjectSourceParams;
  denops.dispatch("ddu", "start", dduOptions);

  return await Promise.resolve(ActionFlags.None);
}
