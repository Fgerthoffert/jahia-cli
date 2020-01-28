import axios from 'axios';

const getEndpoint = async (endpoint: string, token: string) => {
  let response = null;
  try {
    response = await axios.get(endpoint, {
      headers: {
        Cookie: 'token=' + token,
      },
    });
  } catch (error) {
    console.log(error);
  }
  if (response !== null && response.data.results !== undefined) {
    return response.data.results;
  }
  return null;
};

export default getEndpoint;
