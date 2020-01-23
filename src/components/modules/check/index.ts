import cli from 'cli-ux';
import { performance } from 'perf_hooks';
import { exit } from '@oclif/errors';

import { ConfigFlags } from '../../../global';

import getModule from '../utils/get-module';

/* eslint max-params: ["error", 5] */
const checkModule = async (
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

  const moduleData = await getModule(page, moduleId);
  return moduleData;
};

export default checkModule;
