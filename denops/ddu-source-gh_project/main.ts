import { Denops, ensure, is, JSONLinesParseStream, tomlParse } from "./deps.ts";
import {
  GHProjectTaskCreateResponse,
  isTaskCreate,
  isTaskEdit,
  TaskField,
  TaskFieldOption,
} from "./type/task.ts";
import { getGHCmd } from "./utils.ts";

export async function main(denops: Denops): Promise<void> {
  const ghCmd = await getGHCmd(denops);
  denops.dispatcher = {
    async edit(buflines: unknown): Promise<void> {
      const tomlString = ensure(buflines, is.ArrayOf(is.String)).join("\n");
      const taskData = ensure(tomlParse(tomlString), isTaskEdit);
      const editBaseArgs: string[] = [
        "project",
        "item-edit",
        "--id",
        taskData.taskId,
      ];
      if (taskData.taskType === "DraftIssue") {
        new Deno.Command(ghCmd, {
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
          new Deno.Command(ghCmd, {
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
              new Deno.Command(ghCmd, {
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
    async create(buflines: unknown): Promise<void> {
      const tomlString = ensure(buflines, is.ArrayOf(is.String)).join("\n");
      const taskData = ensure(tomlParse(tomlString), isTaskCreate);
      const { stdout } = new Deno.Command(ghCmd, {
        args: [
          "project",
          "item-create",
          taskData.projectNumber.toString(),
          "--owner",
          taskData.owner,
          "--title",
          taskData.title,
          "--body",
          taskData.body.join("\n"),
          "--format",
          "json",
        ],
        stdin: "null",
        stderr: "null",
        stdout: "piped",
      }).spawn();

      let createResponse = {} as GHProjectTaskCreateResponse;
      await stdout
        .pipeThrough(new TextDecoderStream())
        .pipeThrough(new JSONLinesParseStream())
        .pipeTo(
          new WritableStream<GHProjectTaskCreateResponse>({
            write(response: GHProjectTaskCreateResponse) {
              createResponse = response;
            },
          }),
        ).finally(async () => {
          await stdout.cancel();
        });

      const statusField = taskData.taskFields.find((taskField) =>
        taskField.name === "Status"
      ) as TaskField;
      const currentStatusItem = statusField.options?.find((option) =>
        option.currentStatusFlag
      ) as TaskFieldOption;
      new Deno.Command("gh", {
        args: [
          "project",
          "item-edit",
          "--id",
          createResponse.id,
          "--project-id",
          taskData.projectId,
          "--field-id",
          statusField?.id,
          "--single-select-option-id",
          currentStatusItem.id,
        ],
        stdin: "null",
        stderr: "null",
        stdout: "null",
      }).spawn();
      return await Promise.resolve();
    },
  };

  return Promise.resolve();
}
