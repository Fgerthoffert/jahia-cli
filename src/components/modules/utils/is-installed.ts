const isInstalled = (installedModules: Array<any>, moduleId: string, moduleVersion?: string | undefined) => {
	if (installedModules.length === 0) {
		return false;
	}
	let moduleIds = [ moduleId ];
	let moduleVersions = moduleVersion === undefined ? undefined : [ moduleVersion ];
	if (moduleId.includes(',')) {
		moduleIds = moduleId.split(',');
		moduleVersions = moduleVersion === undefined ? undefined : moduleVersion.split(',');
	}
	const checkModules = installedModules.filter((m) => {
		const findModuleIdx = moduleIds.findIndex((mid) => mid === m.id);
		if (findModuleIdx > -1) {
			if (
				moduleVersion !== undefined &&
				moduleVersions !== undefined &&
				moduleVersions[findModuleIdx] === moduleVersion
			) {
				return true;
			}
			if (moduleVersion === undefined) {
				return true;
			}
			return false;
		}
		return false;
	});
	if (checkModules.length === moduleIds.length) {
		return true;
	}
	return false;
};

export default isInstalled;
