# jahia-cli

Command Line Interface to Jahia Administration panel

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/jahia-cli.svg)](https://npmjs.org/package/jahia-cli)
[![Downloads/week](https://img.shields.io/npm/dw/jahia-cli.svg)](https://npmjs.org/package/jahia-cli)
[![License](https://img.shields.io/npm/l/jahia-cli.svg)](https://github.com/jahia/jahia-cli/blob/master/package.json)

<!-- toc -->

- [Usage](#usage)
- [Commands](#commands)
  <!-- tocstop -->

# Usage

<!-- usage -->

```sh-session
$ npm install -g jahia-cli
$ jahia-cli COMMAND
running command...
$ jahia-cli (-v|--version|version)
jahia-cli/0.0.1 darwin-x64 node-v13.5.0
$ jahia-cli --help [COMMAND]
USAGE
  $ jahia-cli COMMAND
...
```

<!-- usagestop -->

# Commands

<!-- commands -->

- [`jahia-cli hello [FILE]`](#jahia-cli-hello-file)
- [`jahia-cli help [COMMAND]`](#jahia-cli-help-command)
- [`jahia-cli module [FILE]`](#jahia-cli-module-file)

## `jahia-cli hello [FILE]`

describe the command here

```
USAGE
  $ jahia-cli hello [FILE]

OPTIONS
  -f, --force
  -h, --help       show CLI help
  -n, --name=name  name to print

EXAMPLE
  $ jahia-cli hello
  hello world from ./src/hello.ts!
```

_See code: [src/commands/hello.ts](https://github.com/jahia/jahia-cli/blob/v0.0.1/src/commands/hello.ts)_

## `jahia-cli help [COMMAND]`

display help for jahia-cli

```
USAGE
  $ jahia-cli help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v2.2.3/src/commands/help.ts)_

## `jahia-cli module [FILE]`

describe the command here

```
USAGE
  $ jahia-cli module [FILE]

OPTIONS
  -f, --force
  -h, --help       show CLI help
  -n, --name=name  name to print
```

_See code: [src/commands/module.ts](https://github.com/jahia/jahia-cli/blob/v0.0.1/src/commands/module.ts)_

<!-- commandsstop -->
