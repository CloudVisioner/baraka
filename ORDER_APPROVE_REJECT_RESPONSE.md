# Order Approve/Reject API Response Values

## Endpoints

### 1. Approve Order
**POST** `/admin/order/approve`

**Request Body:**
```json
{
  "orderId": "507f1f77bcf86cd799439011"
}
```

**Success Response (200 OK):**
```json
{
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "orderTotal": 150.00,
    "orderDelivery": 5.00,
    "orderStatus": "FINISH",
    "memberId": "507f1f77bcf86cd799439012",
    "paymentImage": "payments/uuid-image.jpg",
    "createdAt": "2024-03-01T10:00:00.000Z",
    "updatedAt": "2024-03-01T11:30:00.000Z"
  },
  "message": "Order approved successfully"
}
```

**Error Response (400/404/500):**
```json
{
  "code": 400,
  "message": "UPDATE_FAILED"
}
```

---

### 2. Reject Order
**POST** `/admin/order/reject`

**Request Body:**
```json
{
  "orderId": "507f1f77bcf86cd799439011"
}
```

**Success Response (200 OK):**
```json
{
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "orderTotal": 150.00,
    "orderDelivery": 5.00,
    "orderStatus": "DELETE",
    "memberId": "507f1f77bcf86cd799439012",
    "paymentImage": "payments/uuid-image.jpg",
    "createdAt": "2024-03-01T10:00:00.000Z",
    "updatedAt": "2024-03-01T11:30:00.000Z"
  },
  "message": "Order rejected successfully"
}
```

**Error Response (400/404/500):**
```json
{
  "code": 400,
  "message": "UPDATE_FAILED"
}
```

---

## Response Structure Details

### Success Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `data` | Object | Complete order document from MongoDB |
| `data._id` | ObjectId (string) | Order unique identifier |
| `data.orderTotal` | Number | Total order amount |
| `data.orderDelivery` | Number | Delivery fee |
| `data.orderStatus` | String | **"FINISH"** (approve) or **"DELETE"** (reject) |
| `data.memberId` | ObjectId (string) | Customer ID who placed the order |
| `data.paymentImage` | String (optional) | Relative path to payment proof image |
| `data.createdAt` | Date (ISO string) | Order creation timestamp |
| `data.updatedAt` | Date (ISO string) | Last update timestamp (changes on approve/reject) |
| `message` | String | Success message |

---

## Status Values

### Before Approve:
- `orderStatus`: `"PROCESS"` or `"PAUSE"`

### After Approve:
- `orderStatus`: `"FINISH"`

### After Reject:
- `orderStatus`: `"DELETE"`

---

## Frontend Usage

### JavaScript/React Example:

```javascript
// Approve Order
const approveOrder = async (orderId) => {
  try {
    const response = await axios.post('/admin/order/approve', {
      orderId: orderId
    });
    
    console.log('Response:', response.data);
    // {
    //   data: {
    //     _id: "...",
    //     orderStatus: "FINISH",  // ✅ Updated status
    //     orderTotal: 150.00,
    //     ...
    //   },
    //   message: "Order approved successfully"
    // }
    
    const updatedOrder = response.data.data;
    console.log('New Status:', updatedOrder.orderStatus); // "FINISH"
    
  } catch (error) {
    console.error('Error:', error.response?.data);
    // {
    //   code: 400,
    //   message: "UPDATE_FAILED"
    // }
  }
};

// Reject Order
const rejectOrder = async (orderId) => {
  try {
    const response = await axios.post('/admin/order/reject', {
      orderId: orderId
    });
    
    console.log('Response:', response.data);
    // {
    //   data: {
    //     _id: "...",
    //     orderStatus: "DELETE",  // ✅ Updated status
    //     orderTotal: 150.00,
    //     ...
    //   },
    //   message: "Order rejected successfully"
    // }
    
    const updatedOrder = response.data.data;
    console.log('New Status:', updatedOrder.orderStatus); // "DELETE"
    
  } catch (error) {
    console.error('Error:', error.response?.data);
  }
};
```

---

## Complete Response Example

### Approve Response:
```json
{
  "data": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "orderTotal": 125.50,
    "orderDelivery": 5.00,
    "orderStatus": "FINISH",
    "memberId": "65a1b2c3d4e5f6g7h8i9j0k2",
    "paymentImage": "payments/336625e5-d0ab-4444-b484-bd5b85535d7e.jpg",
    "createdAt": "2024-03-15T08:30:00.000Z",
    "updatedAt": "2024-03-15T09:45:00.000Z"
  },
  "message": "Order approved successfully"
}
```

### Reject Response:
```json
{
  "data": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "orderTotal": 125.50,
    "orderDelivery": 5.00,
    "orderStatus": "DELETE",
    "memberId": "65a1b2c3d4e5f6g7h8i9j0k2",
    "paymentImage": "payments/336625e5-d0ab-4444-b484-bd5b85535d7e.jpg",
    "createdAt": "2024-03-15T08:30:00.000Z",
    "updatedAt": "2024-03-15T09:45:00.000Z"
  },
  "message": "Order rejected successfully"
}
```

---

## Key Points

1. **Status Change**: The `orderStatus` field is the main value that changes
   - Approve: `"PROCESS"` → `"FINISH"`
   - Reject: `"PROCESS"` → `"DELETE"`

2. **Updated Timestamp**: The `updatedAt` field automatically updates when status changes

3. **Complete Order Object**: The response includes the full order document, not just the status

4. **Frontend Visibility**: When frontend calls `GET /order/all`, it will see the updated status in the order object

---

## Response Codes

- **200 OK**: Success - Order status updated
- **400 Bad Request**: Invalid orderId or update failed
- **404 Not Found**: Order not found
- **500 Internal Server Error**: Server error
