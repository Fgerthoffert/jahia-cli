import { flags } from '@oclif/command';
import { performance } from 'perf_hooks';
import * as fs from 'fs';

import Command from '../../base';

import { submitGroovyFile } from '../../utils/tools';
import launchPuppeteer from '../../utils/puppeteer/launch';
import openJahia from '../../utils/openJahia';
import navPage from '../../utils/navPage';

import closePuppeteer from '../../utils/puppeteer/close';

import { exit } from '@oclif/errors';

export default class GroovyExecute extends Command {
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
    const { flags } = this.parse(GroovyExecute);
    const t0 = performance.now();

    if (flags.file === undefined) {
      console.log('ERROR: Please specify a filepath');
      exit();
    }

    if (!fs.existsSync(flags.file)) {
      console.log('ERROR: Unable to access file: ' + flags.file);
      exit();
    }

    const submitForm = await submitGroovyFile(
      flags.jahiaToolsUsername,
      flags.jahiaToolsPassword,
      flags.jahiaAdminUrl + '/modules/tools/groovyConsole.jsp?',
      flags.file,
      null,
    );
    if (submitForm === true) {
      console.log('Groovy script successfully executed: ' + flags.file);
    } else {
      console.log(
        'Unable to access tools directly, will be trying to authenticate and fetch the session ID from a cookie',
      );

      const browser = await launchPuppeteer(!flags.debug, flags.nosandbox);
      const jahiaPage = await openJahia(browser, flags);
      await navPage(
        jahiaPage,
        flags.jahiaAdminUrl + '/modules/tools/groovyConsole.jsp?',
      );
      const cookies = await jahiaPage.cookies();
      const jsession = cookies.find((c: any) => c.name === 'JSESSIONID');
      await closePuppeteer(browser);

      if (jsession === undefined) {
        console.log(
          'ERROR: Unable to log-in with puppeteer to execute the groovy script (unable to get JSESSIONID)',
        );
        exit();
      } else {
        console.log('Cookie found: ' + jsession.value);
        const submitFormCookie = await submitGroovyFile(
          flags.jahiaToolsUsername,
          flags.jahiaToolsPassword,
          flags.jahiaAdminUrl + '/modules/tools/groovyConsole.jsp?',
          flags.file,
          jsession.value,
        );
        if (submitFormCookie === true) {
          console.log(
            'Groovy script successfully executed (via browser auth and cookie): ' +
              flags.file,
          );
        } else {
          console.log(
            'Unable to access tools directly, will be trying to authenticate and fetch the session ID from a cookie',
          );
        }
      }
    }

    const t1 = performance.now();
    console.log(
      'Total Exceution time: ' + Math.round(t1 - t0) + ' milliseconds.',
    );
  }
}
