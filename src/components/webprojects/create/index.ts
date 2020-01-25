import cli from 'cli-ux';
import { performance } from 'perf_hooks';

import getWebprojects from '../utils/get-webprojects';
import getAvailable from '../utils/get-available';
import { exit } from '@oclif/errors';

const createWebproject = async (page: any, sitekey: string) => {
  // Only install the module if it doesn't exist already
  const installedWebprojects = await getWebprojects(page);
  if (installedWebprojects.includes(sitekey) === false) {
    cli.action.start('Importing webproject: ' + sitekey);
    const t1 = performance.now();

    const webProjects = await getAvailable(page);

    const selectedProject = webProjects.find(
      (p: { sitekey: string; value: string }) => p.sitekey === sitekey, // eslint-disable-line no-explicit-any
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

export default createWebproject;
