import { flags } from '@oclif/command';
import { performance } from 'perf_hooks';

import * as fs from 'fs';

import Command from '../../base';

import { exit } from '@oclif/errors';

import getId from '../../components/manifest/id';
import fetchTags from '../../components/docker/fetch-tags';

export default class GetImgName extends Command {
  static description = 'Check if an image exists in docker hub';

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
    const { flags } = this.parse(GetImgName);
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
    if (manifestId === undefined) {
      console.log('ERROR: Unable to get manifest id');
      exit();
    }

    // For each image in the manifest, check if a corresponding image exists
    const allTags = await fetchTags(
      'https://registry.hub.docker.com/v2/jahia/qa-poc/tags/list',
      flags.dockerRegistryUsername,
      flags.dockerRegistryPassword,
    );
    console.log(allTags);

    const t1 = performance.now();
    console.log(
      'Total Exceution time: ' + Math.round(t1 - t0) + ' milliseconds.',
    );
  }
}
