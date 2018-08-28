import mongoose from "mongoose";

const ChannelSchema = new mongoose.Schema({
  channelId: {
    type: String,
    required: true,
    minLength: 1,
    trim: true,
    unique: true
  },
  channelName: {
    type: String
  },
  config: mongoose.Schema.Types.Mixed,
  clicks: mongoose.Schema.Types.Mixed
});

export const Channel = mongoose.model(
  "Channel",
  ChannelSchema
);

export default Channel;
