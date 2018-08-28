const puppeteer = require('puppeteer');

const embed_url = "https://clips.twitch.tv/embed?clip=AwkwardHelplessSalamanderSwiftRage";

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(
    embed_url, {
      waitUntil: "networkidle2"
    }
  );
  const videoSrc = await page.evaluate(() =>
    document.querySelector('video').src
  );

  console.log("videoSrc: ", videoSrc);
  await browser.close();
})();