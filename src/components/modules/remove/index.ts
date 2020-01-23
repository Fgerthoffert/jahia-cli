import cli from 'cli-ux';
import { performance } from 'perf_hooks';

import { ConfigFlags } from '../../../global';
import getModule from '../utils/get-module';

const removeModule = async (
  page: any,
  cmdConfig: ConfigFlags,
  moduleId: string,
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

  // Only remove if the module exists
  const moduleExists = await getModule(page, moduleId);
  console.log(moduleExists);
  if (moduleExists === undefined) {
    console.log('Module: ' + moduleId + ' is not installed, cannot be removed');
  } else {
    console.log('TODO: Add remove feature');
  }
};

export default removeModule;
