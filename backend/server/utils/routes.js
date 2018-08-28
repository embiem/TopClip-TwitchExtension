import produce from "immer";
import moment from "moment";
import redis from "./redis";
import twitchClient from "./twitchClient";
import Channel from "../db/models/channel";

const defaultConfig = {
  time: "week",
  trending: false
};

async function getConfig({ channelId }) {
  // first check redis
  const channelConfig = await redis.getObject(`config.${channelId}`);
  if (channelConfig) {
    return channelConfig;
  }

  // then check mongoDB
  const persistedChannel = await Channel.findOne({ channelId });
  if (persistedChannel) {
    // cache on redis
    await redis.setObject(`config.${channelId}`, persistedChannel.config);

    return persistedChannel.config;
  }

  // lastly, return defaultConfig object
  await saveConfig({ channelId, config: defaultConfig });
  return defaultConfig;
}

async function saveConfig({ channelId, config }) {
  try {
    let persistedChannel = await Channel.findOne({ channelId });

    // if not yet persisted, create new channel entry
    if (!persistedChannel) persistedChannel = new Channel({ channelId });

    // save new channel config
    persistedChannel.config = produce(config, draftState => draftState);
    await persistedChannel.save();

    // cache the channel config on redis
    await redis.setObject(`config.${channelId}`, persistedChannel.config);

    // remove currently cached clip to load new clip on next getClip request
    await redis.delete(`clip.${channelId}`);

    // return the new config
    return persistedChannel.config;
  } catch (err) {
    console.error("Could not persist channel: ", err.toString());
  }
  return false;
}

async function saveClicks({ channelId, clicks }) {
  try {
    let persistedChannel = await Channel.findOne({ channelId });

    // if not yet persisted, create new channel entry
    if (!persistedChannel) persistedChannel = new Channel({ channelId });

    // save new channel config
    persistedChannel.clicks = produce(clicks, draftState => draftState);
    await persistedChannel.save();

    // return the new clicks
    return persistedChannel.clicks;
  } catch (err) {
    console.error("Could not persist channel: ", err.toString());
  }
  return false;
}

async function getTopClip({ channelId }) {
  const clipCacheMoment = moment().subtract(15, "minutes");
  const channelCacheMoment = moment().subtract(60, "minutes");

  // check TTL & return cached clip
  const cachedClip = await redis.getObject(`clip.${channelId}`);
  if (
    cachedClip &&
    moment.unix(cachedClip.cached_timestamp).isAfter(clipCacheMoment)
  ) {
    return cachedClip;
  }

  // load config
  const config = await getConfig({ channelId });
  const cachedChannel = await redis.getObject(channelId);
  let channelName = "";

  if (
    cachedChannel &&
    moment.unix(cachedChannel.cached_timestamp).isAfter(channelCacheMoment)
  ) {
    channelName = cachedChannel.name;
  } else {
    // load channel object & cache it
    const channelObj = await twitchClient.getChannelById({ channelId });
    await redis.setObject(channelId, {
      cached_timestamp: moment().unix(),
      ...channelObj
    });
    channelName = channelObj.name;
  }

  const clipList = await twitchClient.getTopClip({
    channelName,
    timePeriod: config.time,
    useTrending: config.trending
  });
  if (clipList && clipList.clips.length > 0) {
    const theTopClip = clipList.clips[0];

    let clipSrc = false;
    if (!config.useStaticImage) {
      clipSrc = await twitchClient.getClipSrc({
        clipEmbedUrl: theTopClip.embed_url
      });
    }

    const clip = {
      cached_timestamp: moment().unix(),
      slug: theTopClip.slug,
      url: theTopClip.url,
      curator: Object.assign({}, theTopClip.curator),
      title: theTopClip.title,
      views: theTopClip.views,
      created_at: theTopClip.created_at,
      thumbnails: Object.assign({}, theTopClip.thumbnails),
      clipSrc
    };

    // cache on redis
    await redis.setObject(`clip.${channelId}`, clip);

    return clip;
  }

  return false;
}

export async function handleGetConfig(req, res) {
  try {
    const { channel_id } = req.decodedToken;

    redis.incr("getConfig");

    const config = await getConfig({ channelId: channel_id });
    res.send({ config });
  } catch (err) {
    console.error("Coult not handleGetConfig: ", err.toString());
    res.status(500).send(err);
  }
}

export async function handlePostConfig(req, res) {
  try {
    const { channel_id, role } = req.decodedToken;
    const { updateConfigObj } = req.body;

    redis.incr("postConfig");

    if (role === "broadcaster") {
      const channelConfig = await redis.getObject(`config.${channel_id}`);
      const finalConfig = {
        ...(channelConfig ? channelConfig : defaultConfig),
        ...updateConfigObj
      };

      // persist & cache
      const newConfig = await saveConfig({
        channelId: channel_id,
        config: finalConfig
      });

      if (newConfig) {
        res.send({ config: newConfig });
      } else {
        res.status(400).send("Could not update config!");
      }
    }
  } catch (err) {
    console.error("Coult not handlePostConfig: ", err.toString());
    res.status(500).send(err);
  }
}

export async function handleGetTopClip(req, res) {
  try {
    const { channel_id } = req.decodedToken;

    redis.incr("getTopClip");

    const clip = await getTopClip({ channelId: channel_id });
    res.send({ clip });
  } catch (err) {
    console.error("Coult not handleGetTopClip: ", err.toString());
    res.status(500).send(err);
  }
}

export async function handlePostClick(req, res) {
  try {
    const { channel_id } = req.decodedToken;
    const { slug } = req.params;

    redis.incr("postClick");

    // increment slug's value
    let channelClicks = await redis.getObject(`clicks.${channel_id}`);
    if (!channelClicks) {
      const persistedChannel = await Channel.findOne({ channelId: channel_id });
      if (persistedChannel.clicks) {
        channelClicks = persistedChannel.clicks;
      } else {
        channelClicks = {};
      }
    }

    const newChannelClicks = {
      ...channelClicks,
      [slug]: channelClicks[slug] ? channelClicks[slug] + 1 : 1
    };
    await redis.setObject(`clicks.${channel_id}`, newChannelClicks);

    // save to mongoDB every 5 clicks
    if (newChannelClicks[slug] < 5 || newChannelClicks[slug] % 5 === 0) {
      saveClicks({ channelId: channel_id, clicks: newChannelClicks });
    }

    res.send({ clicks: newChannelClicks });
  } catch (err) {
    console.error("Coult not handlePostTopClipClick: ", err.toString());
    res.status(500).send(err);
  }
}

export async function handleGetClicks(req, res) {
  try {
    const { channel_id, role } = req.decodedToken;

    redis.incr("getClicks");

    if (role === "broadcaster") {
      let channelClicks = await redis.getObject(`clicks.${channel_id}`);
      if (channelClicks) {
        res.send({ clicks: channelClicks });
      } else {
        const persistedChannel = await Channel.findOne({
          channelId: channel_id
        });
        channelClicks =
          persistedChannel && persistedChannel.clicks
            ? persistedChannel.clicks
            : {};
        await redis.setObject(`clicks.${channel_id}`, channelClicks);
        res.send({ clicks: channelClicks });
      }
    } else {
      res.status(400).send();
    }
  } catch (err) {
    console.error("Coult not handleGetTopClipClicks: ", err.toString());
    res.status(500).send(err);
  }
}
