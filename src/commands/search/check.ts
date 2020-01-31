import { flags } from '@oclif/command';
import { performance } from 'perf_hooks';

import Command from '../../base';

import graphqlClient from '../../utils/graphql/client';
import waitAlive from '../../utils/waitAlive';
import checkHits from '../../components/search/check'

export default class SearchCheck extends Command {
  static description = 'Runs a graphql query against search and wait until there is a set number of hits';

  static flags = {
    ...Command.flags,
    help: flags.help({ char: 'h' }),
    sitekey: flags.string({
      required: false,
      default: 'digitall',
      description: 'Speficy the site to test towards',
    }),
    nodetype: flags.string({
      required: false,
      default: 'mix:title',
      description: 'Speficy the nodetype to search (ex: mix:title)',
    }),
    query: flags.string({
      required: false,
      default: 'a',
      description: 'Speficy the query string',
    }),
    hits: flags.string({
      required: false,
      default: '10',
      description: 'Speficy the minimum number of hits',
    }),
    timeout: flags.string({
      required: false,
      char: 't',
      description:
        'Specify a timeout after which the process will exit with an error',
    }),    
  };

  static args = [{ name: 'file' }];

  async run() {
    const { flags } = this.parse(SearchCheck);
    const t0 = performance.now();

    const gClient = await graphqlClient(flags);

    const timeout =
      flags.timeout === undefined
        ? undefined
        : Math.round(Number.parseInt(flags.timeout, 10) * 1000);

    await checkHits(gClient, flags.sitekey, flags.nodetype, flags.query, Number.parseInt(flags.hits, 10), timeout )

    await waitAlive(gClient, 500000); // Wait for 500s by default

    const t1 = performance.now();
    console.log(
      'Total Exceution time: ' + Math.round(t1 - t0) + ' milliseconds.',
    );
  }
}
