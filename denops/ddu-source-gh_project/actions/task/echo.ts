import {
  ActionArguments,
  ActionFlags,
} from "../../deps.ts";
import { KindParams as Params } from "../../type/common.ts";
import { KindActionData as ActionData } from "../../type/task.ts";

export function echo(args: ActionArguments<Params>): Promise<ActionFlags> {
  for (const item of args.items) {
    const action = item.action as ActionData;
    console.log(`title: "${action.title}"`);
  }
  return Promise.resolve(ActionFlags.None);
}
