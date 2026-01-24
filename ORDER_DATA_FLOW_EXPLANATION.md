# Order Data Flow: Admin → Frontend

## Overview
This document explains how order data flows from the admin panel to the frontend, including how status changes (Approve/Reject) are propagated.

---

## Part 1: Admin Receives Order Data

### Flow: Admin Views Orders Page

```
Admin Browser → GET /admin/order/all → Server → Database → Server → EJS Template → HTML Response
```

### Step-by-Step Process:

1. **Admin Request** (`GET /admin/order/all`)
   - Route: `router-admin.ts` → `orderController.getAllOrdersAdmin`
   - Authentication: `verifyRestaurant` middleware checks if admin is logged in

2. **Controller** (`orderController.getAllOrdersAdmin`)
   ```typescript
   // src/controller/order.controller.ts:76-84
   orderController.getAllOrdersAdmin = async (req: AdminRequest, res: Response) => {
     const data = await orderService.getAllOrders();
     res.render("orders", { orders: data });  // Server-side rendering
   }
   ```

3. **Service Layer** (`orderService.getAllOrders()`)
   ```typescript
   // src/models/Order.service.ts:154-194
   public async getAllOrders(): Promise<Order[]> {
     const result = await this.orderModel.aggregate([
       { $sort: { createdAt: -1 } },
       {
         $lookup: {
           from: "orderItems",
           localField: "_id",
           foreignField: "orderId",
           as: "orderItems",
         },
       },
       {
         $lookup: {
           from: "products",
           localField: "orderItems.productId",
           foreignField: "_id",
           as: "productData",
         },
       },
       {
         $lookup: {
           from: "members",
           localField: "memberId",
           foreignField: "_id",
           as: "memberData",
         },
       },
       {
         $unwind: {
           path: "$memberData",
           preserveNullAndEmptyArrays: true,
         },
       },
     ]).exec();
     return result;
   }
   ```

4. **Database Query**
   - Fetches all orders from MongoDB
   - Joins with `orderItems` collection (order line items)
   - Joins with `products` collection (product details)
   - Joins with `members` collection (customer information)
   - Returns complete order data with all relationships

5. **Server-Side Rendering**
   - Data is passed to EJS template: `res.render("orders", { orders: data })`
   - Template (`orders.ejs`) renders HTML with order data embedded
   - HTML sent to admin browser

### Data Structure Admin Receives:

```javascript
[
  {
    _id: "507f1f77bcf86cd799439011",
    orderTotal: 150.00,
    orderDelivery: 5.00,
    orderStatus: "PROCESS",  // Current status
    paymentImage: "payments/uuid.jpg",
    createdAt: "2024-03-01T10:00:00.000Z",
    updatedAt: "2024-03-01T10:00:00.000Z",
    
    // Populated from orderItems collection
    orderItems: [
      {
        _id: "...",
        itemQuantity: 2,
        itemPrice: 25.00,
        productId: "...",
        orderId: "..."
      }
    ],
    
    // Populated from products collection
    productData: [
      {
        _id: "...",
        productName: "Book Title",
        productImages: ["products/uuid.jpg"],
        productPrice: 25.00
      }
    ],
    
    // Populated from members collection
    memberData: {
      _id: "...",
      memberNick: "Customer Name",
      memberPhone: "+1234567890",
      memberAddress: "123 Main St"
    }
  }
]
```

---

## Part 2: Admin Updates Order Status (Approve/Reject)

### Flow: Admin Clicks Approve/Reject Button

```
Admin Browser → POST /admin/order/approve → Server → Database Update → JSON Response → Page Reload
```

### Step-by-Step Process:

#### A. Approve Order

1. **Admin Action** (JavaScript in `orders.js`)
   ```javascript
   // User clicks "Approve" button
   $(".approve-order-btn").on("click", async function (e) {
     const orderId = $(this).data("order-id");
     const response = await axios.post("/admin/order/approve", {
       orderId: orderId
     });
     location.reload(); // Refresh page to show updated status
   });
   ```

