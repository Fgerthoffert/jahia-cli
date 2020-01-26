import { flags } from '@oclif/command';
import { performance } from 'perf_hooks';

import Command from '../../base';

import launchPuppeteer from '../../utils/puppeteer/launch';
import closePuppeteer from '../../utils/puppeteer/close';
import graphqlClient from '../../utils/graphql/client';
import waitAlive from '../../utils/waitAlive';
import openJahia from '../../utils/openJahia';
import navPage from '../../utils/navPage';
import removeModule from '../../components/modules/remove';

import { exit } from '@oclif/errors';

export default class ModulesRemove extends Command {
  static description = 'Remove a module by id';

  static flags = {
    ...Command.flags,
    help: flags.help({ char: 'h' }),
    id: flags.string({ description: 'Module Id' }),
  };

  static args = [{ name: 'file' }];

  async run() {
    const { flags } = this.parse(ModulesRemove);
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

    await removeModule(jahiaPage, flags.id);
    await jahiaPage.close();
    await closePuppeteer(browser);

    const t1 = performance.now();
    console.log(
      'Total Exceution time: ' + Math.round(t1 - t0) + ' milliseconds.',
    );
  }
}
