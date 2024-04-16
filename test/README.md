# Usage test script

Build the minimum configuration required to run ddu-gh_project.
Inside the test directory, run the following command.

```bash
vim -u .vimrc
```

![output](https://github.com/yasunori0418/ddu-gh_project/assets/74786563/5479191d-efc4-4383-887f-547d7162efe4)


## Commands

This minimal configuration defines commands to run `gh_project` and `gh_project_task`.

### ProjectList

Displays a list of Projects created in your GitHub account.

```vim
:ProjectList
```

#### keymap

key, description
`<CR>`, Opens the `TaskList` for the selected project.

### TaskList

> [!WARNING]
> For test behavior, the `ProjectNumber` and `ProjectId` of the GitHubProject I using are set.
> When using, please change `ProjectNumber` and `ProjectId` set in the code.
> 
> [change area](./.vimrc#L65-L66)

```diff
 " please change projectId and projectNumber with your account project of
 " things.
 call ddu#custom#patch_local('gh_project_task', #{
   \ sources: [
     \ #{
       \ name: 'gh_project_task',
       \ params: #{
         \ owner: '@me',
+        \ projectId: 'PVT_kwHOBHUnA84ASqYZ',
+        \ projectNumber: 4,
       \ },
     \ },
   \ ],
 \ })
```


```vim
:TaskList
```

#### keymap

|key   |description                                                       |
|------|------------------------------------------------------------------|
|`a`   |Displays the action selection screen for the task.                |
|`<CR>`|Executes the selected action from the action list displayed by `a`|
