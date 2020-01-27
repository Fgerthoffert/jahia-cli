import cli from 'cli-ux';
import { performance } from 'perf_hooks';
import * as download from 'download';
import * as fs from 'fs';

/* eslint max-params: ["error", 5] */
const assetsFetch = async (job: {
  type: string;
  fetch: string;
  source: string;
  filepath: string;
}) => {
  if (job.fetch === 'http') {
    const t0 = performance.now();
    cli.action.start('Downloading asset: ' + job.source);

    console.log('Loading: ' + job.source + ' into: ' + job.filepath);
    await download(job.source).then(data => {
      fs.writeFileSync(job.filepath, data);
    });
    cli.action.stop(' done (' + Math.round(performance.now() - t0) + ' ms)');
  } else {
    console.log('WARNING: Asset type not supported');
  }
};

export default assetsFetch;
