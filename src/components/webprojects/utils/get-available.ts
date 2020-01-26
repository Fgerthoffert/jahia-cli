const getAvailable = async (page: any) => {
  console.log('Obtaining list of available prepackaged Webprojects');

  const allFields = await page.evaluate(() =>
    [
      ...document.querySelectorAll(
        'select[name=selectedPrepackagedSite] option',
      ),
    ].map(element => element.getAttribute('value')),
  );
  const availableWebprojects = allFields.map((p: any) => {
    return {
      sitekey: p.match(/#([\s\S]*)$/)[1],
      value: p,
    };
  });

  return availableWebprojects;
};

export default getAvailable;
