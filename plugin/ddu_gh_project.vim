" ddu-source-gh_project
" Author: yasunori0418
" License: MIT

if exists('g:loaded_ddu_gh_project')
  finish
endif
let g:loaded_ddu_gh_project = 1

if !exists('g:ddu_gh_project_gh_cmd')
  let g:ddu_gh_project_gh_cmd = 'gh'
endif
