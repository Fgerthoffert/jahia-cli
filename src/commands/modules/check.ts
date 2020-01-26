import { flags } from '@oclif/command';
import { performance } from 'perf_hooks';

import Command from '../../base';

import launchPuppeteer from '../../utils/puppeteer/launch';
import closePuppeteer from '../../utils/puppeteer/close';
import graphqlClient from '../../utils/graphql/client';
import waitAlive from '../../utils/waitAlive';
import openJahia from '../../utils/openJahia';
import navPage from '../../utils/navPage';

import getModule from '../../components/modules/utils/get-module';

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
    const browser = await launchPuppeteer(!flags.debug);
    const jahiaPage = await openJahia(browser, flags);

    await navPage(
      jahiaPage,
      flags.jahiaAdminUrl +
        '/cms/adminframe/default/en/settings.manageModules.html',
    );

    const installedModule = await getModule(jahiaPage, flags.id);

    await jahiaPage.close();
    await closePuppeteer(browser);

    console.log(installedModule);

    const t1 = performance.now();
    console.log(
      'Total Exceution time: ' + Math.round(t1 - t0) + ' milliseconds.',
    );
  }
}
