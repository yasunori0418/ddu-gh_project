/**
 * Type functions that override certain properties
 * Reference: https://qiita.com/ibaragi/items/2a6412aeaca5703694b1
 */
export type Overwrite<T, U extends { [Key in keyof T]?: unknown }> =
  & Omit<
    T,
    keyof U
  >
  & U;
