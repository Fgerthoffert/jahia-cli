import axios from 'axios';

// https://github.com/docker/hub-feedback/issues/1914
// https://github.com/RyanTheAllmighty/Docker-Hub-API
const getToken = async (username: string, password: string) => {
  const getToken = await axios.post(
    'https://hub.docker.com/v2/users/login/',
    {
      username,
      password,
    },
    {
      headers: { 'content-type': 'application/json' },
    },
  );
  if (getToken.data.token !== undefined) {
    return getToken.data.token;
  }
  return null;
};

export default getToken;
