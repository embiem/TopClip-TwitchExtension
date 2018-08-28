import React from "react";
import { connect } from "react-redux";

import Clip from "../Clip/Clip";
import Loader from "../Loader/Loader";

import "./Viewer.css";

class Viewer extends React.Component {
  render() {
    return (
      <div>
        {this.props.clip ? (
          <Clip
            clip={this.props.clip}
            showInIframe={!this.props.useStaticImage}
            autoPlay={this.props.autoPlay}
            onClick={this.props.onClipClick}
          />
        ) : (
          <Loader />
        )}
      </div>
    );
  }
}

const mapStateToProps = state => ({
  clip: state.clip.data,
  useStaticImage: state.config.data.useStaticImage,
  autoPlay: state.config.data.autoPlay
});

const mapDispatchToProps = dispatch => ({
  onClipClick: () => dispatch({ type: "OPEN_CLIP" })
});

export default connect(mapStateToProps, mapDispatchToProps)(Viewer);
