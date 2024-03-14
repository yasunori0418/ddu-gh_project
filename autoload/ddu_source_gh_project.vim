function! ddu_source_gh_project#create_scratch_buffer(name)
  const l:bufname = $'gh_project:{a:name}'->bufadd()->bufname()
  const l:bufnr = l:bufname->bufnr()
  call bufload(l:bufnr)
  call setbufvar(l:bufname, '&buftype', 'nofile')
  call setbufvar(l:bufname, '&bufhidden', 'hide')
  call setbufvar(l:bufname, '&swapfile', v:false)
  call setbufvar(l:bufname, '&filetype', 'toml')
  return #{ bufnr: l:bufnr, bufname: l:bufname }
endfunction

function! ddu_source_gh_project#open_buffer(bufnr, split_kind)
  if a:split_kind ==# 'horizontal'
    execute $'split +buffer{a:bufnr}'
  elseif a:split_kind ==# 'vertical'
    execute $'vsplit +buffer{a:bufnr}'
  endif
endfunction

function! ddu_source_gh_project#edit(bufnr)
  const l:burlines = getbufline(a:bufnr, 1, '$')
  call denops#notify('ddu-source-gh_project', 'edit', [l:burlines])
  execute $'bdelete{a:bufnr}'
endfunction
