import cli from 'cli-ux';
import { performance } from 'perf_hooks';

const navPage = async (page: any, url: string) => {
  const t0 = performance.now();

  cli.action.start('Navigation to the page: ' + url);
  await page.goto(url, {
    waitUntil: ['networkidle2', 'domcontentloaded']
  });
  cli.action.stop(' done (' + Math.round(performance.now() - t0) + ' ms)');
};

export default navPage;
