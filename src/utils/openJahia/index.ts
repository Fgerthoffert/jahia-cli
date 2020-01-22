import cli from 'cli-ux'
import {performance} from 'perf_hooks'

import {ConfigFlags} from '../../global'
import {exit} from '@oclif/errors'

const openJahia = async (browser: any, cmdConfig: ConfigFlags) => {
  cli.action.start('Opening Jahia Administration page with puppeteer')
  const t0 = performance.now()

  const page = await browser.newPage()
  await page.goto(
    cmdConfig.jahiaAdminUrl + '/cms/admin/en_US/settings.aboutJahia.html'
  )
  await page.waitForSelector('.login-form input[name="username"]')
  cli.action.stop(' done (' + Math.round(performance.now() - t0) + ' ms)')

  cli.action.start('Logging in the administration panel')
  const t1 = performance.now()

  const usernameField = await page.$('.login-form input[name="username"]')
  const passwordField = await page.$('.login-form input[name="password"]')
  if (usernameField === null || passwordField === null) {
    console.log('ERROR: unable to find the login form')
    exit()
  }

  await usernameField.type(cmdConfig.jahiaAdminUsername)
  await passwordField.type(cmdConfig.jahiaAdminPassword)
  await Promise.all([
    page.waitForNavigation({waitUntil: 'domcontentloaded'}),
    passwordField.press('Enter'),
  ])
  cli.action.stop(' done (' + Math.round(performance.now() - t1) + ' ms)')

  return page
}

export default openJahia
