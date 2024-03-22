import { DduOptions } from "../deps.ts";

export type ActionData = {
  closed: boolean;
  fieldsTotalCount: number;
  id: string;
  itemsTotalCount: number;
  number: number;
  ownerLogin: string;
  ownerType: string;
  isPublic: boolean;
  readme: string;
  shortDescription: string;
  title: string;
  url: string;
};

export type SourceParams = {
  owner: string;
  limit: number;
};

export type KindParams = {
  dduOptions?: DduOptions;
};

export type GHProject = {
  closed: boolean;
  fields: {
    totalCount: number;
  };
  id: string;
  items: {
    totalCount: number;
  };
  number: number;
  owner: {
    login: string;
    type: string;
  };
  public: boolean;
  readme: string;
  shortDescription: string;
  title: string;
  url: string;
};
