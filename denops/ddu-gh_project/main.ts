import { Denops, ensure, is, JSONLinesParseStream, tomlParse } from "./deps.ts";
import {
  GHProjectTaskCreateResponse,
  isTaskCreate,
  isTaskEdit,
  TaskCreate,
  TaskEdit,
} from "./type/task.ts";
import { cmd, getGHCmd } from "./utils.ts";
import {
  updateDraftIssueContent,
  updateTaskFields,
  updateTaskStatus,
} from "./queries.ts";

export async function main(denops: Denops): Promise<void> {
  const ghCmd = await getGHCmd(denops);
  denops.dispatcher = {
    async edit(buflines: unknown): Promise<void> {
      const tomlString = ensure(buflines, is.ArrayOf(is.String)).join("\n");
      const taskData = ensure(
        tomlParse(tomlString),
        isTaskEdit,
      ) as TaskEdit;
      await updateDraftIssueContent(denops, taskData);
      await updateTaskFields(denops, taskData);
      await updateTaskStatus<TaskEdit>(
        denops,
        taskData as TaskEdit,
        taskData.taskId,
      );
      return await Promise.resolve();
    },
    async create(buflines: unknown): Promise<void> {
      const tomlString = ensure(buflines, is.ArrayOf(is.String)).join("\n");
      const taskData = ensure(
        tomlParse(tomlString),
        isTaskCreate,
      ) as TaskCreate;
      const { pipeOut, finalize } = await cmd(denops, ghCmd, {
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
      });

      let createResponse = {} as GHProjectTaskCreateResponse;
      await pipeOut
        .pipeThrough(new JSONLinesParseStream())
        .pipeTo(
          new WritableStream<GHProjectTaskCreateResponse>({
            write(response: GHProjectTaskCreateResponse) {
              createResponse = response;
            },
          }),
        );

      await updateTaskStatus<TaskCreate>(
        denops,
        taskData as TaskCreate,
        createResponse.id,
      );
      await finalize();

      return await Promise.resolve();
    },
  };

  return Promise.resolve();
}
