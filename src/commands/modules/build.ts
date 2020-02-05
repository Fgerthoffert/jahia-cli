import { flags } from '@oclif/command';
import { performance } from 'perf_hooks';
import * as fs from 'fs';

import Command from '../../base';

import { exit } from '@oclif/errors';

import buildModule from '../../components/modules/build';
import installModule from '../../components/modules/install';

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
    deploy: flags.string({
      required: false,
      default: 'true',
      description: 'Trigger a deployment of the module',
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

    const buildModules = await buildModule(
      flags.directory,
      flags.id,
      flags.branch,
      flags.repository,
    );

    if (JSON.parse(flags.deploy)) {
      for (const jahiaModule of buildModules) {
        // eslint-disable-next-line no-await-in-loop
        await installModule(flags, jahiaModule);
      }
    }

    const t1 = performance.now();
    console.log(
      'Total Exceution time: ' + Math.round(t1 - t0) + ' milliseconds.',
    );
  }
}
