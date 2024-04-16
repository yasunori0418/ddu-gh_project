# Usage test script

Build the minimum configuration required to run ddu-gh_project.
Inside the test directory, run the following command.

```bash
vim -u .vimrc
```

## Commands

This minimal configuration defines commands to run `gh_project` and `gh_project_task`.

### ProjectList

Displays a list of Projects created in your GitHub account.

```vimscript
:ProjectList
```

#### keymap

key, description
`<CR>`, Opens the `TaskList` for the selected project.

### TaskList

> [!WARNING]
> For test behavior, the `ProjectNumber` and `ProjectId` of the GitHubProject I using are set.
> When using, please change `ProjectNumber` and `ProjectId` set in the code.

```vimscript
:TaskList
```

#### keymap

|key   |description                                                       |
|------|------------------------------------------------------------------|
|`a`   |Displays the action selection screen for the task.                |
|`<CR>`|Executes the selected action from the action list displayed by `a`|
