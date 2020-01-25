import cli from 'cli-ux';
import { performance } from 'perf_hooks';

import { ConfigFlags } from '../../../global';

import getWebprojects from '../utils/get-webprojects';
import { exit } from '@oclif/errors';

/* eslint max-params: ["error", 5] */
const importWebproject = async (
  page: any,
  cmdConfig: ConfigFlags,
  sitekey: string,
) => {
  const t0 = performance.now();

  cli.action.start('Navigation to the modules page');
  await page.goto(
    cmdConfig.jahiaAdminUrl +
      '/cms/adminframe/default/en/settings.webProjectSettings.html',
    {
      waitUntil: 'networkidle0',
    },
  );
  cli.action.stop(' done (' + Math.round(performance.now() - t0) + ' ms)');

  // Only install the module if it doesn't exist already
  const installedWebprojects = await getWebprojects(page);
  if (installedWebprojects.includes(sitekey) === false) {
    cli.action.start('Importing webproject: ' + sitekey);
    const t1 = performance.now();

    const webProjectsValues = await page.evaluate(() =>
      [
        ...document.querySelectorAll(
          'select[name=selectedPrepackagedSite] option',
        ),
      ].map(element => element.getAttribute('value')),
    );

    const selectedProject = webProjectsValues.find(
      (p: any) => p.match(/#([\s\S]*)$/)[1] === sitekey, // eslint-disable-line no-explicit-any
    );
    if (selectedProject === undefined) {
      console.log('Error: Unable to find sitekey in list of prepackaged sites');
      exit();
    }
    console.log('Importing site with value: ' + selectedProject);
    await page.select('select[name=selectedPrepackagedSite]', selectedProject);

    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle0' }),
      page.click('button[name="importPrepackaged"]'),
    ]);
    await Promise.all([
      page.waitForNavigation({ timeout: 600000 }),
      page.click('button[name="_eventId_processImport"]'),
    ]);

    const installedWebprojects = await getWebprojects(page);
    if (installedWebprojects.includes(sitekey) === true) {
      console.log('Import of ' + sitekey + 'successful');
    } else {
      console.log('ERROR: Unable to import: ' + sitekey);
      exit();
    }
    cli.action.stop(' done (' + Math.round(performance.now() - t1) + ' ms)');
  } else {
    console.log('Module: ' + sitekey + ' is already installed');
  }
};

export default importWebproject;
