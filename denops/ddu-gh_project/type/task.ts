import { is } from "../deps.ts";

export type TaskFieldOption = {
  id: string;
  name: string;
  currentStatusFlag?: boolean;
};

export type TaskField = {
  id: string;
  name: string;
  text?: string;
  options?: TaskFieldOption[];
};

export const isTaskFieldOption = is.ObjectOf({
  id: is.String,
  name: is.String,
  currentStatusFlag: is.OptionalOf(is.Boolean),
});

export const isTaskField = is.ObjectOf({
  id: is.String,
  name: is.String,
  text: is.OptionalOf(is.String),
  options: is.OptionalOf(is.ArrayOf(isTaskFieldOption)),
});

export type TaskEdit = {
  projectId: string;
  projectNumber: number;
  taskId: string;
  draftIssueID: string;
  title: string;
  body: string[];
  taskType: "DraftIssue" | "Issue" | "PullRequest";
  currentStatus: string | 0;
  taskFields: TaskField[];
};

export const isTaskEdit = is.ObjectOf({
  projectId: is.String,
  taskId: is.String,
  draftIssueID: is.String,
  title: is.String,
  body: is.ArrayOf(is.String),
  taskType: is.LiteralOneOf(["DraftIssue", "Issue", "PullRequest"] as const),
  currentStatus: is.UnionOf([is.String, is.LiteralOf(0)]),
  taskFields: is.ArrayOf(isTaskField),
});

export type TaskCreate = {
  title: string;
  body: string[];
  owner: string;
  projectNumber: number;
  projectId: string;
  taskFields: TaskField[];
};

export const isTaskCreate = is.ObjectOf({
  title: is.String,
  body: is.ArrayOf(is.String),
  owner: is.String,
  projectNumber: is.Number,
  projectId: is.String,
  taskFields: is.ArrayOf(isTaskField),
})

export type ActionData = {
  owner: string;
  projectId: string;
  projectNumber: number;
  taskId: string;
  draftIssueID: string;
  title: string;
  body: string;
  currentStatus: string;
  type: "DraftIssue" | "Issue" | "PullRequest";
  fields: GHProjectTaskField[];
};

export type SourceParams = {
  owner: string;
  limit: number;
  projectId?: string;
  projectNumber?: number;
};

export type KindParams = {
  split: "horizontal" | "vertical" | "tabedit";
}

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
 * This is the json type that can be obtained by executing the `gh project item-create --foramt json` command.
 */
export type GHProjectTaskCreateResponse = {
  id: string;
  title: string;
  body: string;
  type: "DraftIssue";
}

