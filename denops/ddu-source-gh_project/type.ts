import { Overwrite } from "./utils.ts";

export type Task = {
  projectId: string;
  taskId: string;
  title: string;
  body: string;
  currentStatus: string;
};

export type TaskField = {
  id: string;
  name: string;
  text?: string;
  options?: TaskFieldOption[];
};

export type TaskFieldOption = {
  id: string;
  name: string;
  currentStatusFlag?: boolean;
};

export type TaskEdit = Overwrite<
  Task,
  { body: string[]; taskFields: TaskField[] }
>;

export type ActionData = Task & {
  type: "DraftIssue" | "Issue" | "PullRequest";
  fields: GHProjectTaskField[];
};

/**
 * Type of each task which can be obtained by `gh project item-list --format json`
 */
export type GHProjectTask = {
  id: string;
  status: string;
  title: string;
  content: GHProjectTaskContent;
  assignees?: string[];
  repository?: string;
};

export type GHProjectTaskContent = {
  title: string;
  body: string;
  type:
    | "DraftIssue"
    | "Issue"
    | "PullRequest";
  number?: number;
  repository?: string;
  url?: string;
  id?: string;
};

export type GHProjectTaskField = {
  id: string;
  name: string;
  type: string;
  options?: GHProjectTaskSingleSelectField[];
};

export type GHProjectTaskSingleSelectField = {
  id: string;
  name: string;
};

/**
 * autoload/ddu_source_gh_project#create_scratch_buffer
 * Return value type of buffer creation function
 */
export type BufInfo = {
  bufnr: number;
  bufname: string;
};

