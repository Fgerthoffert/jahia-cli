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
    console.log('Docker Hub authentication obtained from credentials');
    return getToken.data.token;
  }
  console.log('Failed to fetch token from Docker hub');
  return null;
};

export default getToken;
