import axios from 'axios';
import * as FormData from 'form-data';
import * as fs from 'fs';

import { exit } from '@oclif/errors';

// https://www.npmjs.com/package/form-data
const installModule = async (
  url: string,
  username: string,
  password: string,
  file: string,
) => {
  const form = new FormData();
  const stream = fs.createReadStream(file);
  form.append('bundle', stream);
  form.append('start', 'true');

  // In Node.js environment you need to set boundary in the header field 'Content-Type' by calling method `getHeaders`
  const formHeaders = form.getHeaders();

  let installResponse: any = {};
  try {
    installResponse = await axios.post(url + '/modules/api/bundles', form, {
      headers: {
        ...formHeaders,
        Origin: url
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
      auth: {
        username,
        password,
      },
    });
  } catch (error) {
    console.log(error);
    console.log('Error uploading file: ' + file);
    exit();
  }
  if (installResponse.data !== undefined) {
    console.log('Submission response: ', installResponse.data.bundleInfos);
    return installResponse.data.bundleInfos;
  }
  return false;
};
export default installModule;
