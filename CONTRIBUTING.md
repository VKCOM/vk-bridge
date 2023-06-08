# How to Contribute

## Reporting Issues and Asking Questions

Before opening an issue, please search the [issue tracker](https://github.com/VKCOM/vk-bridge/issues) to make sure your issue hasn't already been reported.

## Contribution Prerequisites

- You have [Node](https://nodejs.org/en) installed at LTS and [Yarn](https://yarnpkg.com/) at v1.2.0+.
- You are familiar with [Yarn >= 2](https://yarnpkg.com).
- You are familiar with [Workspaces](https://yarnpkg.com/features/workspaces).
- You are familiar with [Git](https://git-scm.com/).

## Development

### Prepare your environment

Fork the repo and upload them to local your machine.

```sh
git clone https://github.com/YOUR_USERNAME/vk-bridge.git
```

Install dependencies.

```sh
yarn install
```

### Next

Go to the root `package.json` to see the available commands.

There are basic commands you need to know:

- `yarn run build`
- `yarn run test`
- `yarn run lint`

You are ready! Do something cool!

You could see [issue tracker](https://github.com/VKCOM/vk-bridge/issues) to find an interesting issue.

#### If you want to edit CI

> **Note**
>
> Please read [PUBLISHING.md](./PUBLISHING.md) before.

For test `.github/actions/**` or `.github/workflows/**` changes you should:

1. Open PR;
1. Create a new test branch with your working branch (example, `test/pr42`);
1. Make random change and push it;
1. Open a new PR to your PR of working branch;
1. CI will be run with your changes.

This is because we use [pull_request_target](https://docs.github.com/en/actions/using-workflows/events-that-trigger-workflows#pull_request_target)
event for run PR workflow.

### Prepare for Pull Request

Make sure you have completed the following steps:

1. You have written tests for a new feature or updated current tests if necessary.
1. You have verified that the results of the `yarn run test` and `yarn run lint` are valid.

That's it. Thanks!
