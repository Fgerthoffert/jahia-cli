// From: https://medium.com/@ali.dev/how-to-use-promise-with-exec-in-node-js-a39c4d7bbf77
/**
 * Executes a shell command and return it as a Promise.
 * @param cmd {string}
 * @return {Promise<string>}
 */

const execShellCommand = (cmd: string) => {
	const exec = require('child_process').exec;
	return new Promise((resolve) => {
		exec(cmd, (error: any, stdout: any, stderr: any) => {
			if (error) {
				console.warn(error);
			}
			resolve(stdout ? stdout : stderr);
		});
	});
};
export default execShellCommand;
