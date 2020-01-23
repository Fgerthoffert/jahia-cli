import { flags } from '@oclif/command';
import { performance } from 'perf_hooks';
import * as loadYamlFile from 'load-yaml-file';
import * as download from 'download';
import * as fs from 'fs';

import Command from '../../base';

import launchPuppeteer from '../../utils/puppeteer/launch';
import closePuppeteer from '../../utils/puppeteer/close';
import graphqlClient from '../../utils/graphql/client';
import waitAlive from '../../utils/waitAlive';
import openJahia from '../../utils/openJahia';

import { exit } from '@oclif/errors';

export default class Modules extends Command {
  static description =
    'Download assets from a manifest to the local filesystem';

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
      console.log('ERROR: Please specify a filepath');
      exit();
    }
    const manifestContent = await loadYamlFile(flags.manifest);
    if (
      manifestContent.assets !== undefined &&
      manifestContent.assets.length > 0
    ) {
      const gClient = await graphqlClient(flags);
      await waitAlive(gClient);
      const browser = await launchPuppeteer(!flags.debug);
      const jahiaPage = await openJahia(browser, flags);

      for (const jahiaAsset of manifestContent.assets) {
        if (jahiaAsset.type === 'http') {
          console.log(
            'Loading: ' + jahiaAsset.source + ' into: ' + jahiaAsset.filepath,
          );
          // eslint-disable-next-line no-await-in-loop
          await download(jahiaAsset.source).then(data => {
            fs.writeFileSync(jahiaAsset.filepath, data);
          });
        } else {
          console.log('WARNING: Asset type not supported');
        }
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
