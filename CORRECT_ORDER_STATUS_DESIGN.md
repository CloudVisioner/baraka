# Correct Order Status Flow Design

## Status Flow Diagram

```
PAUSE → PENDING → PROCESS → FINISH
         ↓
      REJECTED (can re-upload → PENDING)
```

## Status Definitions

| Status | Meaning | Who Sets It | When |
|--------|---------|-------------|------|
| **PAUSE** | No payment proof uploaded | System | Order created |
| **PENDING** | Payment proof uploaded, awaiting admin approval | Customer | When customer uploads payment image |
| **PROCESS** | Admin approved, order being processed/shipped | Admin | When admin clicks "Approve" |
| **REJECTED** | Admin rejected payment proof, user can re-upload | Admin | When admin clicks "Reject" |
| **FINISH** | Customer confirmed receipt, order completed | Customer | When customer marks order as received |
| **DELETE** | Soft delete (legacy, use REJECTED instead) | System | Deprecated |

## Status Transitions

### Valid Transitions:

1. **PAUSE → PENDING**
   - Trigger: Customer uploads payment proof
   - Endpoint: `POST /order/update` (with paymentImage file)

2. **PENDING → PROCESS**
   - Trigger: Admin approves order
   - Endpoint: `POST /admin/order/approve`

3. **PENDING → REJECTED**
   - Trigger: Admin rejects order
   - Endpoint: `POST /admin/order/reject`

4. **REJECTED → PENDING**
   - Trigger: Customer re-uploads payment proof
   - Endpoint: `POST /order/update` (with paymentImage file)

5. **PROCESS → FINISH**
   - Trigger: Customer confirms receipt
   - Endpoint: `POST /order/update` (with orderStatus: "FINISH")

### Invalid Transitions:
- ❌ PAUSE → PROCESS (must go through PENDING first)
- ❌ PENDING → FINISH (must be approved first)
- ❌ REJECTED → PROCESS (must re-upload first)

## API Endpoint Specifications

### 1. Customer Uploads Payment Proof
**POST** `/order/update`

**Request:**
- `multipart/form-data`
- `orderId`: string (required)
- `paymentImage`: file (required)
- `orderStatus`: not required (auto-set to PENDING)

**Response:**
```json
{
  "_id": "...",
  "orderStatus": "PENDING",  // ✅ Changed from PAUSE or REJECTED
  "paymentImage": "payments/uuid.jpg",
  ...
}
```

**Status Change:**
- `PAUSE` → `PENDING`
- `REJECTED` → `PENDING`

---

### 2. Admin Approves Order
**POST** `/admin/order/approve`

**Request:**
```json
{
  "orderId": "507f1f77bcf86cd799439011"
}
```

**Response:**
```json
{
  "data": {
    "_id": "...",
    "orderStatus": "PROCESS",  // ✅ Changed from PENDING
    ...
  },
  "message": "Order approved successfully"
}
```

**Status Change:**
- `PENDING` → `PROCESS`

---

### 3. Admin Rejects Order
**POST** `/admin/order/reject`

**Request:**
```json
{
  "orderId": "507f1f77bcf86cd799439011"
}
```

**Response:**
```json
{
  "data": {
    "_id": "...",
    "orderStatus": "REJECTED",  // ✅ Changed from PENDING
    ...
  },
  "message": "Order rejected successfully"
}
```

**Status Change:**
- `PENDING` → `REJECTED`

---

### 4. Customer Confirms Receipt
**POST** `/order/update`

**Request:**
```json
{
  "orderId": "507f1f77bcf86cd799439011",
  "orderStatus": "FINISH"
}
```

**Response:**
```json
{
  "_id": "...",
  "orderStatus": "FINISH",  // ✅ Changed from PROCESS
  ...
}
```

**Status Change:**
- `PROCESS` → `FINISH`

---

## Frontend Tab Organization

### Tab 1: Awaiting Payment Proof
**Statuses:** `PAUSE`, `PENDING`, `REJECTED`

- Shows orders waiting for payment or admin approval
- Customer can upload payment proof here
- Admin can approve/reject PENDING orders

**Query:**
```javascript
GET /order/all?orderStatus=PAUSE
GET /order/all?orderStatus=PENDING
GET /order/all?orderStatus=REJECTED
```

### Tab 2: Processing
**Statuses:** `PROCESS`

- Shows orders approved by admin, being processed/shipped
- Customer can mark as received here

**Query:**
```javascript
GET /order/all?orderStatus=PROCESS
```

### Tab 3: Completed
**Statuses:** `FINISH`

- Shows orders where customer confirmed receipt
- Final state, no further actions

**Query:**
```javascript
GET /order/all?orderStatus=FINISH
```

---

## Backend Implementation Changes

### ✅ Fixed Changes:

1. **OrderStatus Enum** - Added `PENDING` and `REJECTED`
   ```typescript
   export enum OrderStatus {
     PAUSE = "PAUSE",
     PENDING = "PENDING",      // ✅ NEW
     PROCESS = "PROCESS",
     REJECTED = "REJECTED",    // ✅ NEW
     FINISH = "FINISH",
     DELETE = "DELETE"
   }
   ```

2. **Admin Approve Endpoint** - Sets status to `PROCESS` (not `FINISH`)
   ```typescript
   // ✅ FIXED
   orderController.approveOrder = async (req, res) => {
     const result = await orderService.updateOrderStatus(orderId, OrderStatus.PROCESS);
     // Status: PENDING → PROCESS
   }
   ```

