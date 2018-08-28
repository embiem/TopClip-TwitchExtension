import moment from "moment";
import { put, takeEvery, call, all, select } from "redux-saga/effects";

import { getTopClip, postClipClicked, getConfig } from "../../api/client";

export function* loadClip(action) {
  // fetch clip
  try {
    // fetch the clip from EBS
    const clip = yield call(getTopClip, action.channelId);
    if (!clip) throw new Error("No clip available!");

    console.log("clip fetched");
    yield put({ type: "SET_CLIP", clip });
  } catch (err) {
    yield put({ type: "SET_CLIP", clip: undefined });
    console.error(err);
  }
}

export function* loadConfig(action) {
  try {
    // fetch the clip from EBS
    const config = yield call(getConfig, action.channelId);
    if (!config) throw new Error("No config available!");

    console.log("config fetched");
    yield put({ type: "SET_CONFIG", config });
  } catch (err) {
    console.error(err);
  }
}

export function* openClip() {
  try {
    const { clip, channel } = yield select();
    const clipData = clip.data;

    try {
      const cachedTime = localStorage.getItem(`TopClip_ClickTime_${channel.id}`);
      if (!cachedTime) {
        throw new Error("No cached time!");
      }
      const clickTime = parseInt(cachedTime, 10);
      const curMoment = moment().subtract(10, "seconds");
      if (moment.unix(clickTime).isBefore(curMoment)) {
        throw new Error("Timestamp out of date!");
      }
    } catch (err) {
      // register the click & set time in localStorage
      localStorage.setItem(
        `TopClip_ClickTime_${channel.id}`,
        moment()
          .unix()
          .toString()
      );

      console.log("Click was registered");

      yield call(postClipClicked, clipData.slug);
    } finally {
      window.open(clipData.url, "_blank");
    }
  } catch (err) {
    console.error(err);
  }
}

// single entry point to start all Sagas at once
export default function* rootSaga() {
  yield all([
    takeEvery("LOAD_CLIP", loadClip),
    takeEvery("LOAD_CONFIG", loadConfig),
    takeEvery("OPEN_CLIP", openClip)
  ]);
}
