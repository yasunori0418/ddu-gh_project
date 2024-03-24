import { autocmd, Denops, fn, TextLineStream, vars, echoerr } from "./deps.ts";
import { BufInfo } from "./type/common.ts";

/**
 * Reference: https://github.com/kyoh86/denops-util/blob/622d3b7/command.ts#L36
 */
export async function cmd(
  denops: Denops,
  command: string | URL,
  options?: Omit<Deno.CommandOptions, "stdin" | "stderr" | "stdout">,
) {
  const { stdout, stderr } = new Deno.Command(command, {
    ...options,
    stdin: "null",
    stderr: "piped",
    stdout: "piped",
  }).spawn();

  await stderr
    .pipeThrough(new TextDecoderStream())
    .pipeThrough(new TextLineStream())
    .pipeTo(
      new WritableStream({
        write: (chunk) => {
          echoerr(denops, chunk)
        },
      }),
    );

  return {
    pipeOut: stdout.pipeThrough(new TextDecoderStream()),
    finalize: async () => {
      await stdout.cancel();
      await stdout.cancel();
    },
  };
}

export function quitPreBufferAutocmd(
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
    "ddu_gh_project#create_scratch_buffer",
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

export async function getGHCmd(denops: Denops): Promise<string> {
  return Promise.resolve(
    await vars.g.get(denops, "ddu_gh_project_gh_cmd") as string,
  );
}
