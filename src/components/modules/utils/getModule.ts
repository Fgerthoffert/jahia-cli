import cli from 'cli-ux'
import {performance} from 'perf_hooks'

const getModule = async (
  page: any,
  moduleId: string,
  moduleVersion?: string | undefined
) => {
  const t0 = performance.now()

  cli.action.start('Check if module: ' + moduleId + ' exists')

  const searchField = await page.$('input[type=search]')

  // Clear field
  await searchField.click({clickCount: 3})
  await searchField.press('Backspace')

  // Input the value
  await searchField.type(moduleId)

  const moduleData = await page.evaluate(() => {
    // Merge input and forms to get all relevant nodes within the form
    const nodes = [
      ...[...document.querySelectorAll(
        'table[id^=module_table_] tr:nth-child(1) td form input'
      )],
      ...[...document.querySelectorAll(
        'table[id^=module_table_] tr:nth-child(1) td form button'
      )],
    ]
    // Filter out only specific fields and format the payload
    return nodes
    .filter(n =>
      [
        'module',
        'version',
        '_eventId_stopModule',
        '_eventId_startModule',
        '_eventId_undeployModule',
      ].includes(String(n.getAttribute('name')))
    )
    .reduce((acc: any, input: any) => {
      let key = input.getAttribute('name')
      let value =
          input.getAttribute('value') !== undefined ?
            input.getAttribute('value') :
            null
      if (key === '_eventId_stopModule') {
        key = 'status'
        value = 'running'
      } else if (key === '_eventId_startModule') {
        key = 'status'
        value = 'stopped'
      } else if (key === '_eventId_undeployModule') {
        key = 'undeployable'
        value = true
      }
      if (key && acc[key] === undefined) {
        acc[key] = value
        return acc
      }
      return acc
    }, {})
  })

  cli.action.stop(' done (' + Math.round(performance.now() - t0) + ' ms)')

  // Clear field
  await searchField.click({clickCount: 3})
  await searchField.press('Backspace')

  return moduleData
}

export default getModule
