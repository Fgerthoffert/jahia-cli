import cli from 'cli-ux'
import gql from 'graphql-tag'

import {sleep} from '..'
import gqlQuery from './gql'

const waitAlive = async (gqlClient: any) => {
  cli.action.start('Waiting for Jahia to be online')
  while (1) {
    let data: any = {}; // eslint-disable-line
    try {
      data = await gqlClient.query({
        query: gql`
          ${gqlQuery}
        `,
        fetchPolicy: 'no-cache',
        errorPolicy: 'ignore',
      })
    } catch (error) {
      //      console.log(error);
      console.log(error.message)
      continue
    }
    if (data.data.jcr.workspace === 'EDIT') {
      break
    }
    await sleep(2000)
  }
  cli.action.stop(' done')
  return true
}

export default waitAlive
