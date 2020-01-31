import { flags } from '@oclif/command';
import { performance } from 'perf_hooks';

import Command from '../../base';

import launchPuppeteer from '../../utils/puppeteer/launch';
import closePuppeteer from '../../utils/puppeteer/close';
import graphqlClient from '../../utils/graphql/client';
import waitAlive from '../../utils/waitAlive';
import openJahia from '../../utils/openJahia';
import navPage from '../../utils/navPage';

import { sleep } from '../../utils'

export default class SearchStartindex extends Command {
  static description = 'Trigger the indexing job once the site has been imported';

  static flags = {
    ...Command.flags,
    help: flags.help({ char: 'h' }),
  };

  static args = [{ name: 'file' }];

  async run() {
    const { flags } = this.parse(SearchStartindex);
    const t0 = performance.now();

    const gClient = await graphqlClient(flags);
    await waitAlive(gClient, 500000); // Wait for 500s by default
    const browser = await launchPuppeteer(!flags.debug);
    const jahiaPage = await openJahia(browser, flags);

    await navPage(
      jahiaPage,
      flags.jahiaAdminUrl +
        '/cms/adminframe/default/en/settings.augmentedsearch.html',
    );

    await jahiaPage.select('#esConnectionId', 'augmented-search-conn');
    const saveButton = await jahiaPage.$('button[name="_eventId_save"]');
    await Promise.all([jahiaPage.waitForNavigation(), saveButton.click()]);

    await sleep(1000);
    const indexButton = await jahiaPage.$('button[name="_eventId_reindex"]');
    await Promise.all([jahiaPage.waitForNavigation(), indexButton.click()]);
    await sleep(500);

    await jahiaPage.close();
    await closePuppeteer(browser);

    const t1 = performance.now();
    console.log(
      'Total Exceution time: ' + Math.round(t1 - t0) + ' milliseconds.',
    );
  }
}
