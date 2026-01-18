import { Request, Response } from "express";
import Errors, { HttpCode, Message } from "../libs/Error";
import { T } from "../libs/types/common";
import ProductService from "../models/Product.service";
import { AdminRequest, ExtendedRequest } from "../libs/types/member";
import { ProductInput, ProductInquiry } from "../libs/types/product";
import { ProductType } from "../libs/enums/product.enum";
import path from "path";

const productController: T = {};
const productService = new ProductService();

/** SPA */

productController.getProducts = async (req: Request, res: Response) => {
  try {
    console.log("getProducts");

    const query = req.query;
    const { page, limit, order, productType, search } = req.query;
    const inquiry: ProductInquiry = {
      order: String(order),
      page: Number(page),
      limit: Number(limit),
    };

    if (productType) {
      inquiry.productType = productType as ProductType;
    }

    if (search) inquiry.search = String(search);

    const result = await productService.getProducts(inquiry);

    res.status(HttpCode.OK).json(result);
  } catch (err) {
    console.log("Error, getProducts:", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard.code);
  }
};

productController.getProduct = async (req: ExtendedRequest, res: Response) => {
  try {
    console.log("getProduct");
    console.log("get_user:", req.member);
    const { id } = req.params; // destruction
    const memberId = req.member?._id ?? null, // retrieve
      result = await productService.getProduct(memberId, id);

    res.status(HttpCode.OK).json(result);
  } catch (err) {
    console.log("Error, getProduct:", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard.code);
  }
};

/** SSR */

productController.getAllProducts = async (req: AdminRequest, res: Response) => {
  // Handles the req, async (await) waiting the tasks until they are finished
  try {
    console.log("getAllProducts");
    const data = await productService.getAllProduct(); //CALL
    console.log("products:", data);

    res.render("products", { products: data });
  } catch (err) {
    console.log("Error, getAllProducts:", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard.code);
  }
};

productController.createNewProduct = async (
  req: AdminRequest,
  res: Response
) => {
  // Handles the req, async (await) waiting the tasks until they are finished
  try {
    console.log("createNewProduct");
    console.log("req.files:", req.files);

    if (!req.files?.length)
      // ? gives undefined if file doesnt exist.
      throw new Errors(HttpCode.INTERNAL_SERVER_ERROR, Message.CREATE_FAILED);

    const data: ProductInput = req.body;
    
    // Validate numeric fields - prevent negative values
    if (data.productPrice !== undefined && Number(data.productPrice) < 0) {
      throw new Errors(HttpCode.BAD_REQUEST, Message.NEGATIVE_PRICE);
    }
    if (data.productLeftCount !== undefined && Number(data.productLeftCount) < 0) {
      throw new Errors(HttpCode.BAD_REQUEST, Message.NEGATIVE_COUNT);
    }
    if (data.productPageCount !== undefined && Number(data.productPageCount) < 0) {
      throw new Errors(HttpCode.BAD_REQUEST, Message.NEGATIVE_PAGE_COUNT);
    }
    
    if (req.files?.length) {
      const uploadsBasePath = path.join(process.cwd(), 'uploads');
      data.productImages = req.files.map((ele) => {
        const relativePath = path.relative(uploadsBasePath, ele.path);
        return relativePath.replace(/\\/g, "/"); // data path for storing in DB
    });
    }

    console.log("data", data);

    await productService.createNewProduct(data);

    res.send(
      `<script>alert("Successful creation"); window.location.replace('/admin/product/all') </script>`
    );
  } catch (err) {
    console.log("Error, createNewProduct:", err);
    const message =
      err instanceof Errors ? err.message : Message.SOMETHING_WENT_WRONG;
    res.send(
      `<script>alert("${message}"); window.location.replace('/admin/product/all') </script>`
    );
  }
};

productController.updateChosenProduct = async (req: Request, res: Response) => {
  // Handles the req, async (await) waiting the tasks until they are finished
  try {
    console.log("updateChosenProduct");
    const id = req.params.id; // ulr variables are in params
    console.log("req.params", req.params);

    const data = req.body;
    
    // Validate numeric fields - prevent negative values
    if (data.productPrice !== undefined && Number(data.productPrice) < 0) {
      throw new Errors(HttpCode.BAD_REQUEST, Message.NEGATIVE_PRICE);
    }
    if (data.productLeftCount !== undefined && Number(data.productLeftCount) < 0) {
      throw new Errors(HttpCode.BAD_REQUEST, Message.NEGATIVE_COUNT);
    }
    if (data.productPageCount !== undefined && Number(data.productPageCount) < 0) {
      throw new Errors(HttpCode.BAD_REQUEST, Message.NEGATIVE_PAGE_COUNT);
    }

    const result = await productService.updateChosenProduct(id, data);

    res.status(HttpCode.OK).json({ data: result });
  } catch (err) {
    console.log("Error, updateChosenProduct:", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard.code);
  }
};

export default productController;
