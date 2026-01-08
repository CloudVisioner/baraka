import Errors from "../libs/Error";
import ProductModel from "../schema/Product.model";
import { HttpCode } from "../libs/Error";
import { Message } from "../libs/Error";
import { ProductInput, ProductInquiry } from "../libs/types/product";
import { Product } from "../libs/types/product";
import { shapeIntoMongooseObjectId } from "../libs/config";
import { ProductStatus } from "../libs/enums/product.enum";
import { T } from "../libs/types/common";
import { ObjectId } from "mongoose";
import ViewService from "./View.service";
import { ViewInput } from "../libs/types/view";
import { ViewGroup } from "../libs/enums/view.enum";

class ProductService {
  private readonly productModel;
  public viewService;

  constructor() {
    this.productModel = ProductModel;
    this.viewService = new ViewService();
  }

  /** SPA */

  public async getProducts(inquiry: ProductInquiry): Promise<Product[]> {
    const match: T = { productStatus: ProductStatus.PROCESS };

    if (inquiry.productType)
      match.productType = inquiry.productType;

    if (inquiry.search) {
      match.productName = { $regex: new RegExp(inquiry.search, "i") };
    }

    const sort: T =
      inquiry.order === "productPrice"
        ? { [inquiry.order]: 1 } // ascending
        : { [inquiry.order]: -1 }; // descending

    const result = await this.productModel
      .aggregate([
        { $match: match },
        { $sort: sort },
        { $skip: (inquiry.page * 1 - 1) * inquiry.limit }, 
        { $limit: inquiry.limit * 1 }, // Complex Query Pipline
      ])
      .exec();

    if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);

    return result;
  }

  public async getProduct(
    memberId: ObjectId | null, //??? ...!!
    id: string
  ): Promise<Product> {
    const productId = shapeIntoMongooseObjectId(id);

    let result = await this.productModel
      .findOne({
        _id: productId,
        productProcess: ProductStatus.PROCESS,
      })
      .exec();

    if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);

    if (memberId) {
      const input: ViewInput = {
        memberId: memberId,
        viewRefId: productId,
        viewGroup: ViewGroup.PRODUCT, // views of product
      };
      const existView = await this.viewService.checkViewExistence(input);

      console.log("existView:", !!existView); // ???
      if (!existView) {
        //Insert View
        console.log("Planing to inset new .....");
        await this.viewService.insertMemberView(input);

        //Increase Counts

        result = await this.productModel
          .findByIdAndUpdate(
            productId, // filter
            { $inc: { productViews: +1 } }, // update
            { new: true } // option return updated data
          )
          .exec();
      }
    }

    return result;
  }

  /** SSR */

  public async getAllProduct(): Promise<Product[]> {
    const result = await this.productModel.find().exec();
    if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);

    // The schema transform will handle mapping old field names to new ones
    return result;
  }

  public async createNewProduct(input: ProductInput): Promise<Product> {
    try {
      return await this.productModel.create(input);
    } catch (err) {
      console.error("Error, model:createNewProduct:", err);
      throw new Errors(HttpCode.BAD_REQUEST, Message.CREATE_FAILED);
    }
  }

  public async updateChosenProduct(
    id: string,
    input: ProductInput
  ): Promise<Product> {
    id = shapeIntoMongooseObjectId(id); // convert mongoDB object -> proper matching, cuz id is string.

    const result = await this.productModel
      .findOneAndUpdate({ _id: id }, input, { new: true })
      .exec();

    if (!result) throw new Errors(HttpCode.NOT_MODIFIED, Message.UPDATE_FAILED);

    return result;
  }
}

export default ProductService;
