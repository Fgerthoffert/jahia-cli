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

import importPrepackagedWebproject from '../../components/webprojects/importprepackaged';
import importFileWebproject from '../../components/webprojects/importfile';

import { exit } from '@oclif/errors';

export default class Modules extends Command {
  static description = 'Create a site by importing a prepackaged project';

  static flags = {
    ...Command.flags,
    help: flags.help({ char: 'h' }),
    type: flags.string({
      required: true,
      options: ['file', 'prepackaged'],
      default: 'prepackaged',
      description:
        'Specify if you want to import by file or by prepackaged site',
    }),
    sitekey: flags.string({
      required: true,
      description: 'Site Key of the project to be imported',
    }),
    file: flags.string({
      description: 'Filepath of the archive to be imported',
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

    if (flags.type === 'file' && flags.file === undefined) {
      console.log('ERROR: Please specify a file to be imported');
      exit();
    }

    if (
      flags.type === 'file' &&
      flags.file !== undefined &&
      fs.existsSync(flags.file) === false
    ) {
      console.log('ERROR: Unable to find the specified file');
      exit();
    }

    const gClient = await graphqlClient(flags);
    await waitAlive(gClient, 500000); // Wait for 500s by default
    const browser = await launchPuppeteer(!flags.debug);
    const jahiaPage = await openJahia(browser, flags);

    await navPage(
      jahiaPage,
      flags.jahiaAdminUrl +
        '/cms/adminframe/default/en/settings.webProjectSettings.html',
    );

    if (flags.type === 'prepackaged') {
      await importPrepackagedWebproject(jahiaPage, flags.sitekey);
    } else if (flags.file !== undefined && flags.type === 'file') {
      await importFileWebproject(jahiaPage, flags.sitekey, flags.file);
    }

    await jahiaPage.close();
    await closePuppeteer(browser);

    const t1 = performance.now();
    console.log(
      'Total Exceution time: ' + Math.round(t1 - t0) + ' milliseconds.',
    );
  }
}
