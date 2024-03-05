import {
  ActionArguments,
  ActionFlags,
  BaseKind,
  DduItem,
  // PreviewContext,
  // Previewer,
} from "https://deno.land/x/ddu_vim@v3.10.2/types.ts";
import {
  autocmd,
  Denops,
  fn,
} from "https://deno.land/x/ddu_vim@v3.10.2/deps.ts";
import { stringify as tomlStringify } from "https://deno.land/std@0.218.2/toml/mod.ts";
import {
  KindActionData as ActionData,
  BufInfo,
  TaskEdit,
  TaskField,
} from "../ddu-source-gh_project/type.ts";

type Params = Record<never, never>;

type ActionFunction = (args: ActionArguments<Params>) => Promise<ActionFlags>;

function defineAutocmd(
  denops: Denops,
  bufnr: number,
  ctx: string,
) {
  autocmd.define(denops, "QuitPre", `<buffer=${bufnr}>`, ctx, {
    once: true,
  });
}

function createTomlData(action: ActionData): string[] {
  const task: TaskEdit = {
    projectId: action.projectId,
    taskId: action.taskId,
    title: action.title,
    body: action.body.split(/\n/),
    currentStatus: action.currentStatus,
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
        let currentStatusFlag = undefined;
        if (field.name === "Status" && option.name === action.currentStatus) {
          currentStatusFlag = true;
        }
        taskField.options.push({
          id: option.id,
          name: option.name,
          currentStatusFlag,
        });
      }
    }
    task.taskFields.push(taskField);
  }

  return tomlStringify(task).split(/\n/);
}

export class Kind extends BaseKind<Params> {
  actions: Record<string, ActionFunction> = {
    echo: (args: { items: DduItem[] }) => {
      for (const item of args.items) {
        const action = item.action as ActionData;
        console.log(`title: "${action.title}"`);
      }
      return Promise.resolve(ActionFlags.None);
    },
    edit: async (args: { items: DduItem[]; denops: Denops }) => {
      const denops = args.denops;
      const action = args.items[0].action as ActionData;
      const { bufnr, bufname } = await denops.call(
        "ddu_source_gh_project#create_scratch_buffer",
        action.taskId,
      ) as BufInfo;
      await fn.appendbufline(denops, bufname, 0, createTomlData(action));

      defineAutocmd(denops, bufnr, `call ddu_source_gh_project#send(${bufnr})`);

      denops.call(
        "ddu_source_gh_project#open_buffer",
        bufnr,
        "horizontal",
      ) as Promise<void>;
      return Promise.resolve(ActionFlags.None);
    },
  };

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
    return {};
  }
}
