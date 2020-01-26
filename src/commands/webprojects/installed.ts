import { flags } from '@oclif/command';

import { performance } from 'perf_hooks';

import Command from '../../base';

import launchPuppeteer from '../../utils/puppeteer/launch';
import closePuppeteer from '../../utils/puppeteer/close';
import graphqlClient from '../../utils/graphql/client';
import waitAlive from '../../utils/waitAlive';
import openJahia from '../../utils/openJahia';
import navPage from '../../utils/navPage';

import getWebprojects from '../../components/webprojects/utils/get-webprojects';

export default class WebprojectsInstalled extends Command {
  static description = 'List installed Web Projects';

  static flags = {
    ...Command.flags,
    help: flags.help({ char: 'h' }),
  };

  static args = [{ name: 'file' }];

  async run() {
    const { flags } = this.parse(WebprojectsInstalled);
    const t0 = performance.now();

    const gClient = await graphqlClient(flags);
    await waitAlive(gClient, 500000); // Wait for 500s by default
    const browser = await launchPuppeteer(!flags.debug);
    const jahiaPage = await openJahia(browser, flags);

    await navPage(
      jahiaPage,
      flags.jahiaAdminUrl +
        '/cms/adminframe/default/en/settings.webProjectSettings.html',
    );

    const installedWebprojects = await getWebprojects(jahiaPage);
    console.log(installedWebprojects);

    await jahiaPage.close();
    await closePuppeteer(browser);

    const t1 = performance.now();
    console.log(
      'Total Exceution time: ' + Math.round(t1 - t0) + ' milliseconds.',
    );
    return JSON.stringify(installedWebprojects);
  }
}
