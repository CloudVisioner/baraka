import {
  ProductStatus,
  ProductType,
  ProductFormat,
} from "../enums/product.enum";
import { ObjectId } from "mongoose";

export interface Product {
  _id: ObjectId;
  productStatus: ProductStatus;
  productType: ProductType;
  productName: string;
  productPrice: number;
  productLeftCount: number;
  productFormat: ProductFormat;
  productDesc?: string;
  productImages: string[];
  productViews: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductInquiry {
  order: string;
  page: number;
  limit: number;
  productType?: ProductType;
  search?: string;
}

export interface ProductInput {
  productStatus?: ProductStatus;
  productType: ProductType;
  productName: string;
  productPrice: number;
  productLeftCount: number;
  productFormat?: ProductFormat;
  productDesc?: string;
  productImages?: string[];
  productViews?: number;
}

export interface ProductUpdateInput {
  _id: ObjectId;
  productStatus?: ProductStatus;
  productType?: ProductType;
  productName?: string;
  productPrice?: number;
  productLeftCount?: number;
  productFormat?: ProductFormat;
  productDesc?: string;
  productImages?: string[];
  productViews?: number;
}
