import { flags } from '@oclif/command';
import { performance } from 'perf_hooks';

import Command from '../base';

import graphqlClient from '../utils/graphql/client';
import waitAlive from '../utils/waitAlive';

export default class Modules extends Command {
  static description =
    'Indefinitely wait until a Jahia instance becomes available';

  static flags = {
    ...Command.flags,
    help: flags.help({ char: 'h' }),
    timeout: flags.string({
      required: false,
      char: 't',
      description:
        'Specify a timeout after which the process will exit with an error',
    }),
  };

  static args = [{ name: 'file' }];

  async run() {
    const { flags } = this.parse(Modules);
    const t0 = performance.now();

    const gClient = await graphqlClient(flags);
    let timeout =
      flags.timeout === undefined
        ? undefined
        : Math.round(Number.parseInt(flags.timeout, 10) * 1000);
    if (timeout === 0) {
      timeout = 2000; // By default timeout, if specified, is a minimum of 2 seconds
    }
    await waitAlive(gClient, timeout);

    const t1 = performance.now();
    console.log(
      'Total Exceution time: ' + Math.round(t1 - t0) + ' milliseconds.',
    );
  }
}
