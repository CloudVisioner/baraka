import mongoose, { Schema } from "mongoose";
import { MemberStatus, MemberType } from "../libs/enums/member.enum";

//Schema first & code first

const memberSchema = new Schema(
  {
    memberType: {
      type: String,
      enum: MemberType,
      default: MemberType.USER, // by default FALSE
    },

    memberStatus: {
      type: String,
      enum: MemberStatus,
      default: MemberStatus.ACTIVE, // by default FALSE
    },

    memberNick: {
      type: String,
      index: { unique: true, sparse: true },
      required: true,
    },

    memberPhone: {
      type: String,
      index: { unique: true, sparse: true },
      required: true,
    },
    memberPassword: {
      type: String,
      select: false, // doesnt give this data
      required: true,
    },
    memberAddress: {
      type: String,
    },

    memberDesc: {
      type: String,
    },
    memberImage: {
      type: String,
    },
    memberPoints: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true } // data of update & create
);

export default mongoose.model("Member", memberSchema); // making a real mongoDB collection.

// THIS IS A DATABASE BLUEPRINT FOR USERS....
