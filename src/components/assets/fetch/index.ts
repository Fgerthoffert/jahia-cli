import cli from 'cli-ux';
import { performance } from 'perf_hooks';
import * as fs from 'fs';
import * as fetch from 'node-fetch';
import * as util from 'util';
import { pipeline } from 'stream';

/* eslint max-params: ["error", 5] */
const assetsFetch = async (job: {
	type: string;
	fetch: string;
	source: string;
	filepath: string;
	username?: string;
	password?: string;
}) => {
	if (job.fetch === 'http') {
		const t0 = performance.now();
		cli.action.start('Downloading asset: ' + job.source);

		console.log('Loading: ' + job.source + ' into: ' + job.filepath);
		let options = {};
		if (job.username !== undefined && job.password !== undefined) {
			options = {
				headers: { Authorization: 'Basic ' + Buffer.from(job.username + ':' + job.password).toString('base64') }
			};
		}

		const streamPipeline = util.promisify(pipeline);
		const response = await fetch(job.source, options).catch((error: any) => console.log(error));
		await streamPipeline(response.body, fs.createWriteStream(job.filepath));
		if (response.status > 400) {
			console.log('ERROR fetching artifact')
			console.log(response)
		}
		// await download(job.source, undefined, options).then((data) => {
		// 	fs.writeFileSync(job.filepath, data);
		// });
		cli.action.stop(' done (' + Math.round(performance.now() - t0) + ' ms)');
	} else {
		console.log('WARNING: Asset type not supported');
	}
};

export default assetsFetch;
