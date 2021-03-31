import { flags } from '@oclif/command';
import { performance } from 'perf_hooks';

import Command from '../../base';

import graphqlClient from '../../utils/graphql/client';
import waitAlive from '../../utils/waitAlive';

import { exit } from '@oclif/errors';

import installModule from '../../components/modules/install';

export default class ModulesInstall extends Command {
	static description = 'Installs a module';

	static flags = {
		...Command.flags,
		help: flags.help({ char: 'h' }),
		file: flags.string({
			required: true,
			description: 'Specify the filepath to the module to be installed (jar on filesystem)'
		}),
		id: flags.string({
			required: true,
			description: 'Module Id'
		}),
		force: flags.boolean({
			description: 'Forces modules installation (even if already installed)'
		}),
		version: flags.string({
			description: 'Specify the module version to be installed'
		})
	};

	static args = [ { name: 'file' } ];

	async run() {
		const { flags } = this.parse(ModulesInstall);
		const t0 = performance.now();

		if (flags.file === undefined) {
			console.log('ERROR: Please specify a filepath');
			exit();
		}

		// if (!fs.existsSync(flags.file)) {
		// 	console.log('ERROR: Unable to access file: ' + flags.file);
		// 	exit();
		// }

		const gClient = await graphqlClient(flags);
		await waitAlive(gClient, 500000); // Wait for 500s by default

		await installModule(flags, flags.file, flags.force, flags.id);

		const t1 = performance.now();
		console.log('Total Exceution time: ' + Math.round(t1 - t0) + ' milliseconds.');
	}
}
