import mongoose, { Schema } from "mongoose";
import {
  ProductType,
  ProductFormat,
  ProductStatus,
  ProductLanguage,
} from "../libs/enums/product.enum";

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
  { timestamps: true }
);

// Pre-save hook to migrate old field names to new ones
productSchema.pre('save', function(next) {
  if (this.productCollection && !this.productType) {
    this.productType = this.productCollection;
  }
  if (this.ProductType && !this.productFormat) {
    this.productFormat = this.ProductType;
  }
  next();
});

// Transform when converting to object/JSON to ensure new field names are present
productSchema.set('toJSON', {
  transform: function(doc, ret) {
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

export default mongoose.model("Product", productSchema);
