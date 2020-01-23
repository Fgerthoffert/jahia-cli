import cli from 'cli-ux';
import gql from 'graphql-tag';

import { sleep } from '..';
import gqlQuery from './gql';

const waitAlive = async (gqlClient: any) => {
  cli.action.start('Waiting for Jahia to be online');
  let data: any = {}; // eslint-disable-line no-explicit-any
  let callsCount = 0;
  do {
    callsCount += 1;
    if (callsCount > 1) {
      await sleep(2000); // eslint-disable-line no-await-in-loop
    }
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
      continue;
    }
  } while (data.data === undefined || data.data.jcr.workspace !== 'EDIT');
  cli.action.stop(' done');
  return true;
};

export default waitAlive;
