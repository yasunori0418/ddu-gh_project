/**
 * 特定のプロパティを上書きする型関数
 * Reference: https://qiita.com/ibaragi/items/2a6412aeaca5703694b1
 */
export type Overwrite<T, U extends { [Key in keyof T]?: unknown }> =
  & Omit<
    T,
    keyof U
  >
  & U;
