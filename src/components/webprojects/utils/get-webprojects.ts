import cli from 'cli-ux';

const getWebprojects = async (page: any) => {
  cli.action.start('Obtaining list of installed Webprojects');

  const allWebprojects = await page.evaluate(() =>
    [...document.querySelectorAll('#sitesTable td:nth-child(4)')].map(
      e => e.textContent,
    ),
  );
  return allWebprojects;
};

export default getWebprojects;
