import { flags } from '@oclif/command';
import { performance } from 'perf_hooks';
import * as loadYamlFile from 'load-yaml-file';

import * as fs from 'fs';

import Command from '../../base';

import { exit } from '@oclif/errors';

import getId from '../../components/manifest/id';
import getToken from '../../components/docker/get-token';
import getEndpoint from '../../components/docker/get-endpoint';

export default class GetImgName extends Command {
  static description =
    'Returns the docker image name to be used based on manifest content and hash';

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
    const userToken = await getToken(
      flags.dockerRegistryUsername,
      flags.dockerRegistryPassword,
    );
    if (userToken === null) {
      console.log('ERROR: Unable to get token from Docker Hub (login failed)');
      exit();
    } else {
      const manifestContent = await loadYamlFile(flags.manifest);

      const allTags = await getEndpoint(
        'https://hub.docker.com/v2/repositories/' +
          manifestContent.docker.repository +
          '/tags',
        userToken,
      );
      console.log(allTags);
      const repoTags = allTags.map((t: { name: string }) => t.name);

      const images = [];
      for (const dockerImage of manifestContent.docker.images) {
        const searchTag = dockerImage.prefix + '-' + manifestId;
        if (repoTags.includes(searchTag)) {
          images.push({
            ...dockerImage,
            destination: manifestContent.docker.repositori + ':' + searchTag,
          });
        } else {
          images.push({ ...dockerImage, destination: dockerImage.source });
        }
      }
      console.log(images);
      const t1 = performance.now();
      console.log(
        'Total Exceution time: ' + Math.round(t1 - t0) + ' milliseconds.',
      );
      this.log(JSON.stringify(images));
      if (flags.output !== undefined) {
        fs.writeFileSync(flags.output, JSON.stringify(images));
      }
    }
  }
}