3. **Admin Reject Endpoint** - Sets status to `REJECTED` (not `DELETE`)
   ```typescript
   // ✅ FIXED
   orderController.rejectOrder = async (req, res) => {
     const result = await orderService.updateOrderStatus(orderId, OrderStatus.REJECTED);
     // Status: PENDING → REJECTED
   }
   ```

4. **Payment Upload** - Sets status to `PENDING` (not `PROCESS`)
   ```typescript
   // ✅ FIXED
   if (req.file) {
     // Payment image uploaded
     if (orderStatus === PAUSE || orderStatus === REJECTED) {
       input.orderStatus = OrderStatus.PENDING;
     }
   }
   ```

5. **Customer Confirm Receipt** - Sets status to `FINISH`
   ```typescript
   // Already correct
   if (input.orderStatus === OrderStatus.FINISH) {
     // Award points
   }
   ```

---

## Current vs Correct Behavior

### Before (Incorrect):

| Action | Old Status | New Status (Wrong) | Should Be |
|--------|-----------|-------------------|-----------|
| Customer uploads payment | PAUSE | PROCESS ❌ | PENDING ✅ |
| Admin approves | PENDING | FINISH ❌ | PROCESS ✅ |
| Admin rejects | PENDING | DELETE ❌ | REJECTED ✅ |

### After (Correct):

| Action | Old Status | New Status (Correct) |
|--------|-----------|---------------------|
| Customer uploads payment | PAUSE/REJECTED | PENDING ✅ |
| Admin approves | PENDING | PROCESS ✅ |
| Admin rejects | PENDING | REJECTED ✅ |
| Customer confirms receipt | PROCESS | FINISH ✅ |

---

## Testing Checklist

### Test Case 1: Customer Uploads Payment
- [ ] Create order (status: PAUSE)
- [ ] Upload payment proof
- [ ] Verify status changes to PENDING
- [ ] Verify paymentImage is saved

### Test Case 2: Admin Approves
- [ ] Order with status PENDING
- [ ] Admin clicks "Approve"
- [ ] Verify status changes to PROCESS
- [ ] Verify response contains updated order

### Test Case 3: Admin Rejects
- [ ] Order with status PENDING
- [ ] Admin clicks "Reject"
- [ ] Verify status changes to REJECTED
- [ ] Verify response contains updated order

### Test Case 4: Customer Re-uploads After Rejection
- [ ] Order with status REJECTED
- [ ] Customer uploads new payment proof
- [ ] Verify status changes to PENDING
- [ ] Admin can approve/reject again

### Test Case 5: Customer Confirms Receipt
- [ ] Order with status PROCESS
- [ ] Customer marks as received
- [ ] Verify status changes to FINISH
- [ ] Verify points are awarded

### Test Case 6: Frontend Tab Filtering
- [ ] Tab 1: Shows PAUSE, PENDING, REJECTED
- [ ] Tab 2: Shows PROCESS
- [ ] Tab 3: Shows FINISH

---

## Database Schema

### Order Model
```typescript
{
  orderStatus: {
    type: String,
    enum: ["PAUSE", "PENDING", "PROCESS", "REJECTED", "FINISH", "DELETE"],
    default: "PAUSE"
  },
  paymentImage: String,  // Relative path: "payments/uuid.jpg"
  ...
}
```

---

## Frontend Integration Notes

1. **Status Display**: Update UI to show all new statuses with appropriate colors
   - PAUSE: Orange
   - PENDING: Orange/Yellow (awaiting approval)
   - PROCESS: Blue (approved, processing)
   - REJECTED: Red (rejected, can re-upload)
   - FINISH: Green (completed)

2. **Button Visibility**:
   - PENDING orders: Show "Approve" and "Reject" buttons (admin)
   - PROCESS orders: Show "Mark as Received" button (customer)
   - REJECTED orders: Show "Re-upload Payment" button (customer)

3. **Tab Logic**:
   ```javascript
   // Awaiting Payment Proof Tab
   const awaitingOrders = orders.filter(o => 
     ['PAUSE', 'PENDING', 'REJECTED'].includes(o.orderStatus)
   );
   
   // Processing Tab
   const processingOrders = orders.filter(o => 
     o.orderStatus === 'PROCESS'
   );
   
   // Completed Tab
   const completedOrders = orders.filter(o => 
     o.orderStatus === 'FINISH'
   );
   ```

---

## Migration Notes

If you have existing orders in the database:

1. **REJECTED orders**: Update any orders with status "DELETE" to "REJECTED"
   ```javascript
   db.orders.updateMany(
     { orderStatus: "DELETE" },
     { $set: { orderStatus: "REJECTED" } }
   )
   ```

2. **PENDING orders**: Orders with paymentImage but status "PROCESS" should be "PENDING" if not yet approved
   ```javascript
   // Review manually - these might be legitimately PROCESS if already approved
   ```

---

## Summary

✅ **Status Flow**: PAUSE → PENDING → PROCESS → FINISH  
✅ **Rejection Flow**: PENDING → REJECTED → PENDING (re-upload)  
✅ **Admin Approve**: Sets to PROCESS (not FINISH)  
✅ **Admin Reject**: Sets to REJECTED (not DELETE)  
✅ **Payment Upload**: Sets to PENDING (not PROCESS)  
✅ **Customer Confirm**: Sets to FINISH (from PROCESS)

All backend changes have been implemented correctly.
