import { ObjectId } from "mongoose";

export interface Event {
  _id: ObjectId;
  title: string;
  desc: string;
  fullDesc: string;
  date: string;
  location: string;
  img: string;
  host?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface EventInput {
  title: string;
  desc: string;
  fullDesc: string;
  date: string;
  location: string;
  img: string;
  host?: string;
}

export interface EventUpdateInput {
  _id: ObjectId;
  title?: string;
  desc?: string;
  fullDesc?: string;
  date?: string;
  location?: string;
  img?: string;
  host?: string;
}
