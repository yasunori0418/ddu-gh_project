import {
  // ActionArguments,
  // ActionFlags,
  Actions,
  BaseKind,
  // DduItem,
  // PreviewContext,
  // Previewer,
} from "../ddu-source-gh_project/deps.ts";
import { KindParams as Params } from "../ddu-source-gh_project/type/task.ts";
import { edit } from "../ddu-source-gh_project/actions/task/edit.ts";
import { create } from "../ddu-source-gh_project/actions/task/create.ts";

const actions: Actions<Params> = {
  edit,
  create,
};

export class Kind extends BaseKind<Params> {
  override actions = actions;

  // override getPreviewer(args: {
  //   denops: Denops;
  //   item: DduItem;
  //   actionParams: unknown;
  //   previewContext: PreviewContext;
  // }): Promise<Previewer | undefined> {
  //   const action = args.item.action as ActionData;
  //   if (!action) {
  //     return Promise.resolve(undefined);
  //   }

  //   return Promise.resolve({
  //     kind: "buffer",
  //     path: action.title,
  //   });
  // }

  override params(): Params {
    return {
      split: "horizontal",
    };
  }
}
