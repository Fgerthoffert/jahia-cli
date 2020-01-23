import { InMemoryCache } from 'apollo-cache-inmemory';
import ApolloClient from 'apollo-client';
import { ApolloLink } from 'apollo-link';
import { HttpLink } from 'apollo-link-http';
import fetch from 'node-fetch';

import { ConfigFlags } from '../../global';

const gqlClient = async (cmdConfig: ConfigFlags) => {
  const httpLink = new HttpLink({
    uri: cmdConfig.jahiaAdminUrl + '/modules/graphql',
    fetch: fetch as any, // eslint-disable-line no-explicit-any
  });
  const cache = new InMemoryCache();
  // eslint-disable-next-line no-explicit-any
  const authMiddleware = new ApolloLink((operation: any, forward: any) => {
    operation.setContext({
      headers: {
        authorization: `Basic ${cmdConfig.jahiaAdminUsername}:${cmdConfig.jahiaAdminPassword}`,
      },
    });
    return forward(operation).map(
      (response: {
        errors: Array<object> | undefined;
        data: { errors: Array<object> };
      }) => {
        if (response.errors !== undefined && response.errors.length > 0) {
          response.data.errors = response.errors;
        }
        return response;
      },
    );
  });

  const link = ApolloLink.from([authMiddleware, httpLink]);

  return new ApolloClient({
    link,
    cache,
  });
};

export default gqlClient;
