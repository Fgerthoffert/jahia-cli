import { flags } from '@oclif/command';
import { performance } from 'perf_hooks';
import * as loadYamlFile from 'load-yaml-file';
import * as fs from 'fs';

import Command from '../../base';

import { submitGroovy } from '../../utils/tools';

import { exit } from '@oclif/errors';

export default class GroovyBatch extends Command {
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
    const { flags } = this.parse(GroovyBatch);
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
      manifestContent.groovy !== undefined &&
      manifestContent.groovy.length > 0
    ) {
      for (const jahiaGroovyFile of manifestContent.groovy) {
        if (fs.existsSync(jahiaGroovyFile.filepath) === false) {
          console.log(
            'ERROR: Unable to access file: ' + jahiaGroovyFile.filepath,
          );
          exit();
        }
        // eslint-disable-next-line no-await-in-loop
        const submitForm = await submitGroovy(
          flags.jahiaToolsUsername,
          flags.jahiaToolsPassword,
          flags.jahiaAdminUrl + '/modules/tools/groovyConsole.jsp?',
          jahiaGroovyFile.filepath,
        );
        if (submitForm === false) {
          console.log(
            'ERROR: Unable execute the groovy script, try running it manually through Jahia Tools: ' +
              jahiaGroovyFile.filepath,
          );
          exit();
        } else {
          console.log(
            'Groovy script successfully executed: ' + jahiaGroovyFile.filepath,
          );
        }
      }
    } else {
      console.log('Manifest is empty and does not contain any groovy scripts');
    }
    const t1 = performance.now();
    console.log(
      'Total Exceution time: ' + Math.round(t1 - t0) + ' milliseconds.',
    );
  }
}
