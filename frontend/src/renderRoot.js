import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";

function renderRoot(store) {
  // render appropriate view
  const rootViewer = document.getElementById("root-viewer");
  const rootConfig = document.getElementById("root-config");
  const rootLiveConfig = document.getElementById("root-liveconfig");
  const rootVideoComponent = document.getElementById("root-videocomponent");

  // load component based on current view (viewer/config etc.)
  // uses code-splitting for efficiency
  if (rootViewer) {
    import("./components/ViewerPage/Viewer.js").then(Viewer =>
      ReactDOM.render(
        <Provider store={store}>
          <Viewer.default />
        </Provider>,
        rootViewer
      )
    );
  } else if (rootVideoComponent) {
    import("./components/VideoComponentPage/VideoComponent.js").then(VideoComponent =>
      ReactDOM.render(
        <Provider store={store}>
          <VideoComponent.default />
        </Provider>,
        rootVideoComponent
      )
    );
  } else if (rootConfig) {
    import("semantic-ui-css/semantic.min.css")
      .catch(err => console.error(err))
      .then(() => import("./components/ConfigPage/Config.js"))
      .then(Config =>
        ReactDOM.render(
          <Provider store={store}>
            <Config.default />
          </Provider>,
          rootConfig
        )
      );
  } else if (rootLiveConfig) {
    import("./components/LiveConfigPage/LiveConfig.js").then(LiveConfig =>
      ReactDOM.render(
        <Provider store={store}>
          <LiveConfig.default />
        </Provider>,
        rootLiveConfig
      )
    );
  } else {
    console.error("Unsupported Page!");
  }
}

export default renderRoot;
