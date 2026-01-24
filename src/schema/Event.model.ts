import mongoose, { Schema } from "mongoose";

const eventSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      maxlength: 80,
    },
    desc: {
      type: String,
      required: true,
      maxlength: 150,
    },
    fullDesc: {
      type: String,
      required: true,
      maxlength: 1000,
    },
    date: {
      type: String,
      required: true,
      maxlength: 50,
    },
    location: {
      type: String,
      required: true,
      maxlength: 100,
    },
    img: {
      type: String,
      required: true,
    },
    host: {
      type: String,
      maxlength: 100,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Event", eventSchema);
