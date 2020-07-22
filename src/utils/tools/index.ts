import * as fetch from 'node-fetch';
import * as base64 from 'base-64';
import * as fs from 'fs';

export const submitGroovy = async (
  username: string,
  password: string,
  url: string,
  encodedScript: string,
  jsessionid: string | null,
  // eslint-disable-next-line max-params
) => {
  let response: any = {};
  if (jsessionid === null) {
    response = await fetch(url, {
      credentials: 'include',
      headers: {
        authorization: 'Basic ' + base64.encode(username + ':' + password),
        'content-type': 'application/x-www-form-urlencoded',
      },
      body: 'toolAccessToken=&runScript=true&script=' + encodedScript,
      method: 'POST',
      mode: 'cors',
    });
  } else {
    console.log('Executing call manually');
    response = await fetch(url, {
      credentials: 'include',
      headers: {
        Cookie: 'JSESSIONID=' + jsessionid,
        'content-type': 'application/x-www-form-urlencoded',
      },
      body: 'toolAccessToken=&runScript=true&script=' + encodedScript,
      method: 'POST',
      mode: 'cors',
    });
  }

  const data = await response.text();
  // console.log(data);
  const failRegexp = new RegExp(/<legend style="color: red">Error<\/legend>/);
  const successRegexp = new RegExp(
    /<legend style="color: blue">Successfully executed in/,
  );

  if (successRegexp.exec(data) !== null) {
    return true;
  }
  if (failRegexp.exec(data) !== null) {
    return false;
  }
  return false;
};

export const submitGroovyFile = async (
  username: string,
  password: string,
  url: string,
  groovyFile: string,
  jsessionid: string | null,
  // eslint-disable-next-line max-params
) => {
  const groovyScript = fs.readFileSync(groovyFile);
  const encodedScript = encodeURIComponent(groovyScript.toString());

  const groovyResponse = await submitGroovy(
    username,
    password,
    url,
    encodedScript,
    jsessionid,
  );
  return groovyResponse;
};
