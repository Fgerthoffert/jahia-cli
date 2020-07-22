/* eslint-disable complexity */
import { flags } from '@oclif/command';
import cli from 'cli-ux';

import { performance } from 'perf_hooks';
import * as loadYamlFile from 'load-yaml-file';
import * as fs from 'fs';

import Command from '../../base';

import launchPuppeteer from '../../utils/puppeteer/launch';
import closePuppeteer from '../../utils/puppeteer/close';
import graphqlClient from '../../utils/graphql/client';
import waitAlive from '../../utils/waitAlive';
import openJahia from '../../utils/openJahia';
import navPage from '../../utils/navPage';

import assetsFetch from '../../components/assets/fetch';
import installModule from '../../components/modules/install';
import buildModule from '../../components/modules/build';
import importPrepackagedWebproject from '../../components/webprojects/importprepackaged';
import importFileWebproject from '../../components/webprojects/importfile';
import execShellCommand from '../../components/shell/utils/async-exec';
import {
  enableModule,
  disableModule,
} from '../../components/modules/utils/groovy';

import { submitGroovyFile, submitGroovy } from '../../utils/tools';

import { exit } from '@oclif/errors';

export default class ManifestRun extends Command {
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
    const { flags } = this.parse(ManifestRun);
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
    if (manifestContent.jobs !== undefined && manifestContent.jobs.length > 0) {
      const gClient = await graphqlClient(flags);
      await waitAlive(gClient, 500000); // Wait for 500s by default
      let browser = null;
      let jahiaPage = null;
      for (const job of manifestContent.jobs) {
        cli.action.start('Running a job of type: ' + job.type);
        const t1 = performance.now();
        if (['webproject', 'groovy'].includes(job.type)) {
          if (browser === null) {
            // eslint-disable-next-line no-await-in-loop
            browser = await launchPuppeteer(!flags.debug);
            // eslint-disable-next-line no-await-in-loop
            jahiaPage = await openJahia(browser, flags);
          }
        }
        if (job.type === 'asset') {
          // eslint-disable-next-line no-await-in-loop
          await assetsFetch(job);
        } else if (job.type === 'build') {
          const gitPath = job.gitPath === undefined ? null : job.gitPath;
          // eslint-disable-next-line no-await-in-loop
          const builtModules = await buildModule(
            job.directory,
            job.id,
            job.branch,
            gitPath,
            job.repository,
          );
          if (job.deploy === true) {
            // eslint-disable-next-line max-depth
            for (const jahiaModule of builtModules) {
              // eslint-disable-next-line no-await-in-loop
              await installModule(flags, jahiaModule, false);
            }
          }
        } else if (job.type === 'module') {
          // eslint-disable-next-line no-await-in-loop
          await installModule(flags, job.filepath, job.id);
        } else if (job.type === 'webproject') {
          // eslint-disable-next-line no-await-in-loop
          await navPage(
            jahiaPage,
            flags.jahiaAdminUrl +
              '/cms/adminframe/default/en/settings.webProjectSettings.html',
          );
          if (job.source === 'prepackaged') {
            // eslint-disable-next-line no-await-in-loop
            await importPrepackagedWebproject(jahiaPage, job.sitekey);
          } else if (job.source === 'file') {
            // eslint-disable-next-line no-await-in-loop
            await importFileWebproject(jahiaPage, job.sitekey, job.filepath);
          } else {
            console.log('ERROR: Unsupported webproject source type');
            exit();
          }
        } else if (job.type === 'groovy') {
          // eslint-disable-next-line no-await-in-loop
          if (fs.existsSync(job.filepath) === false) {
            console.log('ERROR: Unable to access file: ' + job.filepath);
            exit();
          }
          // eslint-disable-next-line no-await-in-loop
          const submitForm = await submitGroovyFile(
            flags.jahiaToolsUsername,
            flags.jahiaToolsPassword,
            flags.jahiaAdminUrl + '/modules/tools/groovyConsole.jsp?',
            job.filepath,
            null,
          );
          if (submitForm === true) {
            console.log('Groovy script successfully executed: ' + job.filepath);
          } else {
            console.log(
              'Unable to access tools directly, will be trying to authenticate and fetch the session ID from a cookie',
            );
            // eslint-disable-next-line no-await-in-loop
            const browser = await launchPuppeteer(!flags.debug);
            // eslint-disable-next-line no-await-in-loop
            const jahiaPage = await openJahia(browser, flags);
            // eslint-disable-next-line no-await-in-loop
            await navPage(
              jahiaPage,
              flags.jahiaAdminUrl + '/modules/tools/groovyConsole.jsp?',
            );
            // eslint-disable-next-line no-await-in-loop
            const cookies = await jahiaPage.cookies();
            const jsession = cookies.find((c: any) => c.name === 'JSESSIONID');
            // eslint-disable-next-line no-await-in-loop
            await closePuppeteer(browser);

            if (jsession === undefined) {
              console.log(
                'ERROR: Unable to log-in with puppeteer to execute the groovy script (unable to get JSESSIONID)',
              );
              exit();
            } else {
              console.log('Cookie found: ' + jsession.value);
              // eslint-disable-next-line no-await-in-loop
              const submitFormCookie = await submitGroovyFile(
                flags.jahiaToolsUsername,
                flags.jahiaToolsPassword,
                flags.jahiaAdminUrl + '/modules/tools/groovyConsole.jsp?',
                job.filepath,
                jsession.value,
              );
              // eslint-disable-next-line max-depth
              if (submitFormCookie === true) {
                console.log(
                  'Groovy script successfully executed (via browser auth and cookie): ' +
                    job.filepath,
                );
              } else {
                console.log(
                  'Unable to access tools directly, will be trying to authenticate and fetch the session ID from a cookie',
                );
              }
            }
          }
        } else if (job.type === 'modulesite') {
          let groovyScript = enableModule
            .replace('SITEID', job.siteId)
            .replace('MODULEID', job.moduleId);
          if (job.action === 'disable') {
            groovyScript = disableModule
              .replace('SITEID', job.siteId)
              .replace('MODULEID', job.moduleId);
          }
          // eslint-disable-next-line no-await-in-loop
          const groovySubmit = await submitGroovy(
            flags.jahiaToolsUsername,
            flags.jahiaToolsPassword,
            flags.jahiaAdminUrl + '/modules/tools/groovyConsole.jsp?',
            groovyScript,
            null,
          );
          if (groovySubmit === true) {
            console.log('Groovy script successfully executed');
          } else {
            console.log(
              'Unable to access tools directly, will be trying to authenticate and fetch the session ID from a cookie',
            );
            // eslint-disable-next-line no-await-in-loop
            const browser = await launchPuppeteer(!flags.debug);
            // eslint-disable-next-line no-await-in-loop
            const jahiaPage = await openJahia(browser, flags);
            // eslint-disable-next-line no-await-in-loop
            await navPage(
              jahiaPage,
              flags.jahiaAdminUrl + '/modules/tools/groovyConsole.jsp?',
            );
            // eslint-disable-next-line no-await-in-loop
            const cookies = await jahiaPage.cookies();
            const jsession = cookies.find((c: any) => c.name === 'JSESSIONID');
            // eslint-disable-next-line no-await-in-loop
            await closePuppeteer(browser);

            if (jsession === undefined) {
              console.log(
                'ERROR: Unable to log-in with puppeteer to execute the groovy script (unable to get JSESSIONID)',
              );
              exit();
            } else {
              console.log('Cookie found: ' + jsession.value);

              // eslint-disable-next-line no-await-in-loop
              const submitFormCookie = await submitGroovy(
                flags.jahiaToolsUsername,
                flags.jahiaToolsPassword,
                flags.jahiaAdminUrl + '/modules/tools/groovyConsole.jsp?',
                groovyScript,
                jsession.value,
              );
              // eslint-disable-next-line max-depth
              if (submitFormCookie === true) {
                console.log(
                  'Groovy script successfully executed (via browser auth and cookie)',
                );
              } else {
                console.log(
                  'Unable to access tools directly, will be trying to authenticate and fetch the session ID from a cookie',
                );
              }
            }
          }
        } else if (job.type === 'shell') {
          // eslint-disable-next-line no-await-in-loop
          const command = await execShellCommand(job.cmd);
          console.log(command);
          if (job.output !== undefined) {
            fs.writeFileSync(job.output, command);
          }
        } else {
          console.log('ERROR: Unsupported job type');
          exit();
        }
        cli.action.stop(
          ' done (' + Math.round(performance.now() - t1) + ' ms)',
        );
      }

      if (jahiaPage !== null) {
        await jahiaPage.close();
      }
      if (browser !== null) {
        await closePuppeteer(browser);
      }
    } else {
      console.log('Manifest is empty and does not contain any jobs');
    }
    const t1 = performance.now();
    console.log(
      'Total Exceution time: ' + Math.round(t1 - t0) + ' milliseconds.',
    );
  }
}
