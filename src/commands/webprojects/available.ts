import { flags } from '@oclif/command';

import { performance } from 'perf_hooks';
import * as fs from 'fs';

import Command from '../../base';

import launchPuppeteer from '../../utils/puppeteer/launch';
import closePuppeteer from '../../utils/puppeteer/close';
import graphqlClient from '../../utils/graphql/client';
import waitAlive from '../../utils/waitAlive';
import openJahia from '../../utils/openJahia';
import navPage from '../../utils/navPage';

import getAvailable from '../../components/webprojects/utils/get-available';

export default class WebprojectsAvailable extends Command {
  static description = 'List available prepackaged projects';

  static flags = {
    ...Command.flags,
    help: flags.help({ char: 'h' }),
  };

  static args = [{ name: 'file' }];

  async run() {
    const { flags } = this.parse(WebprojectsAvailable);
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

    const availableWebprojects = await getAvailable(jahiaPage);
    await jahiaPage.close();
    await closePuppeteer(browser);

    const t1 = performance.now();
    console.log(
      'Total Exceution time: ' + Math.round(t1 - t0) + ' milliseconds.',
    );
    console.log(JSON.stringify(availableWebprojects));
    if (flags.output !== undefined) {
      fs.writeFileSync(
        flags.output,
        JSON.stringify({ id: availableWebprojects }),
      );
    }
  }
}
