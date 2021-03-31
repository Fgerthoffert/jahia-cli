import { flags } from '@oclif/command';
import { performance } from 'perf_hooks';

import * as fs from 'fs';
import * as jsYaml from 'js-yaml';

import Command from '../../base';

import { exit } from '@oclif/errors';

export default class ManifestCreate extends Command {
  static description = 'Creates an empty manifest file';

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
    const { flags } = this.parse(ManifestCreate);
    const t0 = performance.now();

    if (flags.manifest === undefined) {
      console.log('ERROR: Please specify a filepath to save the manifest to');
      exit();
    }

    const defaultManifest = {
      version: 1,
      jobs: [
        {
          type: 'build',
          repository: 'git@github.com:Jahia/LDAP-provider.git',
          branch: 'master',
          directory: '/tmp/',
          id: 'ldap',
          deploy: true,
        },
        {
          type: 'build',
          repository: 'git@github.com:Jahia/LDAP-provider.git',
          branch: 'master',
          gitPath: 'some-subfolder/where/pom/is/located',
          directory: '/tmp/',
          id: 'ldap',
          deploy: true,
        },
        {
          type: 'asset',
          fetch: 'http',
          source:
            'https://store.jahia.com/cms/mavenproxy/private-app-store/org/jahia/modules/popperjs/1.16.0/popperjs-1.16.0.jar',
          filepath: '/tmp/popperjs-1.16.0.jar',
        },
        {
          type: 'module',
          id: 'popperjs',
          filepath: '/tmp/popperjs-1.16.0.jar',
        },
        {
          type: 'modulesite',
          action: 'enable',
          siteId: 'digitall',
          moduleId: 'popperjs',
        },
        {
          type: 'asset',
          fetch: 'http',
          source:
            'https://store.jahia.com/cms/mavenproxy/private-app-store/org/jahia/modules/highlightjs/9.12.1/highlightjs-9.12.1.jar',
          filepath: '/tmp/highlightjs-9.12.1.jar',
        },
        {
          type: 'module',
          id: 'highlightjs',
          filepath: '/tmp/highlightjs-9.12.1.jar',
        },
        {
          type: 'asset',
          fetch: 'http',
          source:
            'https://store.jahia.com/cms/mavenproxy/private-app-store/org/jahia/modules/addstuff/1.3/addstuff-1.3.jar',
          filepath: '/tmp/addstuff-1.3.jar',
        },
        {
          type: 'module',
          id: 'addstuff',
          filepath: '/tmp/addstuff-1.3.jar',
        },
        {
          type: 'module',
          id: 'addstuff',
          forceInstall: true,
          filepath: '/tmp/addstuff-1.3.jar',
        },        
        {
          type: 'asset',
          fetch: 'http',
          source:
            'https://store.jahia.com/cms/mavenproxy/private-app-store/org/jahia/modules/digitall/1.1.0/digitall-1.1.0.jar',
          filepath: '/tmp/digitall.zip',
        },
        {
          type: 'webproject',
          source: 'prepackaged',
          sitekey: 'digitall',
          filepath: '/tmp/digitall.zip',
        },
        {
          type: 'groovy',
          filepath: '/tmp/jahia-test.groovy',
        },
        {
          type: 'shell',
          cmd: 'node -v',
        },
      ],
      // List source docker images that would be used in the absence of corresponding images
      docker: {
        repository: 'jahia/qa-poc',
        images: [
          {
            name: 'Elasticsearch',
            source: 'docker.elastic.co/elasticsearch/elasticsearch:7.5.0',
            prefix: 'es',
          },
          {
            name: 'Jahia',
            source: 'jahia/jahia-dev:latest',
            prefix: 'j',
          },
        ],
      },
    };

    const filepathname = flags.manifest;
    if (fs.existsSync(filepathname) === false) {
      fs.writeFileSync(filepathname, jsYaml.safeDump(defaultManifest));
      console.log('Manifest created: ' + filepathname);
    } else {
      console.log('ERROR: Manifest file already exists: ' + filepathname);
    }

    const t1 = performance.now();
    console.log(
      'Total Exceution time: ' + Math.round(t1 - t0) + ' milliseconds.',
    );
  }
}
