import "babel-polyfill";
import "../config/config";
import "./index.css";
import renderRoot from "./renderRoot";
import { configure } from "./redux/configureStore";

const store = configure();
window.reduxStore = store;

if (window.Twitch.ext) {
  window.Twitch.ext.onAuthorized(async auth => {
    console.log(auth);
    store.dispatch({
      type: "SET_USER_INFO",
      clientId: auth.clientId,
      token: auth.token,
      userId: auth.userId
    });
    store.dispatch({ type: "SET_CHANNEL", id: auth.channelId });
    store.dispatch({ type: "LOAD_CLIP", channelId: auth.channelId });
    store.dispatch({ type: "LOAD_CONFIG", channelId: auth.channelId });

    renderRoot(store);
  });

  let contextOnce = false;
  window.Twitch.ext.onContext(context => {
    if (contextOnce) return;
    console.log(context);
    store.dispatch({ type: "SET_CONTEXT", context });
    contextOnce = true;
  });

  window.Twitch.ext.onError(err => {
    console.error(err);
  });
} else {
  console.error("Could not find Twitch.ext object");
}

