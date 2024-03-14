import { autocmd, Denops, fn } from "./deps.ts";
import { BufInfo } from "./type/task.ts";

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

/**
 * Reference: https://github.com/kyoh86/denops-util/blob/622d3b7/command.ts#L36
 */
export function cmd(
  command: string | URL,
  options?: Omit<Deno.CommandOptions, "stdin" | "stderr" | "stdout">,
) {
  const { stdout } = new Deno.Command(command, {
    ...options,
    stdin: "null",
    stderr: "null",
    stdout: "piped",
  }).spawn();

  return {
    pipeOut: stdout.pipeThrough(new TextDecoderStream()),
    finalize: async () => {
      await stdout.cancel();
    },
  };
}

export function defineAutocmd(
  denops: Denops,
  bufnr: number,
  ctx: string,
) {
  autocmd.define(denops, "QuitPre", `<buffer=${bufnr}>`, ctx, {
    once: true,
  });
}

/**
 * call ddu_source_gh_project#create_scratch_buffer
 */
export async function createScratchBuffer(
  denops: Denops,
  name: string,
  lines: string[],
): Promise<BufInfo> {
  const bufInfo = await denops.call(
    "ddu_source_gh_project#create_scratch_buffer",
    name,
  ) as BufInfo;
  await fn.appendbufline(
    denops,
    bufInfo.bufname,
    0,
    lines,
  );
  return Promise.resolve(bufInfo);
}
