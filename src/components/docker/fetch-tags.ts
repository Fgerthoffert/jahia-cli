import axios from 'axios';

// https://github.com/docker/hub-feedback/issues/1914
const fetchTags = async (
  repository: string,
  username: string,
  password: string,
) => {
  let token = null;
  const getToken = await axios.get(
    'https://auth.docker.io/token?service=registry-1.docker.io&scope=repository:$repo:pull',
    {
      auth: {
        username: username,
        password: password,
      },
    },
  );
  if (getToken.data === undefined) {
    console.log('ERROR: Unable to fetch token from credentials');
  } else {
    token = getToken.data.token;
  }
  // console.log(response);
  if (getToken !== null) {
    console.log(token);
    const response = await axios.get(repository, {
      headers: {
        Authorization: 'Bearer ' + token,
        Accept: 'application/vnd.docker.distribution.manifest.v2+json',
      },
    });
    console.log(response);
  }

  // curl https://registry-1.docker.io/v2/$repo/$url -H "Authorization: Bearer $token" -L -H "Accept: application/vnd.docker.distribution.manifest.v2+json" "$@"
};

export default fetchTags;
