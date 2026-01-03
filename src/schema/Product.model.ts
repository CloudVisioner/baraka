import mongoose, { Schema } from "mongoose";
import {
  ProductCollection,
  ProductType,
  ProductStatus,
} from "../libs/enums/product.enum";

//Schema first & code first

const productSchema = new Schema(
  {
    productStatus: {
      type: String,
      enum: ProductStatus,
      default: ProductStatus.PAUSE,
    },

    productCollection: {
      type: String,
      enum: ProductCollection,
      required: true,
    },

    productName: {
      type: String,
      required: true,
    },

    productPrice: {
      type: Number,
      required: true,
    },

    productLeftCount: {
      type: Number,
      required: true,
    },

    ProductType: {
      type: String,
      enum: ProductType,
      default: ProductType.PAPERBACK,
    },

    productDesc: {
      type: String,
    },

    productImages: {
      type: [String],
      default: [],
    },

    productViews: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true } // data of update & create
);

productSchema.index(
  { productName: 1, productSize: 1, productVolume: 1 },
  { unique: true }
);
export default mongoose.model("Product", productSchema); // making a real mongoDB collection.

// THIS IS A DATABASE BLUEPRINT FOR USERS....
