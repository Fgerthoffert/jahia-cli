import cli from 'cli-ux'

const closeJahia = async (page: any) => {
  cli.action.start('Closing Puppeteer browser instance')
  await page.close()
  cli.action.stop(' done')
}

export default closeJahia
