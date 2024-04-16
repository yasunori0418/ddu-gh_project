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
  \ 'Shougo/ddu-source-action',
  \ 'yasunori0418/ddu-gh_project',
\ ]

for plugin in s:plugins
  let s:plugin_path = $'{s:plugins_dir}/{plugin}'
  call system($'git clone https://github.com/{plugin} {s:plugin_path}')
  execute $'set runtimepath+={s:plugin_path}'
endfor

" ddu plugins setup

call ddu#custom#patch_global(#{
  \ ui: 'ff',
  \ kindOptions: #{
    \ action: #{
      \ defaultAction: 'do',
    \ },
  \ },
  \ sourceOptions: #{
    \ _: #{
      \ matchers: ['matcher_substring'],
    \ },
    \ gh_project: #{
      \ defaultAction: 'openTaskList',
    \ },
  \ },
\ })

call ddu#custom#patch_local('gh_project', #{
  \ sources: [
    \ #{
      \ name: 'gh_project',
      \ params: #{
        \ owner: '@me',
      \ },
    \ },
  \ ],
\ })

" please change projectId and projectNumber with your account project of
" things.
call ddu#custom#patch_local('gh_project_task', #{
  \ sources: [
    \ #{
      \ name: 'gh_project_list',
      \ params: #{
        \ owner: '@me',
        \ projectId: 'PVT_kwHOBHUnA84ASqYZ',
        \ projectNumber: 4,
      \ },
    \ },
  \ ],
\ })

function! s:ddu_ff_keymaps() abort
  nnoremap <buffer> <CR>
  \ <Cmd>call ddu#ui#do_action('itemAction')<CR>
  nnoremap <buffer> a
  \ <Cmd>call ddu#ui#do_action('chooseAction')<CR>
  nnoremap <buffer> i
  \ <Cmd>call ddu#ui#do_action('openFilterWindow')<CR>
  nnoremap <buffer> q
  \ <Cmd>call ddu#ui#do_action('quit')<CR>
endfunction

function! s:ddu_ff_filter_keymaps() abort
  inoremap <buffer> <CR>
  \ <Esc><Cmd>call ddu#ui#do_action('closeFilterWindow')<CR>
  nnoremap <buffer> <CR>
  \ <Cmd>call ddu#ui#do_action('closeFilterWindow')<CR>
endfunction

autocmd FileType ddu-ff call s:ddu_ff_keymaps()
autocmd FileType ddu-ff-filter call s:ddu_ff_filter_keymaps()

command! ProjectList call ddu#start({'name': 'gh_project'})
command! TaskList call ddu#start({'name': 'gh_project_task'})