2. **Backend Route** (`POST /admin/order/approve`)
   - Route: `router-admin.ts` → `orderController.approveOrder`
   - Authentication: `verifyRestaurant` middleware

3. **Controller** (`orderController.approveOrder`)
   ```typescript
   // src/controller/order.controller.ts:86-95
   orderController.approveOrder = async (req: AdminRequest, res: Response) => {
     const { orderId } = req.body;
     const result = await orderService.updateOrderStatus(orderId, OrderStatus.FINISH);
     res.status(HttpCode.OK).json({ 
       data: result, 
       message: "Order approved successfully" 
     });
   }
   ```

4. **Service Layer** (`orderService.updateOrderStatus()`)
   ```typescript
   // src/models/Order.service.ts:196-213
   public async updateOrderStatus(
     orderId: string,
     orderStatus: OrderStatus
   ): Promise<Order> {
     const id = shapeIntoMongooseObjectId(orderId);
     
     const result = await this.orderModel.findByIdAndUpdate(
       { _id: id },
       { orderStatus: orderStatus },  // Updates to "FINISH"
       { new: true }  // Returns updated document
     ).exec();
     
     return result;
   }
   ```

5. **Database Update**
   - MongoDB updates the order document
   - `orderStatus` field changes from `"PROCESS"` to `"FINISH"`
   - `updatedAt` timestamp is automatically updated

6. **Response & Page Reload**
   - Server returns JSON: `{ data: updatedOrder, message: "..." }`
   - JavaScript reloads the page
   - Admin sees updated status (green "FINISH" badge)

#### B. Reject Order

Same flow as Approve, but:
- Endpoint: `POST /admin/order/reject`
- Status changes to: `OrderStatus.DELETE`
- Displayed as: "REJECTED" (red badge)

---

## Part 3: Frontend Receives Updated Order Data

### Flow: Frontend Fetches Orders

```
Frontend App → GET /order/all?orderStatus=PROCESS → Server → Database → JSON Response → Frontend
```

### Step-by-Step Process:

