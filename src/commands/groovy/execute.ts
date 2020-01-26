import { flags } from '@oclif/command';
import { performance } from 'perf_hooks';
import * as fs from 'fs';

import Command from '../../base';

import { submitGroovy } from '../../utils/tools';

import { exit } from '@oclif/errors';

export default class Modules extends Command {
  static description = 'Executes a groovy script by providing its filename';

  static flags = {
    ...Command.flags,
    help: flags.help({ char: 'h' }),
    file: flags.string({
      required: true,
      description:
        'Specify the filepath to the module to be installed (jar on filesystem)',
    }),
    version: flags.string({
      description: 'Specify the module version to be installed',
    }),
  };

  static args = [{ name: 'file' }];

  async run() {
    const { flags } = this.parse(Modules);
    const t0 = performance.now();

    if (flags.file === undefined) {
      console.log('ERROR: Please specify a filepath');
      exit();
    }

    if (!fs.existsSync(flags.file)) {
      console.log('ERROR: Unable to access file: ' + flags.file);
      exit();
    }

    const submitForm = await submitGroovy(
      flags.jahiaToolsUsername,
      flags.jahiaToolsPassword,
      flags.jahiaAdminUrl + '/modules/tools/groovyConsole.jsp?',
      flags.file,
    );
    if (submitForm === false) {
      console.log(
        'ERROR: Unable execute the groovy script, try running it manually through Jahia Tools',
      );
      exit();
    } else {
      console.log('Groovy script successfully executed: ' + flags.file);
    }

    const t1 = performance.now();
    console.log(
      'Total Exceution time: ' + Math.round(t1 - t0) + ' milliseconds.',
    );
  }
}
