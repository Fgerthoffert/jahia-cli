import cli from 'cli-ux';
import { exit } from '@oclif/errors';
import { performance } from 'perf_hooks';

import gql from 'graphql-tag';

import { sleep } from '..';
import gqlQuery from './gql';

const isAlive = (data: any) => {
  console.log(JSON.stringify(data.data))
  if (data.data === undefined || data.data.jcr.workspace !== 'EDIT') {
    return false;
  }
  return true;
};

const checkStatus = async (
  gqlClient: any,
  timeout: number | undefined, // in ms
  timeSinceStart: number, // in ms
) => {
  const currentTime = new Date();
  console.log(currentTime.toISOString() + 'Time since start: ' + timeSinceStart + 'ms');
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
        fetchPolicy: 'no-cache',
        errorPolicy: 'ignore',
      });
    } catch (error) {
      console.log(error.message);
    }
    const time = Math.round(timeSinceStart + performance.now());
    if (isAlive(data) === false) {
      await sleep(2000);
      data = await checkStatus(gqlClient, timeout, time);
    }
  }
  return data;
};

const waitAlive = async (gqlClient: any, timeout: number | undefined) => {
  cli.action.start('Waiting for Jahia to be online');

  const data = await checkStatus(gqlClient, timeout, 0);
  if (isAlive(data) === false) {
    console.log(
      'ERROR: Unable to validate alive state, most likely expired timeout',
    );
    exit();
  }
  return true;
};

export default waitAlive;