1. **Frontend Request** (React/JavaScript)
   ```javascript
   // Frontend code example
   const fetchOrders = async (status) => {
     const response = await fetch(
       `http://localhost:3003/order/all?page=1&limit=10&orderStatus=${status}`
     );
     const orders = await response.json();
     return orders;
   };
   
   // Fetch orders by status
   const processingOrders = await fetchOrders('PROCESS');
   const finishedOrders = await fetchOrders('FINISH');
   const rejectedOrders = await fetchOrders('DELETE');
   ```

2. **Backend Route** (`GET /order/all`)
   - Route: `router.ts` → `orderController.getMyOrders`
   - Authentication: `verifyAuth` middleware (customer must be logged in)

3. **Controller** (`orderController.getMyOrders`)
   ```typescript
   // src/controller/order.controller.ts:27-48
   orderController.getMyOrders = async (req: ExtendedRequest, res: Response) => {
     const { page, limit, orderStatus } = req.query;
     const inquiry: OrderInquiry = {
       page: Number(page),
       limit: Number(limit),
       orderStatus: orderStatus as OrderStatus,  // Optional filter
     };
     
     const result = await orderService.getMyOrders(req.member, inquiry);
     res.status(HttpCode.CREATED).json(result);  // Returns JSON array
   }
   ```

4. **Service Layer** (`orderService.getMyOrders()`)
   ```typescript
   // src/models/Order.service.ts:77-115
   public async getMyOrders(
     member: Member,
     inquiry: OrderInquiry
   ): Promise<Order[]> {
     const memberId = shapeIntoMongooseObjectId(member._id);
     const matches: any = { memberId: memberId };
     
     // Optional status filter
     if (inquiry.orderStatus) {
       matches.orderStatus = inquiry.orderStatus;
     }
     
     const result = await this.orderModel.aggregate([
       { $match: matches },  // Filter by member + optional status
       { $sort: { updatedAt: -1 } },
       { $skip: (inquiry.page - 1) * inquiry.limit },
       { $limit: inquiry.limit },
       {
         $lookup: {
           from: "orderItems",
           localField: "_id",
           foreignField: "orderId",
           as: "orderItems",
         },
       },
       {
         $lookup: {
           from: "products",
           localField: "orderItems.productId",
           foreignField: "_id",
           as: "productData",
         },
       },
     ]).exec();
     
     return result;
   }
   ```

5. **Database Query**
   - Filters orders by:
     - `memberId` (only customer's own orders)
     - `orderStatus` (if provided in query)
   - Joins with `orderItems` and `products`
   - Returns paginated results

6. **JSON Response to Frontend**
   ```json
   [
     {
       "_id": "507f1f77bcf86cd799439011",
       "orderTotal": 150.00,
       "orderDelivery": 5.00,
       "orderStatus": "FINISH",  // ✅ Updated status from admin action
       "paymentImage": "payments/uuid.jpg",
       "createdAt": "2024-03-01T10:00:00.000Z",
       "updatedAt": "2024-03-01T11:30:00.000Z",  // ✅ Updated timestamp
       "orderItems": [...],
       "productData": [...]
     }
   ]
   ```

---

## Complete Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    COMPLETE ORDER DATA FLOW                      │
└─────────────────────────────────────────────────────────────────┘

1. ADMIN VIEWS ORDERS
   ┌──────────┐     GET /admin/order/all     ┌──────────┐
   │  Admin   │ ────────────────────────────> │  Server  │
   │ Browser  │                               │          │
   └──────────┘                               └────┬─────┘
                                                    │
                                                    │ Query MongoDB
                                                    │ (aggregate with lookups)
                                                    ▼
                                              ┌──────────┐
                                              │Database  │
                                              │(Orders + │
                                              │ Items +   │
                                              │ Products +│
                                              │ Members)  │
                                              └────┬──────┘
                                                    │
                                                    │ Return data
                                                    ▼
                                              ┌──────────┐
                                              │  Server  │
                                              │  (EJS    │
                                              │  Render)  │
                                              └────┬──────┘
                                                    │
                                                    │ HTML with embedded data
                                                    ▼
   ┌──────────┐     HTML Response            ┌──────────┐
   │  Admin   │ <─────────────────────────── │  Server  │
   │ Browser  │                               │          │
   └──────────┘                               └──────────┘

2. ADMIN APPROVES ORDER
   ┌──────────┐     POST /admin/order/approve ┌──────────┐
   │  Admin   │ ─────────────────────────────> │  Server  │
   │ Browser  │  { orderId: "..." }           │          │
   └──────────┘                               └────┬──────┘
                                                    │
                                                    │ Update orderStatus
                                                    │ to "FINISH"
                                                    ▼
                                              ┌──────────┐
                                              │Database  │
                                              │(Update   │
                                              │ Order)   │
                                              └────┬──────┘
                                                    │
                                                    │ Return updated order
                                                    ▼
                                              ┌──────────┐
                                              │  Server  │
                                              │  (JSON   │
                                              │  Response)│
                                              └────┬──────┘
                                                    │
                                                    │ { data: {...}, message: "..." }
                                                    ▼
   ┌──────────┐     JSON Response            ┌──────────┐
   │  Admin   │ <─────────────────────────── │  Server  │
   │ Browser  │                               │          │
   └──────────┘                               └──────────┘
         │
         │ Page reloads
         │ (shows updated status)
         ▼

3. FRONTEND FETCHES ORDERS
   ┌──────────┐     GET /order/all?orderStatus=FINISH ┌──────────┐
   │Frontend  │ ────────────────────────────────────> │  Server  │
   │   App    │                                       │          │
   └──────────┘                                       └────┬─────┘
                                                           │
                                                           │ Query MongoDB
                                                           │ (filter by memberId
                                                           │  + orderStatus)
                                                           ▼
                                                     ┌──────────┐
                                                     │Database  │
                                                     │(Orders + │
                                                     │ Items +   │
                                                     │ Products) │
                                                     └────┬──────┘
                                                           │
                                                           │ Return filtered data
                                                           ▼
                                                     ┌──────────┐
                                                     │  Server  │
                                                     │  (JSON   │
                                                     │  Response)│
                                                     └────┬──────┘
                                                           │
                                                           │ JSON array
                                                           ▼
   ┌──────────┐     JSON Response                ┌──────────┐
   │Frontend  │ <─────────────────────────────── │  Server  │
   │   App    │  [{ orderStatus: "FINISH", ... }]│          │
   └──────────┘                                   └──────────┘
         │
         │ Updates UI
         │ (shows order in "Completed" tab)
         ▼
```

