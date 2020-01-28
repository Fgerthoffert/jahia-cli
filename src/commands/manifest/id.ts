import { flags } from '@oclif/command';
import { performance } from 'perf_hooks';

import * as fs from 'fs';

import Command from '../../base';

import { exit } from '@oclif/errors';

import getId from '../../components/manifest/id';

export default class ManifestId extends Command {
  static description = 'Generates a unique ID from a manifest content';

  static flags = {
    ...Command.flags,
    help: flags.help({ char: 'h' }),
    manifest: flags.string({
      required: true,
      description: 'Specify the directory to generate the manifest file into',
    }),
  };

  static args = [{ name: 'file' }];

  async run() {
    const { flags } = this.parse(ManifestId);
    const t0 = performance.now();

    if (flags.manifest === undefined) {
      console.log('ERROR: Please specify a manifest file');
      exit();
    }
    if (fs.existsSync(flags.manifest) === false) {
      console.log('ERROR: Unable to locate manifest file');
      exit();
    }

    const manifestId = await getId(flags.manifest);
    const t1 = performance.now();
    console.log(
      'Total Exceution time: ' + Math.round(t1 - t0) + ' milliseconds.',
    );
    if (flags.output !== undefined) {
      fs.writeFileSync(flags.output, JSON.stringify({ id: manifestId }));
    }
  }
}
