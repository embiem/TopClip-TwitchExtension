import React from "react";
import { connect } from "react-redux";

import Clip from "../Clip/Clip";
import Loader from "../Loader/Loader";

import "./VideoComponent.css";

const wait = (amount = 0) => new Promise(resolve => setTimeout(resolve, amount));

class VideoComponent extends React.Component {
  state = {
    show: false,
    autoPlay: false
  }

  componentDidMount() {
    console.log("didMount", this.props);
    if (this.props.autoPlay) {
      this.show();
    }
  }

  componentDidUpdate(prevProps) {
    console.log("didUpdate", prevProps, this.props);
    if (!prevProps.autoPlay && this.props.autoPlay) {
      this.show();
    }
  }

  componentWillUnmount() {
    if (this.timeout) clearTimeout(this.timeout);
  }

  show = async () => {
    if (typeof this.timeout !== "undefined" || !this.props.autoPlay) return;

    // series of events for force showing automatically
    await wait(2600);
    this.setState({ autoPlay: true });
    // little buffer to allow the iframe to load
    await wait(400);
    this.setState({ show: true });
    // show it for 10 seconds, then hide again
    await wait(10000);
    this.setState({ show: false })
  }

  render() {
    return (
      <div
        style={this.state.show ? {opacity: 1} : {}}
        className="show-on-hover"
      >
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
  autoPlay: state.config.data.autoPlay,
});

const mapDispatchToProps = dispatch => ({
  onClipClick: () => dispatch({ type: "OPEN_CLIP" })
});

export default connect(mapStateToProps, mapDispatchToProps)(VideoComponent);
