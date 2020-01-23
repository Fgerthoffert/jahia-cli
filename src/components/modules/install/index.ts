import cli from 'cli-ux';
import { performance } from 'perf_hooks';

import { ConfigFlags } from '../../../global';

import isInstalled from '../utils/is-installed';
import { exit } from '@oclif/errors';

/* eslint max-params: ["error", 5] */
const installModule = async (
  page: any,
  cmdConfig: ConfigFlags,
  moduleFilepath: string,
  moduleId: string,
  moduleVersion: string | undefined,
) => {
  const t0 = performance.now();

  cli.action.start('Navigation to the modules page');
  await page.goto(
    cmdConfig.jahiaAdminUrl +
      '/cms/adminframe/default/en/settings.manageModules.html',
    {
      waitUntil: 'networkidle0',
    },
  );
  cli.action.stop(' done (' + Math.round(performance.now() - t0) + ' ms)');

  // Only install the module if it doesn't exist already
  const moduleInstalled = await isInstalled(page, moduleId, moduleVersion);
  if (moduleInstalled === false) {
    console.log('Unable to detect module: ' + moduleId + ' installing...');
    cli.action.start('Uploading file: ' + moduleFilepath);
    const t1 = performance.now();

    const uploadField = await page.$('input[name=moduleFile]');
    await uploadField.uploadFile(moduleFilepath);

    const uploadBtn = await page.$('button[id=btnUpload]');
    await uploadBtn.press('Enter');
    await page.waitForNavigation({ waitUntil: 'domcontentloaded' });

    cli.action.stop(' done (' + Math.round(performance.now() - t1) + ' ms)');
    if (!(await isInstalled(page, moduleId, moduleVersion))) {
      console.log('ERROR: Module: ' + moduleId + ' failed installation');
      exit();
    }
  } else {
    console.log('Module: ' + moduleId + ' is already installed');
  }
};

export default installModule;
