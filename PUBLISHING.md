# Publishing

Run **Publish** or **Publish pre-relase** action in https://github.com/VKCOM/vk-bridge/actions page.

See [.github/workflows/publish.yml](./.github/workflows/publish.yml) and
[.github/workflows/publish_release.yml](./.github/workflows/publish_release.yml) workflow files for
details.

## F.A.Q.

### What's the `g:npm:version` script in root [package.json](./package.json)?

Since `yarn >= 2`, the `version` command has been limited. For workaround we use
[`npm version`](https://docs.npmjs.com/cli/v8/commands/npm-version).

We **disable** next flags for exclude NPM side effects:

- [workspaces-update](https://docs.npmjs.com/cli/v8/commands/npm-version#workspaces-update)
- [commit-hooks](https://docs.npmjs.com/cli/v8/commands/npm-version#commit-hooks)
- [git-tag-version](https://docs.npmjs.com/cli/v8/commands/npm-version#git-tag-version)

About `cd $INIT_CWD` see [How to share scripts between workspaces?](https://yarnpkg.com/getting-started/qa#how-to-share-scripts-between-workspaces).

### Which lifecycle scripts I can use for a package?

You should use [Yarn Lifecycle Scripts](https://yarnpkg.com/advanced/lifecycle-scripts).
