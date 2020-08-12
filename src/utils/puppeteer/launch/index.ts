import * as puppeteer from 'puppeteer';

const launchPuppeteer = async (headless: boolean) => {
  const launchArgs = [
    '--disable-dev-shm-usage',
    '--start-maximized',
    //      '--start-fullscreen',
    //      '--disable-setuid-sandbox',
  ];
  if (process.getuid() === 0) {
    launchArgs.push('--no-sandbox');
  }
  const browser = await puppeteer.launch({
    headless: headless,
    defaultViewport: null,
    args: launchArgs,
  });
  return browser;
};

export default launchPuppeteer;
