import { Denops } from "https://deno.land/x/denops_std@v6.3.0/mod.ts";
import { ensure, is } from "https://deno.land/x/unknownutil@v3.17.0/mod.ts";
import { parse as tomlParse } from "https://deno.land/std@0.219.1/toml/mod.ts";
import { TaskEdit, isTaskEdit } from "./type/task.ts";

export function main(denops: Denops): Promise<void> {
  denops.dispatcher = {
    async send(buflines: unknown): Promise<void> {
      const tomlString = ensure(buflines, is.ArrayOf(is.String)).join("\n");
      const taskData = ensure(tomlParse(tomlString), isTaskEdit) as TaskEdit;
      console.log(taskData);
      return await Promise.resolve();
    },
  };

  return Promise.resolve();
}
