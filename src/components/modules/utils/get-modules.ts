import axios from 'axios';

const getModules = async (url: string, username: string, password: string) => {
	const modulesResponse = await axios.get(url + '/modules/api/bundles/org.jahia.modules/*/*/_info', {
		auth: {
			username,
			password
		}
	});
	if (modulesResponse.data !== undefined) {
		const instanceModules: any = Object.values(modulesResponse.data)[0];
		const modules = [];
		const regExp = new RegExp(/org\.jahia\.modules\/(.*)\/(.*)/);

		const instanceModulesArr: Array<any> = Object.entries(instanceModules);
		for (const [ key, value ] of instanceModulesArr) {
			const ex = regExp.exec(key);
			if (ex !== null) {
				modules.push({ ...value, id: ex[1], version: ex[2] });
			}
		}
		return modules;
	}
	return [];
};
export default getModules;
