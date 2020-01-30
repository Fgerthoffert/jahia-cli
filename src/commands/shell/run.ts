import { flags } from '@oclif/command';
import { performance } from 'perf_hooks';
import * as fs from 'fs';

import Command from '../../base';

import { exit } from '@oclif/errors';

import execShellCommand from '../../components/shell/utils/async-exec';

export default class ModulesInstall extends Command {
	static description = 'Run a shell command';

	static flags = {
		...Command.flags,
		help: flags.help({ char: 'h' }),
		cmd: flags.string({
			required: true,
			description: 'Shell command to be executed'
		})
	};

	static args = [ { name: 'file' } ];

	async run() {
		const { flags } = this.parse(ModulesInstall);
		const t0 = performance.now();

		if (flags.cmd === undefined) {
			console.log('ERROR: Please specify a filepath');
			exit();
		}

		const command = await execShellCommand(flags.cmd);
		console.log(command);

		const t1 = performance.now();
		console.log('Total Exceution time: ' + Math.round(t1 - t0) + ' milliseconds.');
		if (flags.output !== undefined) {
			fs.writeFileSync(flags.output, command);
		}
	}
}
