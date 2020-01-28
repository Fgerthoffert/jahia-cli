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
    if (error.response.data.errinfo !== undefined) {
      console.log(error.response.data.errinfo);
    }
  }
  if (response !== null && response.data.results !== undefined) {
    return response.data.results;
  }
  return [];
};

export default getEndpoint;
