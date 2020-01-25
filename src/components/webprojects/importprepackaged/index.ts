import cli from 'cli-ux';
import { performance } from 'perf_hooks';

import getWebprojects from '../utils/get-webprojects';
import getAvailableProjects from '../utils/get-available';
import { exit } from '@oclif/errors';

const importPrepackagedWebproject = async (page: any, sitekey: string) => {
  // Only install the module if it doesn't exist already
  const installedWebprojects = await getWebprojects(page);
  if (
    installedWebprojects.find((p: any) => p.sitekey === sitekey) === undefined
  ) {
    cli.action.start('Importing webproject: ' + sitekey);
    const t1 = performance.now();

    const webProjects = await getAvailableProjects(page);

    const selectedProject = webProjects.find(
      (p: { sitekey: string; value: string }) => p.sitekey === sitekey, // eslint-disable-line no-explicit-any
    );
    if (selectedProject === undefined) {
      console.log('Error: Unable to find sitekey in list of prepackaged sites');
      exit();
    }
    console.log('Importing site with value: ' + selectedProject.value);
    await page.select(
      'select[name=selectedPrepackagedSite]',
      selectedProject.value,
    );

    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle0' }),
      page.click('button[name="importPrepackaged"]'),
    ]);
    await Promise.all([
      page.waitForNavigation({ timeout: 600000 }),
      page.click('button[name="_eventId_processImport"]'),
    ]);

    const installedWebprojects = await getWebprojects(page);
    if (
      installedWebprojects.find((p: any) => p.sitekey === sitekey) === undefined
    ) {
      console.log('ERROR: Unable to import: ' + sitekey);
      exit();
    } else {
      console.log('Import of ' + sitekey + 'successful');
    }
    cli.action.stop(' done (' + Math.round(performance.now() - t1) + ' ms)');
  } else {
    console.log('Module: ' + sitekey + ' is already installed');
  }
};

export default importPrepackagedWebproject;
