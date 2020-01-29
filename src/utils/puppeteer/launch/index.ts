import * as puppeteer from 'puppeteer';

const launchPuppeteer = async (headless: boolean) => {
  const browser = await puppeteer.launch({
    headless: headless,
    defaultViewport: null,
    args: [
      '--disable-dev-shm-usage',
      '--start-maximized',
      //      '--start-fullscreen',
      //      '--no-sandbox',
      //      '--disable-setuid-sandbox',
    ],
  });
  return browser;
};

export default launchPuppeteer;
