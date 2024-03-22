import {
  Actions,
  BaseKind,
  DduItem,
  Denops,
  PreviewContext,
  Previewer,
} from "../ddu-gh_project/deps.ts";
import {
  ActionData,
  KindParams as Params,
} from "../ddu-gh_project/type/project.ts";
import { openTaskList } from "../ddu-gh_project/actions/project/open_task_list.ts";

const actions: Actions<Params> = {
  openTaskList,
};

export class Kind extends BaseKind<Params> {
  override actions = actions;

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
