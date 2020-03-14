import cli from 'cli-ux';
import { performance } from 'perf_hooks';

import getWebprojects from '../utils/get-webprojects';
import { exit } from '@oclif/errors';

const importFileWebproject = async (
  page: any,
  sitekey: string,
  filepath: string,
) => {
  // Only install the module if it doesn't exist already
  const installedWebprojects = await getWebprojects(page);
  if (
    installedWebprojects.find((p: any) => p.sitekey === sitekey) === undefined
  ) {
    cli.action.start('Importing webproject: ' + sitekey);
    const t1 = performance.now();

    const importInput = await page.$('input[name="importFile"]');
    const [fileChooser] = await Promise.all([
      page.waitForFileChooser(),
      importInput.click(),
    ]);

    await fileChooser.accept([filepath]);
    const button = await page.$(
      '#importForm > div > div:nth-child(2) > div > div > span > button',
    );
    await Promise.all([page.waitForNavigation(), button.click()]);

    const errorDetails = await page.$('#siteSettings > div:nth-child(1) > div.container-fluid > div > div > div.row > div > form > div > div > a');
    if (errorDetails !== null) {
      console.log('ERROR: The project cannot be installed due to a missing dependency (likely a missing module)');    
      exit();  
    }
    
    const importSite = await page.$('button[name="_eventId_processImport"]');
    await Promise.all([
      page.waitForNavigation({ timeout: 600000 }),
      importSite.click(),
    ]);

    const installedWebprojects = await getWebprojects(page);
    if (
      installedWebprojects.find((p: any) => p.sitekey === sitekey) === undefined
    ) {
      console.log('ERROR: Unable to import: ' + sitekey);
      exit();
    } else {
      console.log('Import of ' + sitekey + ' successful');
    }
    cli.action.stop(' done (' + Math.round(performance.now() - t1) + ' ms)');
  } else {
    console.log('Module: ' + sitekey + ' is already installed');
  }
};

export default importFileWebproject;
