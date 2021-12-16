import { flags } from '@oclif/command';
import { performance } from 'perf_hooks';
import * as fs from 'fs';

import Command from '../../base';

import graphqlClient from '../../utils/graphql/client';
import waitAlive from '../../utils/waitAlive';

import getModules from '../../components/modules/utils/get-modules';

import { exit } from '@oclif/errors';

export default class ModulesCheck extends Command {
  static description = 'Check if a module is installed by providing its id';

  static flags = {
    ...Command.flags,
    help: flags.help({ char: 'h' }),
    id: flags.string({ description: 'Module Id' }),
  };

  static args = [{ name: 'file' }];

  async run() {
    const { flags } = this.parse(ModulesCheck);
    const t0 = performance.now();

    if (flags.id === undefined) {
      console.log('ERROR: Please specify an id');
      exit();
    }

    const gClient = await graphqlClient(flags);
    await waitAlive(gClient, 500000); // Wait for 500s by default

    const installedModules = await getModules(
      flags.jahiaAdminUrl,
      flags.jahiaAdminUsername,
      flags.jahiaAdminPassword,
    );
    const reqModule = installedModules.find(m => m.id === flags.id);
    if (reqModule === undefined) {
      console.log('Module is NOT installed');
    }

    const t1 = performance.now();
    console.log(
      'Total Exceution time: ' + Math.round(t1 - t0) + ' milliseconds.',
    );
    this.log(JSON.stringify(reqModule));
    if (flags.output !== undefined) {
      fs.writeFileSync(flags.output, JSON.stringify(reqModule));
    }
  }
}
