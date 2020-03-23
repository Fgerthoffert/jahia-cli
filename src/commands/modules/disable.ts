import { flags } from '@oclif/command';
import { performance } from 'perf_hooks';

import Command from '../../base';

import graphqlClient from '../../utils/graphql/client';
import waitAlive from '../../utils/waitAlive';

import { exit } from '@oclif/errors';

import { submitGroovy } from '../../utils/tools';
import { disableModule } from '../../components/modules/utils/groovy';

export default class ModulesEnable extends Command {
  static description = 'Disable a module on a particular site';

  static flags = {
    ...Command.flags,
    help: flags.help({ char: 'h' }),
    mid: flags.string({
      required: true,
      description: 'Module ID (for example: augmented-search-ui)',
    }),
    sid: flags.string({
      required: true,
      description: 'Site ID (for example: digitall)',
    }),
  };

  static args = [{ name: 'file' }];

  async run() {
    const { flags } = this.parse(ModulesEnable);
    const t0 = performance.now();

    const gClient = await graphqlClient(flags);
    await waitAlive(gClient, 500000); // Wait for 500s by default

    const groovyScript = disableModule
      .replace('SITEID', flags.sid)
      .replace('MODULEID', flags.mid);

    const submitForm = await submitGroovy(
      flags.jahiaToolsUsername,
      flags.jahiaToolsPassword,
      flags.jahiaAdminUrl + '/modules/tools/groovyConsole.jsp?',
      groovyScript,
    );
    if (submitForm === false) {
      console.log(
        'ERROR: Unable execute the groovy script, try running it manually through Jahia Tools',
      );
      exit();
    } else {
      console.log('Groovy script successfully executed');
    }
    const t1 = performance.now();
    console.log(
      'Total Exceution time: ' + Math.round(t1 - t0) + ' milliseconds.',
    );
  }
}
