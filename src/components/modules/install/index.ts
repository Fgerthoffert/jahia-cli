/* eslint-disable max-depth */
import { exit } from '@oclif/errors';
import * as fs from 'fs';
import * as path from 'path';
import * as semver from 'semver';

import { ConfigFlags } from '../../../global';

import getModules from '../utils/get-modules';
// import isInstalled from '../utils/is-installed';
import shouldInstall from '../utils/should-install';
import installMod from '../utils/install-module';
import uninstallMod from '../utils/uninstall-module';
import { sleep } from '../../../utils'

/* eslint max-params: ["error", 5] */
const installModule = async (
	flags: ConfigFlags,
	moduleFilepath: string,
	force: boolean,
	moduleId?: string | undefined,
	moduleVersion?: string | undefined
) => {
	console.log(`${new Date().toISOString()} - START - Install Module`)
	if (fs.lstatSync(moduleFilepath).isDirectory()) {
		console.log(`${new Date().toISOString()} - ${moduleFilepath} is a directory, fetching matching jar modules for module ID: ${moduleId}`)
		// Check if the file is a directory or a path.
		// If it is a directory, we search for the latest version
		const files: any = fs.readdirSync(moduleFilepath)
			.filter((f: string) => f.startsWith(`${moduleId}-`) && f.endsWith('.jar'))
			// Deconstruct the version to filter out modules containing moduleId in their name
			// Example: augmented-search and augmented-search-ui
			.filter((f: string) => {
				let versionParse = path.basename(f)
				if (moduleId !== undefined) {
					versionParse = f.replace(moduleId,'')
				}
				const moduleVersion = semver.coerce(versionParse)
				if (f.includes(`${moduleId}-${moduleVersion}.jar`)) {
					return true
				}
				if (f.includes(`${moduleId}-${moduleVersion}-SNAPSHOT.jar`)) {
					return true
				}
				return false
			})
			.map((f) => {				
				const versionCoerce = semver.coerce(f)		
				return {
					moduleId,
					moduleVersion: versionCoerce === null ? null: versionCoerce.version,
					moduleFilepath: moduleFilepath + f
				}
		})
		if (files.length === 0) {
			console.error('ERROR: Unable to find matching file, Provisioning could not be executed, EXITING')
			exit(1)
		} 	
		console.log(files)
		console.log(`${new Date().toISOString()} - Finding latest version of the module from the files array`)
		let latestFile = files[0]
		for(const file of files.filter((f: any) => f.moduleVersion !== null)) {
			if (semver.gt(file.moduleVersion, latestFile.moduleVersion)) {
				latestFile = file
			}
		}
		console.log(`${new Date().toISOString()} - Preparing to submit the following module: ${JSON.stringify(latestFile)}`)
		moduleFilepath = latestFile.moduleFilepath
		moduleId = latestFile.moduleId
		moduleVersion = latestFile.moduleVersion
	}

	// ModuleId is undefined, we blindly push the module but don't check for proper installation	
	if (moduleId === undefined) {
		console.log(`${new Date().toISOString()} - Submitting: ${moduleFilepath} for installation`);
		await installMod(flags.jahiaAdminUrl, flags.jahiaAdminUsername, flags.jahiaAdminPassword, moduleFilepath);
	} else {
		const installedModules = await getModules(
			flags.jahiaAdminUrl,
			flags.jahiaAdminUsername,
			flags.jahiaAdminPassword
		);
		console.log(`${new Date().toISOString()} - Module force install is set to: ${force}`);

		if (shouldInstall(installedModules, moduleId, moduleVersion) === true || force === true) {
			// Check if there is a different version of that module installed
			console.log(`${new Date().toISOString()} - Module will be installed`);
			const installedModule = await installMod(flags.jahiaAdminUrl, flags.jahiaAdminUsername, flags.jahiaAdminPassword, moduleFilepath);
			if (installedModule === false || installedModule.length !== 1) {
				console.log('Error: Unable to install module');
				exit();
			} else {
				console.log(`${new Date().toISOString()} - Installation of the module successful`);
				// Find modules different than installed and remove them
				const otherModules = installedModules.filter((m: any) => m.id === installedModule[0].symbolicName && m.key !== installedModule[0].key)	
				if (otherModules.length > 0) {
					console.log(`${new Date().toISOString()} - Aside from the modules just installed, the following modules are on the platform for id: ${moduleId}`);			
					console.log(otherModules);	
					for (const mod of otherModules ) {
						console.log(`${new Date().toISOString()} - Removal of duplicate module: ${mod.key}`);
						// eslint-disable-next-line no-await-in-loop
						await uninstallMod(flags.jahiaAdminUrl, flags.jahiaAdminUsername, flags.jahiaAdminPassword, mod.key);
					}
				}
				await sleep(1000);
				const postInstallModules = await getModules(
					flags.jahiaAdminUrl,
					flags.jahiaAdminUsername,
					flags.jahiaAdminPassword
				);
				console.log(`${new Date().toISOString()} - The following modules have been detected on the platform for id: ${moduleId}`);		
				const detectedModule = 	postInstallModules.filter((m: any) => m.id === installedModule[0].symbolicName)
				console.log(detectedModule)
				if (detectedModule.length === 0) {
					console.log(`${new Date().toISOString()} - ERROR: Could not detect module ${moduleId} on the platform, there was likely an issue during module provisioning. EXITING`);		
					exit(1)
				}
			}
		} else {
			console.log(`${new Date().toISOString()} - Module already installed`);
		}
	}
	console.log(`${new Date().toISOString()} - END - Install Module`)
};

export default installModule;
