import { Denops, ensure, is, tomlParse } from "./deps.ts";
import { isTaskCreate, isTaskEdit, TaskCreate, TaskEdit } from "./type/task.ts";
import {
  createTask,
  updateDraftIssueContent,
  updateTaskFields,
  updateTaskStatus,
} from "./queries.ts";

export function main(denops: Denops): Promise<void> {
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
        taskData,
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
      const taskId = await createTask(denops, taskData);

      await updateTaskStatus<TaskCreate>(
        denops,
        taskData,
        taskId,
      );

      return await Promise.resolve();
    },
  };

  return Promise.resolve();
}
