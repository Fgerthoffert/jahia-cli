import { flags } from '@oclif/command';
import { performance } from 'perf_hooks';

import * as fs from 'fs';

import Command from '../../base';

import { exit } from '@oclif/errors';
import * as loadYamlFile from 'load-yaml-file';
import * as hash from 'object-hash';

export default class Modules extends Command {
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

    const filepathname = flags.manifest;
    if (fs.existsSync(filepathname) === true) {
      const manifestContent = await loadYamlFile(flags.manifest);
      const manifestHash = hash(manifestContent);
      console.log('Manifest Hash is: ' + manifestHash);
    } else {
      console.log('ERROR: Could not fine manifest file: ' + filepathname);
    }

    const t1 = performance.now();
    console.log(
      'Total Exceution time: ' + Math.round(t1 - t0) + ' milliseconds.',
    );
  }
}
