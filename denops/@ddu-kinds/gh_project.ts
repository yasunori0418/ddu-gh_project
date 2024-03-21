import {
  ActionArguments,
  ActionFlags,
  BaseKind,
  DduItem,
  Denops,
  PreviewContext,
  Previewer,
} from "../ddu-gh_project/deps.ts";
import { ActionData } from "../ddu-gh_project/type/project.ts";

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
