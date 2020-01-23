import {flags} from '@oclif/command'
import {performance} from 'perf_hooks'
import * as puppeteer from 'puppeteer'

import Command from '../base'

import gqlClient from '../utils/gqlClient'
import waitAlive from '../utils/waitAlive'
import openJahia from '../utils/openJahia'
import closeJahia from '../utils/closeJahia'
import installModule from '../components/modules/install'
import removeModule from '../components/modules/remove'

import {exit} from '@oclif/errors'

export default class Modules extends Command {
  static description = 'Perform operation on Jahia modules';

  static flags = {
    ...Command.flags,
    help: flags.help({char: 'h'}),
    install: flags.boolean({char: 'a', description: 'Install a module'}),
    remove: flags.boolean({char: 'a', description: 'Add a module by id'}),
    file: flags.string({
      char: 'f',
      description: 'Module filepath (jar on filesystem)',
    }),
    id: flags.string({char: 'i', description: 'Module Id'}),
    version: flags.string({char: 'v', description: 'Module version'}),
  };

  static args = [{name: 'file'}];

  async run() {
    const {flags} = this.parse(Modules)
    const t0 = performance.now()

    if (flags.file === undefined && flags.install === true) {
      console.log('ERROR: Please specify a filepath')
      exit()
    }

    const gClient = await gqlClient(flags)
    await waitAlive(gClient)
    const browser = await puppeteer.launch({
      headless: !flags.debug,
      args: ['--disable-dev-shm-usage'],
    })

    const jahiaPage = await openJahia(browser, flags)

    if (flags.install && flags.file && flags.id) {
      await installModule(
        jahiaPage,
        flags,
        flags.file,
        flags.id,
        flags.version
      )
    } else if (flags.remove && flags.id) {
      await removeModule(jahiaPage, flags, flags.id)
    }

    await jahiaPage.close()
    await closeJahia(browser)
    //    console.log(flags);

    const t1 = performance.now()
    console.log(
      'Total Exceution time: ' + Math.round(t1 - t0) + ' milliseconds.'
    )
  }
}
