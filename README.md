```
/!\ POC, NOT READY, DO NOT USE /!\
/!\ POC, NOT READY, DO NOT USE /!\
/!\ POC, NOT READY, DO NOT USE /!\
/!\ POC, NOT READY, DO NOT USE /!\
/!\ POC, NOT READY, DO NOT USE /!\
/!\ POC, NOT READY, DO NOT USE /!\
```

# jahia-cli

Command Line Interface to Jahia Administration panel

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/jahia-cli.svg)](https://npmjs.org/package/jahia-cli)
[![Downloads/week](https://img.shields.io/npm/dw/jahia-cli.svg)](https://npmjs.org/package/jahia-cli)
[![License](https://img.shields.io/npm/l/jahia-cli.svg)](https://github.com/jahia/jahia-cli/blob/master/package.json)

_This readme is being updated automatically during NPM publish, please look at the [NPM Page](https://www.npmjs.com/package/jahia-cli) for a full list of available commands._

<!-- toc -->

- [Introduction](#introduction)
- [Manifest](#manifest)
- [Usage](#usage)
- [Commands](#commands)
  <!-- tocstop -->

# Introduction

This tool provides an interface to automated the execution of certain tasks on a running Jahia instance. It can execute individual commands or receive a manifest detailing a list of commands to be executed in batch (sequentially).

It covers the following primary use cases:

- Operations on modules (build from Git, install, enable, disable)
- Operations on web projects (check status, import, install)
- Download an asset
- Execution of groovy scripts
- Execution of shell commands
- Wait for Jahia to be alive
- Misc utilities (docker, search, ...)

# Manifest

The primary objective of the manifest is to be able to declare, in a dedicated YML file, a set of actions to be executed sequentially, for example:

- Wait for Jahia to be up and runnning
- Download a module
- Install the module
- Configure it with Groovy
- Install a site
- Enable the module on the installed site

You can generate a blank manifest by running the command `jahia-cli manifest:create`

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

This readme is being updated automatically during NPM publish, please look at the [NPM Page](https://www.npmjs.com/package/jahia-cli) for a full list of available commands.

<!-- commandsstop -->
