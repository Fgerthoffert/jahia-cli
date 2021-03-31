import * as semver from 'semver';

// Should the module be installed
const shouldInstall = (installedModules: Array<any>, moduleId: string, moduleVersion?: string | undefined) => {
	if (installedModules.length === 0) {
		return true;
	}

	// Search for the module ID in the list of installed modules
	const installedModule = installedModules.find((m) => m.id === moduleId)
	if (installedModule === undefined) {
		return true
	}
	
	const installedModuleVersion = semver.coerce(installedModule.version)

	// If the module exists but its version is not specified
	// Considers the module as already installed
	if (moduleVersion === undefined || installedModuleVersion === null) {
		return false
	}

	console.log(`${new Date().toISOString()} - Detected ${moduleId} in version: ${installedModule.version} on the remote Jahia`)

	// If remote version is lower than version to install, then should install
	if (semver.lt(installedModuleVersion, moduleVersion)) {
		console.log(`${new Date().toISOString()} - Version ${installedModuleVersion} is lower than: ${moduleVersion}`)

		return true
	}

	return false
};

export default shouldInstall;
