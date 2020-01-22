import {flags} from '@oclif/command'
import {performance} from 'perf_hooks'

import Command from '../base'

import gqlClient from '../utils/gqlClient'
import waitAlive from '../utils/waitAlive'

import {exit} from '@oclif/errors'

export default class Modules extends Command {
  static description =
    'Indefinitely wait until a Jahia instance becomes available';

  static flags = {
    ...Command.flags,
    help: flags.help({char: 'h'}),
  };

  static args = [{name: 'file'}];

  async run() {
    const {flags} = this.parse(Modules)
    const t0 = performance.now()

    const gClient = await gqlClient(flags)
    await waitAlive(gClient)

    const t1 = performance.now()
    console.log(
      'Total Exceution time: ' + Math.round(t1 - t0) + ' milliseconds.'
    )
  }
}
