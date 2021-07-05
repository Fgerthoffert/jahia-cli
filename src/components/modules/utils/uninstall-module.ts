import axios from 'axios';
import {Base64} from 'js-base64'

import { exit } from '@oclif/errors';

// https://www.npmjs.com/package/form-data
const uninstallModule = async (
  url: string,
  username: string,
  password: string,
  key: string,
) => {
  let uninstallResponse: any = {};
  try {
    uninstallResponse = await axios.post(url + '/modules/api/bundles/' + key + '/_uninstall', null, {
      headers: {
        authorization: `Basic ${Base64.btoa(username + ':' + password)}`,
        Origin: url
      },
    });
  } catch (error) {
    console.log(error);
    console.log('Error uninstalling module: ' + key);
    exit();
  }
  if (uninstallResponse.data !== undefined) {
    console.log('Submission response: ', uninstallResponse.data.bundleInfos);
    return uninstallResponse.data.bundleInfos;
  }
  return false;
};
export default uninstallModule;

