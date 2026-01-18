import mongoose, { Schema } from "mongoose";
import {
  ProductType,
  ProductFormat,
  ProductStatus,
  ProductLanguage,
} from "../libs/enums/product.enum";

//Schema first & code first

const productSchema = new Schema(
  {
    productStatus: {
      type: String,
      enum: ProductStatus,
      default: ProductStatus.PAUSE,
    },

    productType: {
      type: String,
      enum: ProductType,
    },

    // Backward compatibility: old field name
    productCollection: {
      type: String,
      enum: ProductType,
    },

    productName: {
      type: String,
      required: true,
    },

    productAuthor: {
      type: String,
    },

    productPublisher: {
      type: String,
    },

    productPublicationDate: {
      type: String,
    },

    productLanguage: {
      type: String,
      enum: ProductLanguage,
    },

    productPageCount: {
      type: Number,
    },

    productPrice: {
      type: Number,
      required: true,
    },

    productLeftCount: {
      type: Number,
      required: true,
    },

    productFormat: {
      type: String,
      enum: ProductFormat,
      default: ProductFormat.PAPERBACK,
    },

    // Backward compatibility: old field name
    ProductType: {
      type: String,
      enum: ProductFormat,
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

// Pre-save hook to migrate old field names to new ones
productSchema.pre('save', function(next) {
  // Migrate productCollection to productType
  if (this.productCollection && !this.productType) {
    this.productType = this.productCollection;
  }
  // Migrate ProductType to productFormat
  if (this.ProductType && !this.productFormat) {
    this.productFormat = this.ProductType;
  }
  next();
});

// Transform when converting to object/JSON to ensure new field names are present
productSchema.set('toJSON', {
  transform: function(doc, ret) {
    // Ensure new field names exist, using old names as fallback
    if (ret.productCollection && !ret.productType) {
      ret.productType = ret.productCollection;
    }
    if (ret.ProductType && !ret.productFormat) {
      ret.productFormat = ret.ProductType;
    }
    return ret;
  }
});

productSchema.set('toObject', {
  transform: function(doc, ret) {
    // Ensure new field names exist, using old names as fallback
    if (ret.productCollection && !ret.productType) {
      ret.productType = ret.productCollection;
    }
    if (ret.ProductType && !ret.productFormat) {
      ret.productFormat = ret.ProductType;
    }
    return ret;
  }
});

productSchema.index(
  { productName: 1, productFormat: 1 },
  { unique: true }
);
export default mongoose.model("Product", productSchema); // making a real mongoDB collection.

// THIS IS A DATABASE BLUEPRINT FOR USERS....
