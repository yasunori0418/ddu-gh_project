import { Denops, ensure, is, tomlParse } from "./deps.ts";
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
      for (const field of taskData.taskFields) {
        const editFieldArgs: string[] = [
          "--project-id",
          taskData.projectId,
          "--field-id",
          field.id,
        ];
        if (field.text) {
          new Deno.Command("gh", {
            args: [
              ...editBaseArgs,
              ...editFieldArgs,
              "--text",
              field.text,
            ],
            stdin: "null",
            stderr: "null",
            stdout: "null",
          }).spawn();
        }
        if (field.options) {
          if (field.name === "Status") {
            const currentStatus = field.options.find((option) =>
              option.currentStatusFlag
            );
            if (currentStatus) {
              new Deno.Command("gh", {
                args: [
                  ...editBaseArgs,
                  ...editFieldArgs,
                  "--single-select-option-id",
                  currentStatus.id,
                ],
                stdin: "null",
                stderr: "null",
                stdout: "null",
              }).spawn();
            }
          }
        }
      }
      return await Promise.resolve();
    },
  };

  return Promise.resolve();
}
