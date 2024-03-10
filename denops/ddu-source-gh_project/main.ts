import { Denops } from "https://deno.land/x/denops_std@v6.3.0/mod.ts";
import { ensure, is } from "https://deno.land/x/unknownutil@v3.17.0/mod.ts";
import { parse as tomlParse } from "https://deno.land/std@0.219.1/toml/mod.ts";
import { isTaskEdit } from "./type/task.ts";

export function main(denops: Denops): Promise<void> {
  denops.dispatcher = {
    async send(buflines: unknown): Promise<void> {
      const tomlString = ensure(buflines, is.ArrayOf(is.String)).join("\n");
      const taskData = ensure(tomlParse(tomlString), isTaskEdit);
      const editBaseArgs: string[] = [
        "project",
        "item-edit",
        "--id",
        taskData.taskId,
      ];
      if (taskData.taskType === "DraftIssue") {
        new Deno.Command("gh", {
          args: [
            ...editBaseArgs,
            "--title",
            taskData.title,
            "--body",
            taskData.body.join("\n"),
          ],
          stdin: "null",
          stderr: "null",
          stdout: "null",
        }).spawn();
      }
      return await Promise.resolve();
    },
  };

  return Promise.resolve();
}
