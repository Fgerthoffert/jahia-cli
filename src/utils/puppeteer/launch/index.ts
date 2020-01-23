import * as puppeteer from 'puppeteer';

const launchPuppeteer = async (headless: boolean) => {
  const browser = await puppeteer.launch({
    headless: headless,
    args: ['--disable-dev-shm-usage'],
  });
  return browser;
};

export default launchPuppeteer;
