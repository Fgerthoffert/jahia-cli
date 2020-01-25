import { flags } from '@oclif/command';
import { performance } from 'perf_hooks';
import * as fs from 'fs';

import Command from '../../base';

import launchPuppeteer from '../../utils/puppeteer/launch';
import closePuppeteer from '../../utils/puppeteer/close';
import graphqlClient from '../../utils/graphql/client';
import waitAlive from '../../utils/waitAlive';
import openJahia from '../../utils/openJahia';

import { exit } from '@oclif/errors';

export default class Modules extends Command {
  static description = 'Installs a Web Project';

  static flags = {
    ...Command.flags,
    help: flags.help({ char: 'h' }),
    file: flags.string({
      required: true,
      description:
        'Specify the filepath to the web project to be installed (zip on the filesystem)',
    }),
    sitekey: flags.string({
      required: true,
      description: 'Site Key of the web project to be installed',
    }),
  };

  static args = [{ name: 'file' }];

  async run() {
    const { flags } = this.parse(Modules);
    const t0 = performance.now();

    if (flags.file === undefined) {
      console.log('ERROR: Please specify a filepath');
      exit();
    }

    if (!fs.existsSync(flags.file)) {
      console.log('ERROR: Unable to access file: ' + flags.file);
      exit();
    }

    const gClient = await graphqlClient(flags);
    await waitAlive(gClient, 500000); // Wait for 500s by default
    const browser = await launchPuppeteer(!flags.debug);
    const jahiaPage = await openJahia(browser, flags);

    console.log('TO BE IMPLEMENTED');
    console.log('TO BE IMPLEMENTED');
    console.log('TO BE IMPLEMENTED');
    console.log('TO BE IMPLEMENTED');
    console.log('TO BE IMPLEMENTED');
    console.log('TO BE IMPLEMENTED');
    console.log('TO BE IMPLEMENTED');

    await jahiaPage.close();
    await closePuppeteer(browser);

    const t1 = performance.now();
    console.log(
      'Total Exceution time: ' + Math.round(t1 - t0) + ' milliseconds.',
    );
  }
}
