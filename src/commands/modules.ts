import { flags } from '@oclif/command';
import { performance } from 'perf_hooks';
import * as puppeteer from 'puppeteer';

import Command from '../base';

import gqlClient from '../utils/gqlClient';
import waitAlive from '../utils/waitAlive';
import openJahia from '../utils/openJahia';
import closeJahia from '../utils/closeJahia';
import installModule from '../components/modules/install';
import removeModule from '../components/modules/remove';
import checkModule from '../components/modules/check';

import { exit } from '@oclif/errors';

export default class Modules extends Command {
  static description = 'Perform operation on Jahia modules';

  static flags = {
    ...Command.flags,
    help: flags.help({ char: 'h' }),
    install: flags.boolean({ char: 'a', description: 'Install a module' }),
    remove: flags.boolean({ char: 'r', description: 'Add a module by id' }),
    file: flags.string({
      description:
        'Specify the filepath to the module to be installed (jar on filesystem)',
    }),
    id: flags.string({ description: 'Module Id' }),
    version: flags.string({
      description: 'Specify the module version to be installed',
    }),
    check: flags.boolean({
      char: 'c',
      description: 'Check if a module is installed',
    }),
  };

  static args = [{ name: 'file' }];

  async run() {
    const { flags } = this.parse(Modules);
    const t0 = performance.now();

    if (flags.file === undefined && flags.install === true) {
      console.log('ERROR: Please specify a filepath');
      exit();
    }

    const gClient = await gqlClient(flags);
    await waitAlive(gClient);
    const browser = await puppeteer.launch({
      headless: !flags.debug,
      args: ['--disable-dev-shm-usage'],
    });

    const jahiaPage = await openJahia(browser, flags);

    if (flags.install && flags.file && flags.id) {
      await installModule(
        jahiaPage,
        flags,
        flags.file,
        flags.id,
        flags.version,
      );
    } else if (flags.remove && flags.id) {
      await removeModule(jahiaPage, flags, flags.id);
    } else if (flags.check && flags.id) {
      const installedModule = await checkModule(jahiaPage, flags, flags.id);
      console.log(installedModule);
    }

    await jahiaPage.close();
    await closeJahia(browser);

    const t1 = performance.now();
    console.log(
      'Total Exceution time: ' + Math.round(t1 - t0) + ' milliseconds.',
    );
  }
}
