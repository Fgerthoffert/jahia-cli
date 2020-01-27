import cli from 'cli-ux';
import { performance } from 'perf_hooks';

import isInstalled from '../utils/is-installed';
import { exit } from '@oclif/errors';

const checkModules = async (
  page: any,
  moduleIds: Array<string>,
  moduleVersions: Array<string> | undefined,
) => {
  const installedModules = [];

  for (const [idx, mId] of moduleIds.entries()) {
    let moduleInstalled = false;
    if (moduleVersions === undefined) {
      // eslint-disable-next-line no-await-in-loop
      moduleInstalled = await isInstalled(page, mId, undefined);
    } else {
      // eslint-disable-next-line no-await-in-loop
      moduleInstalled = await isInstalled(page, mId, moduleVersions[idx]);
    }
    installedModules.push({ id: mId, installed: moduleInstalled });
  }
  return installedModules;
};

/* eslint max-params: ["error", 5] */
const installModule = async (
  page: any,
  moduleFilepath: string,
  moduleId: string,
  moduleVersion?: string | undefined,
) => {
  // Some moduels are metapackages containing other modules, in that case we provide as moduleId a comma separated list of modules
  let moduleIds = [moduleId];
  let moduleVersions =
    moduleVersion === undefined ? undefined : [moduleVersion];
  if (moduleId.includes(',')) {
    moduleIds = moduleId.split(',');
    moduleVersions =
      moduleVersion === undefined ? undefined : moduleVersion.split(',');
  }
  const areInstalled = await checkModules(page, moduleIds, moduleVersions);
  const failedInstall = areInstalled.filter(m => m.installed === false);
  if (failedInstall.length > 0) {
    console.log(
      'One or more modules are not installed: ' +
        moduleId +
        ' uploading file...',
    );
    const t1 = performance.now();

    const uploadField = await page.$('input[name=moduleFile]');
    cli.action.start('Uploading file: ' + moduleFilepath);
    await uploadField.uploadFile(moduleFilepath);

    const uploadBtn = await page.$('button[id=btnUpload]');
    await uploadBtn.press('Enter');
    await page.waitForNavigation({ waitUntil: 'domcontentloaded' });

    cli.action.stop(' done (' + Math.round(performance.now() - t1) + ' ms)');

    const areInstalled = await checkModules(page, moduleIds, moduleVersions);
    const failedInstall = areInstalled.filter(m => m.installed === false);
    if (failedInstall.length > 0) {
      console.log(
        'ERROR: One or more modules: ' + moduleId + ' failed installation',
      );
      exit();
    }
  } else {
    console.log('Module(s): ' + moduleId + ' is(are) already installed');
  }
  /*
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
  */
};

export default installModule;
