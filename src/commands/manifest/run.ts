import { flags } from '@oclif/command';
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
import importPrepackagedWebproject from '../../components/webprojects/importprepackaged';
import importFileWebproject from '../../components/webprojects/importfile';
import { submitGroovy } from '../../utils/tools';

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
      const browser = await launchPuppeteer(!flags.debug);
      const jahiaPage = await openJahia(browser, flags);

      for (const job of manifestContent.jobs) {
        if (job.type === 'asset') {
          // eslint-disable-next-line no-await-in-loop
          await assetsFetch(job);
        } else if (job.type === 'module') {
          // eslint-disable-next-line no-await-in-loop
          await navPage(
            jahiaPage,
            flags.jahiaAdminUrl +
              '/cms/adminframe/default/en/settings.manageModules.html',
          );
          // eslint-disable-next-line no-await-in-loop
          await installModule(jahiaPage, job.filepath, job.id);
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
          const submitForm = await submitGroovy(
            flags.jahiaToolsUsername,
            flags.jahiaToolsPassword,
            flags.jahiaAdminUrl + '/modules/tools/groovyConsole.jsp?',
            job.filepath,
          );
          if (submitForm === false) {
            console.log(
              'ERROR: Unable execute the groovy script, try running it manually through Jahia Tools: ' +
                job.filepath,
            );
            exit();
          } else {
            console.log('Groovy script successfully executed: ' + job.filepath);
          }
        } else {
          console.log('ERROR: Unsupported job type');
          exit();
        }
      }

      await jahiaPage.close();
      await closePuppeteer(browser);
    } else {
      console.log('Manifest is empty and does not contain any jobs');
    }
    const t1 = performance.now();
    console.log(
      'Total Exceution time: ' + Math.round(t1 - t0) + ' milliseconds.',
    );
  }
}
