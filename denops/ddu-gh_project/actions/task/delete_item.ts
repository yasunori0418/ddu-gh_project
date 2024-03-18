import { ActionArguments, ActionFlags } from "../../deps.ts";
import { ActionData, KindParams as Params } from "../../type/task.ts";
import { getGHCmd } from "../../utils.ts";

export async function deleteItem(args: ActionArguments<Params>) {
  const denops = args.denops;
  const ghCmd = await getGHCmd(denops);
  for (const item of args.items) {
    const action = item.action as ActionData;
    new Deno.Command(ghCmd, {
      args: [
        "project",
        "item-delete",
        action.projectNumber.toString(),
        "--owner",
        action.owner,
        "--id",
        action.taskId,
      ],
      stdin: "null",
      stderr: "null",
      stdout: "null",
    }).spawn();
  }

  return await Promise.resolve(ActionFlags.None);
}
