import axios from "axios";

export async function getTopClip() {
  const response = await axios.get(`${window.config.EBS_URI}/clip`, {
    headers: {
      token: window.reduxStore.getState().user.token
    }
  });
  console.log(response);
  return response.data.clip;
}

export async function getConfig() {
  const response = await axios.get(`${window.config.EBS_URI}/config`, {
    headers: {
      token: window.reduxStore.getState().user.token
    }
  });
  console.log(response);
  return response.data.config;
}

export async function getTopClipClicks() {
  const response = await axios.get(`${window.config.EBS_URI}/clicks`, {
    headers: {
      token: window.reduxStore.getState().user.token
    }
  });
  console.log(response);
  return response.data.clicks;
}

export async function postClipClicked(clipSlug) {
  const response = await axios.post(
    `${window.config.EBS_URI}/click/${clipSlug}`,
    {},
    {
      headers: {
        token: window.reduxStore.getState().user.token
      }
    }
  );
  console.log(response);
  return response.status;
}

export async function postConfig(config) {
  const response = await axios.post(
    `${window.config.EBS_URI}/config`,
    { updateConfigObj: config },
    {
      headers: {
        token: window.reduxStore.getState().user.token
      }
    }
  );
  console.log(response);
  return response.data.config;
}