---

## Key Points

### 1. **Two Different Data Delivery Methods**

- **Admin Panel**: Server-Side Rendering (SSR)
  - Uses EJS templates
  - Data embedded in HTML
  - Full page reload on updates

- **Frontend App**: API (JSON)
  - RESTful endpoints
  - JSON responses
  - Can update UI without full reload

### 2. **Status Changes Propagate Automatically**

When admin approves/rejects:
1. Database is updated immediately
2. Next time frontend fetches orders, it gets the updated status
3. No polling or WebSockets needed (simple polling works)

### 3. **Data Consistency**

- Both admin and frontend read from the same MongoDB database
- Status changes are atomic (single database update)
- Frontend sees changes on next API call

### 4. **Frontend Status Filtering**

Frontend can filter orders by status:
```javascript
// Get all processing orders
GET /order/all?page=1&limit=10&orderStatus=PROCESS

// Get all completed orders
GET /order/all?page=1&limit=10&orderStatus=FINISH

// Get all rejected orders
GET /order/all?page=1&limit=10&orderStatus=DELETE

// Get all orders (no filter)
GET /order/all?page=1&limit=10
```

---

## Example: Complete Status Change Flow

### Initial State:
- Order Status: `PAUSE` (awaiting payment)

### Step 1: Customer Uploads Payment
```
POST /order/update
Body: { orderId: "...", paymentImage: <file> }
→ Status changes to: PROCESS
```

### Step 2: Admin Views Order
```
GET /admin/order/all
→ Admin sees order with status "PROCESS"
→ Approve/Reject buttons are visible
```

### Step 3: Admin Approves
```
POST /admin/order/approve
Body: { orderId: "..." }
→ Status changes to: FINISH
→ Database updated
```

### Step 4: Frontend Fetches Orders
```
GET /order/all?orderStatus=FINISH
→ Frontend receives order with status "FINISH"
→ Order appears in "Completed" tab
```

---

## API Endpoints Summary

### Admin Endpoints (Server-Side Rendering)
- `GET /admin/order/all` - View all orders (HTML page)
- `POST /admin/order/approve` - Approve order (JSON response)
- `POST /admin/order/reject` - Reject order (JSON response)

### Frontend Endpoints (JSON API)
- `GET /order/all?page=1&limit=10&orderStatus=PROCESS` - Get customer's orders
- `POST /order/update` - Update order (upload payment proof)
- `POST /order/create` - Create new order

---

## Database Schema

### Order Document
```javascript
{
  _id: ObjectId,
  orderTotal: Number,
  orderDelivery: Number,
  orderStatus: String,  // "PAUSE" | "PROCESS" | "FINISH" | "DELETE"
  memberId: ObjectId,   // Reference to Member
  paymentImage: String, // Relative path: "payments/uuid.jpg"
  createdAt: Date,
  updatedAt: Date
}
```

### Related Collections
- `orderItems` - Order line items (quantity, price, productId)
- `products` - Product details (name, images, price)
- `members` - Customer information (name, phone, address)

---

## Conclusion

The system uses a **shared database** approach:
1. Admin updates order status in database
2. Frontend queries the same database
3. Status changes are immediately visible to frontend on next API call
4. No real-time synchronization needed (polling is sufficient)

This is a simple, reliable pattern that works well for most e-commerce applications.
