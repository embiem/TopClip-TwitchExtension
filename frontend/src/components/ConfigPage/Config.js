import React from "react";
import { connect } from "react-redux";
import {
  Form,
  Label,
  Image,
  Radio,
  Segment,
  Header,
  Icon,
  List,
  Card,
  Message,
  Checkbox
} from "semantic-ui-react";

import Clip from "../Clip/Clip.js";
import Loader from "../Loader/Loader";
import DrawtasticImg from "./drawtastic_screen.png";

import { getConfig, postConfig, getTopClipClicks } from "../../api/client";

import "./Config.css";

const producePeriodFormField = (key, name, currentPeriod, setPeriod) => (
  <Form.Field inline={true}>
      <label>
        <Radio
          value={key}
          checked={currentPeriod === key}
          onChange={() => setPeriod(key)}
        />
        <Label
          className={`period-label ${
            currentPeriod === key ? "checked" : ""
          }`}
        >
          {name}
        </Label>
      </label>
  </Form.Field>
)

class Config extends React.Component {
  state = {
    isPosting: true,
    error: "",
    time: "all",
    useStaticImage: true,
    autoPlay: false
  };

  componentDidMount() {
    getConfig(this.props.channelId).then(result => {
      this.props.setConfig(result);
      this.setState(state => ({ ...state, isPosting: false, ...result }));
    });

    getTopClipClicks(this.props.channelId).then(result => {
      this.props.setTopClipClicks(result);
    });
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.time !== this.state.time ||
        prevState.useStaticImage !== this.state.useStaticImage ||
        prevState.autoPlay !== this.state.autoPlay
    ) {
      this.applyConfig();
    }
  }

  applyConfig = () => {

    // build the config object
    var config = {
      time: this.state.time,
      useStaticImage: this.state.useStaticImage,
      autoPlay: this.state.autoPlay
    };

    // set isPosting to disable Apply button
    this.setState({ isPosting: true, error: "" });

    // post the config to EBS
    postConfig(config)
      .then(result => {
        this.props.setConfig(result);
        this.setState({ isPosting: false, ...result });
        this.props.refreshClip(this.props.channelId);
      })
      .catch(err => {
        this.setState({ isPosting: false, error: err.message });
      });
  };

  render() {
    const { isInverted } = this.props;

    const loadingConfigUpdate = this.state.isPosting;
    const useIframe = !this.state.useStaticImage;
    const autoPlay = this.state.autoPlay;
    const period = this.state.time;
    const setPeriod = (key) => this.setState({time: key});

    return (
      <div className="config">
        <Header inverted={isInverted} as="h2">
          <Icon name="play circle" />
          <Header.Content>
            Preview
            <Header.Subheader>
              This is your current TopClip:
            </Header.Subheader>
          </Header.Content>
        </Header>
        <Segment>
          {this.state.isPosting ? (
            <Loader />
          ) : (
            <Clip
              clip={this.props.clip}
              showInIframe={useIframe}
              autoPlay={this.state.autoPlay}
              onClick={this.props.onClipClick}
            />
          )}
          <Message info><p>If no clip loads, please select a different Time-Period below.</p></Message>
        </Segment>

        <Header inverted={isInverted} as="h2">
          <Icon name="settings" />
          <Header.Content>
            Settings
            <Header.Subheader>
              Manage your channel's configuration of the Drawtastic extension.
            </Header.Subheader>
          </Header.Content>
        </Header>
        <Form loading={loadingConfigUpdate}>
          <Header as='h3' attached='top'>
            Time-Period
          </Header>
          <Segment attached>
            <p>
              Set the period to look for your TopClip. If in doubt, select "All Time".
            </p>

            <Form.Group inline={true}>
              {producePeriodFormField("day", "Day", period, setPeriod)}
              {producePeriodFormField("week", "Week", period, setPeriod)}
              {producePeriodFormField("month", "month", period, setPeriod)}
              {producePeriodFormField("all", "All Time", period, setPeriod)}
            </Form.Group>

          </Segment>

          <Segment.Group attached>
          <Header as='h3' attached='top'>
            Presentation
          </Header>
          <Segment attached>
            <Label color='teal' ribbon='left'>
              New!
            </Label>
            <p>Choose whether to show a static preview image or an actual video player to show your clip.</p>
            <Form.Group inline={true}>
              <label>{useIframe ? "Using Video-Player" : "Using Static Image"}</label>
              <Checkbox
                toggle
                checked={useIframe}
                onChange={(e, data) =>
                  this.setState({useStaticImage: !data.checked})}
              />
            </Form.Group>
          </Segment>

            <Segment attached>
            <Label color='teal' ribbon='left'>
              New!
            </Label>
              <p>Choose whether to Auto-Play the clip on initial load.</p>
              <p>This will also force the Video-Component to be visible for the first 10 seconds after load, even while not hovering over it.</p>
            <Form.Group inline={true}>
              <label>{autoPlay ? "Will Auto-Play" : "Won't Auto-Play"}</label>
              <Checkbox
                toggle
                checked={autoPlay}
                onChange={(e, data) =>
                  this.setState({autoPlay: data.checked})}
              />
            </Form.Group>
            </Segment>

          </Segment.Group>
        </Form>

        <Header inverted={isInverted} as="h2">
          <Icon name="info circle" />
          <Header.Content>
            How-To
            <Header.Subheader>Learn how to use TopClip</Header.Subheader>
          </Header.Content>
        </Header>
        <Segment>
          <List ordered>
            <List.Item>Choose the time-period.</List.Item>
            <List.Item>Select whether you want a preview Image or Video-Player.</List.Item>
            <List.Item>Activate TopClip either as Panel or as Video-Component.</List.Item>
            <List.Item>See the Video-Component while hovering over it, or the panel below your stream!</List.Item>
          </List>
        </Segment>

        <Header inverted={isInverted} as="h2">
          <Icon name="chart bar" />
          <Header.Content>
            Statistics
            <Header.Subheader>Some stats about your TopClips</Header.Subheader>
          </Header.Content>
        </Header>
        <Segment>
          <Label pointing="below">
            These are your 3 most-clicked TopClips:
          </Label>
          <List ordered>
            {Object.keys(this.props.topClipClicks).map(slug => (
              <List.Item key={slug}>
                <a href={`https://clips.twitch.tv/${slug}`} target="_blank">
                  {slug} ({this.props.topClipClicks[slug]})
                </a>
              </List.Item>
          ))}
          </List>
        </Segment>

        <Header inverted={isInverted} as="h2">
          <Icon name="mail" />
          <Header.Content>
            Contact
            <Header.Subheader>Send your Feedback and Issues.</Header.Subheader>
          </Header.Content>
        </Header>
        <Segment>
          <Label color='teal' ribbon='left'>
            New!
          </Label>
          <p>Have feature requests? Issues? General feedback?</p>
          <p>[AD] Do you want something unique for your own channel?
            I also develop custom-tailored extensions.</p>
          <p>Send me a mail: <Label>
            <Icon name="mail" />{" "}
            <a
              href={`mailto:tedobrian4real@gmail.com?Subject=${encodeURIComponent(
                "TopClip Issues and Feedback"
              )}&body=${encodeURIComponent(`<3`)}`}
              target="_blank"
            >
              tedobrian4real@gmail.com
            </a>
          </Label></p>
        </Segment>

        <Header inverted={isInverted} as="h2">
          <Icon name="external" />
          <Header.Content>
            Other
            <Header.Subheader>
              Have a look at my other extensions.
            </Header.Subheader>
          </Header.Content>
        </Header>
        <Segment>
        <Label color='teal' ribbon='left'>
              New!
            </Label>
          <Card
            as="a"
            href="https://www.twitch.tv/ext/rh6jq1q334hqc2rr1qlzqbvwlfl3x0"
            target="_blank"
          >
            <Image src={DrawtasticImg} />
            <Card.Content>
              <Card.Header>Drawtastic</Card.Header>
              <Card.Meta>Guessing games right on stream, where one to three players draw something and everybody can guess in chat.</Card.Meta>
              <Card.Description>
              Each player draws a word. Their drawings are being sent to all viewers on your channel in real-time. All viewers can guess what is being drawn, by typing words in chat.
 Let the best artists win!
              </Card.Description>
            </Card.Content>
          </Card>
        </Segment>

      </div>
    );
  }
}

const mapStateToProps = state => ({
  clip: state.clip.data,
  channelId: state.channel.id,
  userToken: state.user.token,
  config: state.config.data,
  topClipClicks: state.clip.topClipClicks,
  isInverted: state.context.theme === "dark"
});

const mapDispatchToProps = dispatch => ({
  onClipClick: () => dispatch({ type: "OPEN_CLIP" }),
  setConfig: config => dispatch({ type: "SET_CONFIG", config }),
  refreshClip: channelId => dispatch({ type: "LOAD_CLIP", channelId }),
  setTopClipClicks: topClipClicks =>
    dispatch({ type: "SET_TOP_CLIP_CLICKS", topClipClicks })
});

export default connect(mapStateToProps, mapDispatchToProps)(Config);
