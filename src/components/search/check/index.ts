import cli from 'cli-ux';
import { exit } from '@oclif/errors';
import { performance } from 'perf_hooks';
import gql from 'graphql-tag';

import { sleep } from '../../../utils';
import gqlQuery from './gql';

const isIndexed = (data: any, hits: number) => {
  if (data.data === undefined || data.data.jcr === undefined) {
    return false;
  }
  if (data.data.jcr.searches.search.totalHits > 0) {
    console.log('The search query returned ' + data.data.jcr.searches.search.totalHits + ' hits');  
  }
  if (data.data.jcr.searches.search.totalHits < hits) {
    return false;
  }
  return true;
};

/* eslint max-params: ["error", 7] */
/* eslint-env es6 */
const checkHits = async (
  gqlClient: any, // eslint-disable-line no-explicit-any
  sitekey: string,
  nodetype: string,
  query: string,
  hits: number,
  timeout: number | undefined, // in ms
  timeSinceStart: number, // in ms
) => {
  console.log('Time since start: ' + timeSinceStart + 'ms');
  let data: any = {}; // eslint-disable-line no-explicit-any
  if (
    timeout === undefined ||
    (timeout !== undefined && timeSinceStart < timeout)
  ) {
    try {
      // eslint-disable-next-line no-await-in-loop      
      data = await gqlClient.query({
        query: gql`
          ${gqlQuery}
        `,
        variables: {sitekey, nodetype, querystring: query},
        fetchPolicy: 'no-cache',
        errorPolicy: 'ignore',
      });
    } catch (error) {
      console.log(error.message);
    }
    const time = Math.round(timeSinceStart + performance.now());
    if (isIndexed(data, hits) === false) {
      await sleep(2000);
      data = await checkHits(gqlClient, sitekey, nodetype, query, hits, timeout, time);
    }
  }
  return data;
};

const waitHits = async (
  gqlClient: any, // eslint-disable-line no-explicit-any
  sitekey: string,
  nodetype: string,
  query: string,
  hits: number, 
  timeout: number | undefined
  ) => {
  cli.action.start('Waiting for the search query to return: ' + hits + ' hits');

  const data = await checkHits(gqlClient, sitekey, nodetype, query, hits, timeout, 0);
  if (isIndexed(data, hits) === false) {
    console.log(
      'ERROR: Unable to validate data, most likely expired timeout',
    );
    exit();
  }
  cli.action.stop();

  return true;
};

export default waitHits;
