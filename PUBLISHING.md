# Publishing

## TL;DR

Package publishing is done using the only one command

```
yarn publish
```

## Detailed process

When the `yarn publish` command is executed, the `build` command specified in `prepublishOnly` is automatically called. It builds the package in three module systems: CommonJS, ES and UMD. Assembly files are located in the `dist/` directory. After completing the building, you will need to enter in console a new version of the package for publication. You can also manually upgrade the version in `package.json` in advance and skip entering the version in the console.

If you choose the first variant, after publication in the repository, a local commit will be created with the updated `package.json` where the new version will be indicated, as well as a tag with the new version. The tag and the updated branch must be pushed to the remote repository.
