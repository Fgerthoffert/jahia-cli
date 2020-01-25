import { flags } from '@oclif/command';
import { performance } from 'perf_hooks';

import Command from '../../base';

import launchPuppeteer from '../../utils/puppeteer/launch';
import closePuppeteer from '../../utils/puppeteer/close';
import graphqlClient from '../../utils/graphql/client';
import waitAlive from '../../utils/waitAlive';
import openJahia from '../../utils/openJahia';

import importWebproject from '../../components/webprojects/import';

import { exit } from '@oclif/errors';

export default class Modules extends Command {
  static description = 'Import a prepackaged project';

  static flags = {
    ...Command.flags,
    help: flags.help({ char: 'h' }),
    sitekey: flags.string({
      required: true,
      description: 'Site Key of the project to be imported',
    }),
  };

  static args = [{ name: 'file' }];

  async run() {
    const { flags } = this.parse(Modules);
    const t0 = performance.now();

    if (flags.sitekey === undefined) {
      console.log('ERROR: Please specify a project site key');
      exit();
    }

    const gClient = await graphqlClient(flags);
    await waitAlive(gClient, 500000); // Wait for 500s by default
    const browser = await launchPuppeteer(!flags.debug);
    const jahiaPage = await openJahia(browser, flags);

    await importWebproject(jahiaPage, flags, flags.sitekey);

    await jahiaPage.close();
    await closePuppeteer(browser);

    const t1 = performance.now();
    console.log(
      'Total Exceution time: ' + Math.round(t1 - t0) + ' milliseconds.',
    );
  }
}
