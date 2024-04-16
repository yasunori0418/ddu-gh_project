set nocompatible
if !executable('gh')
  echomsg 'not found gh command'
  finish
endif
const s:sfile_dir = expand('<sfile>:p:h')
const s:plugins_dir = $'{s:sfile_dir}/plug'
if !isdirectory(s:plugins_dir)
  call mkdir(s:plugins_dir, 'p')
endif

const s:plugins = [
  \ 'vim-denops/denops.vim',
  \ 'Shougo/ddu.vim',
  \ 'Shougo/ddu-ui-ff',
  \ 'Shougo/ddu-filter-matcher_substring',
  \ 'yasunori0418/ddu-gh_project',
\ ]

for plugin in s:plugins
  let s:plugin_path = $'{s:plugins_dir}/{plugin}'
  call system($'git clone https://github.com/{plugin} {s:plugin_path}')
  execute $'set runtimepath+={s:plugin_path}'
endfor
