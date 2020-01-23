import { flags } from '@oclif/command';
import { performance } from 'perf_hooks';
import * as loadYamlFile from 'load-yaml-file';
import * as fs from 'fs';

import Command from '../../base';

import launchPuppeteer from '../../utils/puppeteer/launch';
import closePuppeteer from '../../utils/puppeteer/close';
import graphqlClient from '../../utils/graphql/client';
import waitAlive from '../../utils/waitAlive';
import openJahia from '../../utils/openJahia';
import installModule from '../../components/modules/install';

import { exit } from '@oclif/errors';

export default class Modules extends Command {
  static description = 'Install modules from a manifest file';

  static flags = {
    ...Command.flags,
    help: flags.help({ char: 'h' }),
    manifest: flags.string({
      required: true,
      description: 'Specify the filepath to the manifest',
    }),
  };

  static args = [{ name: 'file' }];

  async run() {
    const { flags } = this.parse(Modules);
    const t0 = performance.now();

    if (flags.manifest === undefined) {
      console.log('ERROR: Please specify a manifest file');
      exit();
    }
    if (fs.existsSync(flags.manifest) === false) {
      console.log('ERROR: Unable to locate manifest file');
      exit();
    }

    const manifestContent = await loadYamlFile(flags.manifest);
    if (
      manifestContent.modules !== undefined &&
      manifestContent.modules.length > 0
    ) {
      const gClient = await graphqlClient(flags);
      await waitAlive(gClient);
      const browser = await launchPuppeteer(!flags.debug);
      const jahiaPage = await openJahia(browser, flags);

      for (const jahiaModule of manifestContent.modules) {
        if (fs.existsSync(jahiaModule.filepath) === false) {
          console.log('ERROR: Unable to access file: ' + jahiaModule.filepath);
          exit();
        }
        // eslint-disable-next-line no-await-in-loop
        await installModule(
          jahiaPage,
          flags,
          jahiaModule.filepath,
          jahiaModule.id,
          jahiaModule.version,
        );
      }

      await jahiaPage.close();
      await closePuppeteer(browser);
    } else {
      console.log('Manifest is empty and does not contain any modules');
    }
    const t1 = performance.now();
    console.log(
      'Total Exceution time: ' + Math.round(t1 - t0) + ' milliseconds.',
    );
  }
}
