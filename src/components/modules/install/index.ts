import { exit } from '@oclif/errors';

import { ConfigFlags } from '../../../global';

import getModules from '../utils/get-modules';
import isInstalled from '../utils/is-installed';
import installMod from '../utils/install-module';

/* eslint max-params: ["error", 5] */
const installModule = async (
  flags: ConfigFlags,
  moduleFilepath: string,
  moduleId?: string | undefined,
  moduleVersion?: string | undefined,
) => {
  // ModuleId is undefined, we blindly push the module but don't check for proper installation
  if (moduleId === undefined) {
    console.log('Submitting: ' + moduleFilepath + ' for installation');
    await installMod(
      flags.jahiaAdminUrl,
      flags.jahiaAdminUsername,
      flags.jahiaAdminUsername,
      moduleFilepath,
    );
  } else {
    const installedModules = await getModules(
      flags.jahiaAdminUrl,
      flags.jahiaAdminUsername,
      flags.jahiaAdminUsername,
    );
    if (isInstalled(installedModules, moduleId, moduleVersion) === false) {
      console.log('Module needs to be installed');
      await installMod(
        flags.jahiaAdminUrl,
        flags.jahiaAdminUsername,
        flags.jahiaAdminUsername,
        moduleFilepath,
      );
      const checkInstalledModules = await getModules(
        flags.jahiaAdminUrl,
        flags.jahiaAdminUsername,
        flags.jahiaAdminUsername,
      );
      if (
        isInstalled(checkInstalledModules, moduleId, moduleVersion) === true
      ) {
        console.log('Installation of the module successful');
      } else {
        console.log('Error: Unable to install module');
        exit();
      }
    } else {
      console.log('Module already installed');
    }
  }
};

export default installModule;
