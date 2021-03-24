import { exit } from '@oclif/errors';

import { ConfigFlags } from '../../../global';

import getModules from '../utils/get-modules';
import isInstalled from '../utils/is-installed';
import installMod from '../utils/install-module';
import uninstallMod from '../utils/uninstall-module';

/* eslint max-params: ["error", 5] */
const installModule = async (
	flags: ConfigFlags,
	moduleFilepath: string,
	force: boolean,
	moduleId?: string | undefined,
	moduleVersion?: string | undefined
) => {
	// ModuleId is undefined, we blindly push the module but don't check for proper installation
	if (moduleId === undefined) {
		console.log('Submitting: ' + moduleFilepath + ' for installation');
		await installMod(flags.jahiaAdminUrl, flags.jahiaAdminUsername, flags.jahiaAdminPassword, moduleFilepath);
	} else {
		const installedModules = await getModules(
			flags.jahiaAdminUrl,
			flags.jahiaAdminUsername,
			flags.jahiaAdminPassword
		);
		
		if (isInstalled(installedModules, moduleId, moduleVersion) === false || force === true) {
			// Check if there is a different version of that module installed
			console.log('Module needs to be installed');
			const installedModule = await installMod(flags.jahiaAdminUrl, flags.jahiaAdminUsername, flags.jahiaAdminPassword, moduleFilepath);
			if (installedModule === false || installedModule.length !== 1) {
				console.log('Error: Unable to install module');
				exit();
			} else {
				console.log('Installation of the module successful');
				// Find modules different than installed and remove them
				const otherModules = installedModules.filter((m: any) => m.id === installedModule[0].symbolicName && m.key !== installedModule[0].key)	
				console.log('Aside from the modules just installed, the following modules are on the platform for id: ' + moduleId);			
				console.log(otherModules);	
				for (const mod of otherModules ) {
					console.log('Removal of duplicate module: ' + mod.key);
					// eslint-disable-next-line no-await-in-loop
					await uninstallMod(flags.jahiaAdminUrl, flags.jahiaAdminUsername, flags.jahiaAdminPassword, mod.key);
				}
				const postInstallModules = await getModules(
					flags.jahiaAdminUrl,
					flags.jahiaAdminUsername,
					flags.jahiaAdminPassword
				);
				console.log('The following modules are on the platform for id: ' + moduleId);			
				console.log(postInstallModules.filter((m: any) => m.id === installedModule[0].symbolicName))
			}
		} else {
			console.log('Module already installed');
		}
	}
};

export default installModule;
