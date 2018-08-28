import axios from "axios";
import puppeteer from "puppeteer";

export const getChannelById = async ({ channelId }) => {
  // make the GET request
  try {
    const response = await axios.get(
      `https://api.twitch.tv/kraken/channels/${channelId}`,
      {
        headers: {
          Accept: `application/vnd.twitchtv.v5+json`,
          "Client-Id": process.env.CLIENT_ID
        }
      }
    );
    return response.data;
  } catch (err) {
    console.error(err);
    return false;
  }
};

export const getTopClip = async ({ channelName, timePeriod }) => {
  try {
    const response = await axios.get(
      `https://api.twitch.tv/kraken/clips/top?limit=1&channel=${channelName}&period=${timePeriod}`,
      {
        headers: {
          Accept: `application/vnd.twitchtv.v5+json`,
          "Client-Id": process.env.CLIENT_ID
        }
      }
    );
    return response.data;
  } catch (err) {
    console.error(err);
    return false;
  }
};


let browser;
let launchingBrowser = false;
// this is a TODO, we actually want to wait in any following
// requests until the first request was finished.
// otherwise it would try to get the clipSrc for a lot of embedUrls
// especially if a channel just went live and gets a lot of viewers
const gettingForUrl = {};
export const getClipSrc = async ({ clipEmbedUrl }) => {
  if (gettingForUrl[clipEmbedUrl]) {
    return false;
  }
  gettingForUrl[clipEmbedUrl] = true;
  let page;

  try {
    if (!browser && !launchingBrowser) {
      launchingBrowser = true;
      browser = await puppeteer.launch({timeout: 15000});
      launchingBrowser = false;
    }
    if (!browser) {
      // just return for now
      return false;
    }

    page = await browser.newPage();
    await page.goto(clipEmbedUrl, {
        waitUntil: "networkidle2",
        timeout: 8000
      }
    );
    const videoSrc = await page.evaluate(() =>
      // eslint-disable-next-line
      document.querySelector('video').src
    );
    page.close();
    gettingForUrl[clipEmbedUrl] = false;
    return videoSrc;
  } catch (err) {
    console.error(err);
    launchingBrowser = false;
    if (page && typeof page.close === "function") page.close();
    gettingForUrl[clipEmbedUrl] = false;
    return false;
  }
}

export default {
  getChannelById,
  getTopClip,
  getClipSrc
};
