import { ActionArguments, ActionFlags } from "../../deps.ts";
import { ActionData, KindParams as Params } from "../../type/task.ts";
import { getGHCmd } from "../../utils.ts";

export async function archive({ denops, items }: ActionArguments<Params>) {
  const ghCmd = await getGHCmd(denops);
  for (const item of items) {
    const action = item.action as ActionData;
    new Deno.Command(ghCmd, {
      args: [
        "project",
        "item-archive",
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
