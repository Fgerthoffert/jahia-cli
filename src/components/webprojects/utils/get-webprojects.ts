const getWebprojects = async (page: any) => {
  console.log('Obtaining list of installed Webprojects');

  const allWebprojects = await page.evaluate(() =>
    [...document.querySelectorAll('#sitesTable td:nth-child(4)')].map(
      e => e.textContent,
    ),
  );
  return allWebprojects.map((p: string) => {
    return { sitekey: p };
  });
};

export default getWebprojects;
