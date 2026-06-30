import { ExtendedRequest, AdminRequest } from "../libs/types/member";
import { T } from "../libs/types/common";
import Errors from "../libs/Error";
import { HttpCode } from "../libs/Error";
import { Response } from "express";
import OrderService from "../models/Order.service";
import { OrderInquiry, OrderUpdateInput } from "../libs/types/order";
import { OrderStatus } from "../libs/enums/order.enum";
import path from "path";

const orderService = new OrderService();
const orderController: T = {};

orderController.createOrder = async (req: ExtendedRequest, res: Response) => {
  try {
    console.log("createOrder");
    const result = await orderService.createOrder(req.member, req.body);

    res.status(HttpCode.OK).json(result);
  } catch (err) {
    console.log("Error, getProduct:", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard.code);
  }
};

orderController.getMyOrders = async (req: ExtendedRequest, res: Response) => {
  try {
    console.log("getMyOrders");
    console.log("getMyOrders");
    const { page, limit, orderStatus } = req.query;
    const inquiry: OrderInquiry = {
      page: Number(page),
      limit: Number(limit),
      orderStatus: orderStatus as OrderStatus,
    };
    console.log(":inquiry", inquiry);
    

    const result = await orderService.getMyOrders(req.member, inquiry);

    res.status(HttpCode.CREATED).json(result);
  } catch (err) {
    console.log("Error, getProduct:", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard.code);
  }
};

orderController.updateOrder = async (req: ExtendedRequest, res: Response) => {
  try {
    res.set('Cache-Control', 'no-store');
    res.set('ETag', '');

    const input: OrderUpdateInput = req.body;
    
    if (req.file) {
      const uploadsBasePath = path.join(process.cwd(), 'uploads');
      const relativePath = path.relative(uploadsBasePath, req.file.path);
      input.paymentImage = relativePath.replace(/\\/g, "/");
      
      if (!input.orderStatus || input.orderStatus === OrderStatus.PAUSE || input.orderStatus === OrderStatus.REJECTED) {
        input.orderStatus = OrderStatus.PENDING;
      }
    }

    const result = await orderService.updateOrder(req.member, input);

    res.status(HttpCode.OK).json(result);
  } catch (err) {
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard.code);
  }
};

orderController.getAllOrdersAdmin = async (req: AdminRequest, res: Response) => {
  try {
    const data = await orderService.getAllOrders();
    res.render("orders", { orders: data });
  } catch (err) {
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard.code);
  }
};

orderController.approveOrder = async (req: AdminRequest, res: Response) => {
  try {
    const { orderId } = req.body;
    const result = await orderService.updateOrderStatus(orderId, OrderStatus.PROCESS);
    res.status(HttpCode.OK).json({ data: result, message: "Order approved successfully" });
  } catch (err) {
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard.code);
  }
};

orderController.rejectOrder = async (req: AdminRequest, res: Response) => {
  try {
    const { orderId } = req.body;
    const result = await orderService.updateOrderStatus(orderId, OrderStatus.REJECTED);
    res.status(HttpCode.OK).json({ data: result, message: "Order rejected successfully" });
  } catch (err) {
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard.code);
  }
};

export default orderController;
