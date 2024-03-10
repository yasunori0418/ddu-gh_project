import {
  ActionArguments,
  ActionFlags,
  BaseKind,
  DduItem,
  PreviewContext,
  Previewer,
} from "https://deno.land/x/ddu_vim@v3.10.3/types.ts";
import { Denops } from "https://deno.land/x/ddu_vim@v3.10.3/deps.ts";
import { KindActionData as ActionData } from "../ddu-source-gh_project/type/project.ts";

type Params = Record<never, never>;

export class Kind extends BaseKind<Params> {
  override actions: Record<
    string,
    (args: ActionArguments<Params>) => Promise<ActionFlags>
  > = {
    echo: (args: { items: DduItem[] }) => {
      for (const item of args.items) {
        const action = item.action as ActionData;
        console.log(`number: "${action.number}", title: "${action.title}"`);
      }
      return Promise.resolve(ActionFlags.None);
    },
    // openItemList: (args: { denops: Denops; items: DduItem[] }) => {

    // },
  };

  override getPreviewer(args: {
    denops: Denops;
    item: DduItem;
    actionParams: unknown;
    previewContext: PreviewContext;
  }): Promise<Previewer | undefined> {
    const action = args.item.action as ActionData;
    if (!action) {
      return Promise.resolve(undefined);
    }

    return Promise.resolve({
      kind: "buffer",
      path: action.title,
    });
  }

  override params(): Params {
    return {};
  }
}
