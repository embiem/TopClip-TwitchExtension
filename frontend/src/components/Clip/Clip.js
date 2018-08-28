import React, { Component } from "react";
import PropTypes from "prop-types";
import ReactHoverObserver from "react-hover-observer";

import PlaySVG from "./PlaySVG";
import NoAvatarPNG from "./noavatar.png";

const styles = {
  clip: {
    display: "block",
    width: "318px",
    height: "180px",
    cursor: "pointer"
  },

  noTopClip: {
    width: "100%",
    height: "180px",
    lineHeight: "180px",
    textAlign: "center",
    border: "1px solid gainsboro"
  },

  container: {
    backgroundSize: "cover",
    height: "180px",
    userSelect: "none"
  },

  topbar: {
    position: "relative",
    top: "5px",
    right: "5px",
    display: "flex",
    flexWrap: "nowrap",
    flexDirection: "row-reverse",
    opacity: 0.35,
    transition: "opacity 0.5s"
  },

  logo: {
    width: "40px",
    height: "40px"
  },

  title: {
    display: "flex",
    flexDirection: "column-reverse",
    justifyContent: "center",

    paddingLeft: "4px",
    textAlign: "right",
    fontSize: "20px",
    color: "white",
    textShadow: "black 0.05em 0.05em 0.1em",

    paddingRight: "4px",
    verticalAlign: "center"
  },

  titleSpan: {
    whiteSpace: "nowrap",
    maxWidth: "260px",
    textOverflow: "ellipsis",
    overflow: "hidden",
    paddingRight: "8px"
  },

  play: {
    position: "relative",
    width: "100px",

    left: "100px",
    right: "100px",
    top: "10px",

    transition: "opacity 0.5s",

    opacity: 0.35
  }
};

class Clip extends Component {
  state = {
    videoEnded: false
  }

  render() {
    const { clip, onClick, showInIframe, autoPlay, muted } = this.props;

    if (!clip || !clip.curator)
      return (
        <div style={styles.clip}>
          <div style={styles.noTopClip}>No TopClip available!</div>
        </div>
      );

    const logoSrc = clip.curator.logo || NoAvatarPNG;
    const hoverStyle = {
      opacity: "0.85"
    };

    return (
      <div style={styles.clip}>
        {
          showInIframe && clip.clipSrc && !this.state.videoEnded ?
            <video
              src={clip.clipSrc}
              poster={clip.thumbnails.medium}
              onClick={onClick}
              height="180"
              width="318"
              autoPlay={autoPlay}
              controls={!autoPlay}
              muted={muted}
              loop={false}
              onEnded={() => this.setState({videoEnded: true})}
            /> :
            <ReactHoverObserver>
            {({ isHovering }) => (
              <div
                onClick={onClick}
                style={{
                  ...styles.container,
                  backgroundImage: `url("${clip.thumbnails.medium}")`
                }}
              >
                <div
                  style={{ ...styles.topbar, ...(isHovering ? hoverStyle : {}) }}
                >
                  <img
                    src={logoSrc}
                    style={styles.logo}
                    alt="Logo"
                    title={`created by ${clip.curator.display_name}`}
                  />
                  <div style={styles.title} title={clip.title}>
                    <span style={styles.titleSpan}>{clip.title}</span>
                  </div>
                </div>
                <div
                  style={{ ...styles.play, ...(isHovering ? hoverStyle : {}) }}
                >
                  <PlaySVG width={100} height={100} />
                </div>
              </div>
            )}
          </ReactHoverObserver>
        }
      </div>
    );
  }
}

Clip.defaultProps = {
  onClick: () => console.warn("No onClick handler for Clip!"),
  showInIframe: false,
  autoPlay: false,
  muted: true
};

Clip.propTypes = {
  clip: PropTypes.object,
  onClick: PropTypes.func,
  showInIframe: PropTypes.bool,
  autoPlay: PropTypes.bool,
  muted: PropTypes.bool
};

export default Clip;
