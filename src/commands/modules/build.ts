import { flags } from '@oclif/command';
import { performance } from 'perf_hooks';
import * as fs from 'fs';

import Command from '../../base';

import { exit } from '@oclif/errors';

import buildModule from '../../components/modules/build';

export default class ModulesBuild extends Command {
  static description = 'Installs a module';

  static flags = {
    ...Command.flags,
    help: flags.help({ char: 'h' }),
    directory: flags.string({
      required: true,
      description: 'Directory to use as a base for storing the build artifacts',
    }),
    file: flags.string({
      //      required: true,
      description:
        'Specify the filepath to the module to be installed (jar on filesystem)',
    }),
    repository: flags.string({
      required: true,
      description: 'Repository to clone',
      default: 'git@github.com:Jahia/LDAP-provider.git',
    }),
    id: flags.string({
      required: true,
      default: 'ldap',
      description: 'Module Id',
    }),
    branch: flags.string({
      required: true,
      default: 'master',
      description: 'Git repository branch',
    }),
    filpath: flags.string({
      required: true,
      default: '/tmp/abcldap-4.0.0-SNAPSHOT.jar',
      description: 'Filename of the artifact built',
    }),
  };

  static args = [{ name: 'file' }];

  async run() {
    const { flags } = this.parse(ModulesBuild);
    const t0 = performance.now();

    if (!fs.existsSync(flags.directory)) {
      console.log('ERROR: Unable to access directory: ' + flags.directory);
      exit();
    }

    await buildModule(
      flags.directory,
      flags.id,
      flags.branch,
      flags.repository,
      flags.filpath,
    );

    const t1 = performance.now();
    console.log(
      'Total Exceution time: ' + Math.round(t1 - t0) + ' milliseconds.',
    );
  }
}
