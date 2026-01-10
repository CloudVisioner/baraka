# 📸 Complete Image/Data Flow Documentation - Bookstore Application

## 📊 Overview
This application uses **Express + Multer + MongoDB + EJS** architecture with image handling through file system storage and static file serving. Images are stored in the `uploads/` directory structure and paths are stored in MongoDB.

---

## 🏗️ Architecture Layers

### 1. **Presentation Layer**
- **Server-Side Rendering (SSR):** EJS templates for admin panel
- **API Endpoints (SPA):** JSON responses for React/mobile frontends
- **Static File Serving:** Express static middleware for image delivery

### 2. **Controller Layer**
- ProductController - Product CRUD operations
- MemberController - Member/auth operations (SPA)
- SellerController - Admin operations (SSR)

### 3. **Service Layer**
- ProductService - Product business logic
- MemberService - Member business logic
- ViewService - Product view tracking

### 4. **Data Layer**
- MongoDB - Stores product/member data with image paths
- File System - Stores actual image files in `uploads/` directory

---

## 📂 Storage Structure

### File System Organization
```
uploads/
├── members/          # Seller/Member profile images
│   ├── {uuid}.jpg
│   ├── {uuid}.png
│   └── {uuid}.jpeg
└── products/         # Product images (multiple per product)
    ├── {uuid}.jpg
    ├── {uuid}.png
    └── {uuid}.jpeg
```

**Key Points:**
- Images stored in subdirectories by type (`members` or `products`)
- Filenames generated using **UUID v4** + original file extension
- Original filenames discarded for security and uniqueness
- Only file paths stored in database, not actual files

---

## 🔄 Complete Data Flow by Use Case

### **USE CASE A: Product Images Upload (Admin Panel - SSR)**

#### **A.1 Frontend Form (Products Admin Page)**

**Location:** `src/views/products.ejs`

**Form Setup:**
```html
<form
  action="/admin/product/create"
  method="POST"
  enctype="multipart/form-data"
>
  <input type="file" name="productImages" class="image-one" required />
  <input type="file" name="productImages" class="image-two" />
  <input type="file" name="productImages" class="image-three" />
  <input type="file" name="productImages" class="image-four" />
  <input type="file" name="productImages" class="image-five" />
</form>
```

**Frontend Validation:**
- JavaScript validates file types (jpg, jpeg, png)
- Shows preview using FileReader API
- First image is required, others optional
- Maximum 5 images per product

**Flow:**
1. User selects image files (1-5 files)
2. Frontend validates file types
3. Preview shown using blob URLs
4. Form submission sends multipart/form-data to backend

---

#### **A.2 Route Configuration**

**Location:** `src/router-admin.ts`

```typescript
routerAdmin.post("/product/create",
    sellerController.verifyRestaurant,  // Auth middleware
    makeUploader("products").array("productImages", 5),  // Upload middleware
    productController.createNewProduct  // Controller
);
```

**Explanation:**
- `makeUploader("products")` - Configures uploader for `uploads/products/` directory
- `.array("productImages", 5)` - Handles multiple files (up to 5) with field name "productImages"
- Files processed BEFORE controller execution
- Access via `req.files` array (not `req.file`)

**Multer Middleware Processing:**
1. Intercepts multipart form data
2. Saves each file to `./uploads/products/{uuid}.{ext}`
3. Creates `req.files` array with file metadata:
   ```javascript
   req.files = [
     {
       fieldname: 'productImages',
       originalname: 'book1.jpg',
       filename: 'uuid1.jpg',
       path: 'uploads/products/uuid1.jpg',  // Relative path
       size: 245678
     },
     // ... up to 5 files
   ]
   ```

---

#### **A.3 Upload Utility Configuration**

**Location:** `src/libs/utils/uploader.ts`

**Storage Configuration:**
```typescript
function getTargetImageStorage(address: string) {
  return multer.diskStorage({
    destination: function (req, file, cb) {
      const uploadPath = path.join(process.cwd(), 'uploads', address);
      cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
      const extension = path.parse(file.originalname).ext;
      const random_name = v4() + extension;
      cb(null, random_name);
    },
  });
}
```

**How it works:**
1. **Destination:** `process.cwd() + '/uploads/' + address`
   - For products: `/Users/.../bookstore/uploads/products/`
   - For members: `/Users/.../bookstore/uploads/members/`
2. **Filename:** UUID v4 + original extension
   - Example: `74d8d5b0-fa69-4834-b7c0-0309fe29fcb9.jpg`
3. **Path stored in req.file.path:** Full absolute path
   - Example: `/Users/.../bookstore/uploads/products/uuid.jpg`

---

#### **A.4 Controller Processing**

**Location:** `src/controller/product.controller.ts`

**Current Implementation (ISSUE):**
```typescript
productController.createNewProduct = async (req: AdminRequest, res: Response) => {
  try {
    if (!req.files?.length)
      throw new Errors(HttpCode.INTERNAL_SERVER_ERROR, Message.CREATE_FAILED);

    const data: ProductInput = req.body;
    data.productImages = req.files?.map((ele) => {
      return ele.path.replace(/\\/g, "/");  // ⚠️ Stores FULL absolute path
    });

    await productService.createNewProduct(data);
    // ...
  }
}
```

**Problem:**
- Stores full absolute path: `/Users/.../bookstore/uploads/products/file.jpg`
- Should store relative path: `products/file.jpg`

**Required Fix:**
```typescript
data.productImages = req.files?.map((ele) => {
  const uploadsBasePath = path.join(process.cwd(), 'uploads');
  const relativePath = path.relative(uploadsBasePath, ele.path);
  return relativePath.replace(/\\/g, "/");  // ✅ Stores "products/file.jpg"
});
```

**Path Normalization:**
- Replaces backslashes with forward slashes (Windows compatibility)
- Ensures consistent path format in database

---

#### **A.5 Service Layer**

**Location:** `src/models/Product.service.ts`

```typescript
public async createNewProduct(input: ProductInput): Promise<Product> {
  try {
    return await this.productModel.create(input);
  } catch (err) {
    throw new Errors(HttpCode.BAD_REQUEST, Message.CREATE_FAILED);
  }
}
```

**What happens:**
- Receives `ProductInput` with `productImages` array
- Creates new Product document in MongoDB
- Returns created Product with generated `_id`

---

#### **A.6 Database Storage**

**Location:** `src/schema/Product.model.ts`

**Schema Definition:**
```typescript
productImages: {
  type: [String],
  default: [],
}
```

**What gets stored:**
- **NOT the actual image files** (files remain in filesystem)
- **Array of relative file paths** as strings
- Example: `["products/uuid1.jpg", "products/uuid2.jpg"]`

**Database Record Example:**
```javascript
{
  _id: ObjectId("..."),
  productName: "The Great Gatsby",
  productPrice: 19.99,
  productImages: [
    "products/07def7a3-cc5c-46dd-9434-6ac111f24790.jpg",
    "products/16cb894e-7fa7-43cf-b4c3-66b804b28b96.jpeg"
  ],
  productStatus: "PAUSE",
  // ... other fields
}
```

---

### **USE CASE B: Member/Seller Profile Image Upload**

#### **B.1 Admin Signup (SSR Route)**

**Route:** `POST /admin/signup`

**Location:** `src/router-admin.ts`

```typescript
routerAdmin.post("/signup",
    makeUploader("members").single("memberImage"),  // Single file upload
    sellerController.processSignup
);
```

**Controller:**
```typescript
sellerController.processSignup = async (req: AdminRequest, res: Response) => {
  try {
    const file = req.file;
    if (!file) throw new Errors(HttpCode.BAD_REQUEST, Message.SOMETHING_WENT_WRONG);

    const newMember: MemberInput = req.body;
    if (file) {
      const uploadsBasePath = path.join(process.cwd(), 'uploads');
      const relativePath = path.relative(uploadsBasePath, file.path);
      newMember.memberImage = relativePath.replace(/\\/g, "/");  // ✅ Fixed
    }
    newMember.memberType = MemberType.SELLER;
    
    const result = await memberService.processSignup(newMember);
    req.session.member = result;
    res.redirect("/admin/product/all");
  }
}
```

**Status:** ✅ **FIXED** - Stores relative path correctly

---

#### **B.2 Member Update (SPA API Route)**

**Route:** `POST /member/update`

**Location:** `src/router.ts`

```typescript
router.post("/member/update",
    memberController.verifyAuth,  // Authentication required
    uploader("members").single("memberImage"),  // Optional image update
    memberController.updateMember
);
```

**Controller:**
```typescript
memberController.updateMember = async (req: ExtendedRequest, res: Response) => {
  try {
    const input: MemberUpdateInput = req.body;
    if (req.file) {
      const uploadsBasePath = path.join(process.cwd(), 'uploads');
      const relativePath = path.relative(uploadsBasePath, req.file.path);
      input.memberImage = relativePath.replace(/\\/g, "/");  // ✅ Fixed
    }
    
    const result = await memberService.updateMember(req.member, input);
    res.status(HttpCode.OK).json(result);
  }
}
```

**Status:** ✅ **FIXED** - Stores relative path correctly
**Note:** Image update is optional - if `req.file` exists, image is updated; otherwise only other fields

---

#### **B.3 Database Storage**

**Location:** `src/schema/Member.model.ts`

```typescript
memberImage: {
  type: String,  // Single string, not array
}
```

**What gets stored:**
- Relative path: `members/uuid.jpg`
- Example: `"members/a98c89b4-dc17-4e83-9228-2b4a73b03d2e.jpg"`

**Database Record Example:**
```javascript
{
  _id: ObjectId("..."),
  memberNick: "John's Bookstore",
  memberPhone: "+1234567890",
  memberImage: "members/a98c89b4-dc17-4e83-9228-2b4a73b03d2e.jpg",
  memberType: "SELLER",
  // ... other fields
}
```

---

## 🌐 Static File Serving

### **Express Static Middleware Configuration**

**Location:** `src/app.ts`

```typescript
app.use(express.static(path.join(__dirname, 'public')));
app.use("/uploads", express.static(path.join(process.cwd(), 'uploads')));
```

**How it works:**

1. **First line:** Serves static files from `public/` directory
   - URL: `http://localhost:3003/css/home.css` → `public/css/home.css`
   - URL: `http://localhost:3003/img/logo.png` → `public/img/logo.png`

2. **Second line:** Serves uploaded files from `uploads/` directory
   - URL: `http://localhost:3003/uploads/members/uuid.jpg` → `uploads/members/uuid.jpg`
   - URL: `http://localhost:3003/uploads/products/uuid.jpg` → `uploads/products/uuid.jpg`

**Request Flow:**
```
Browser Request: GET /uploads/products/file.jpg
    ↓
Express checks static middleware
    ↓
Looks for file at: process.cwd() + '/uploads/products/file.jpg'
    ↓
If found: Serves file with appropriate MIME type
If not found: Returns 404
```

---

## 📤 Image Retrieval & Display

### **1. Server-Side Rendering (SSR - EJS Views)**

#### **Get All Products (Admin Panel)**

**Route:** `GET /admin/product/all`

**Controller:**
```typescript
productController.getAllProducts = async (req: AdminRequest, res: Response) => {
  try {
    const data = await productService.getAllProduct();
    res.render("products", { products: data });
  }
}
```

**Service:**
```typescript
public async getAllProduct(): Promise<Product[]> {
  const result = await this.productModel.find().exec();
  return result;  // Products with productImages array
}
```

**EJS Template Usage:**
```html
<% products.forEach(function(product) { %>
  <div class="product-item">
    <img src="/uploads/<%= product.productImages[0] %>" alt="<%= product.productName %>" />
    <h3><%= product.productName %></h3>
  </div>
<% }); %>
```

**Rendered HTML:**
```html
<img src="/uploads/products/uuid1.jpg" alt="The Great Gatsby" />
```

**Browser Request:** `http://localhost:3003/uploads/products/uuid1.jpg`
**Express serves:** `uploads/products/uuid1.jpg` from filesystem

---

### **2. API Responses (SPA/Mobile Frontend)**

#### **Get Products List**

**Route:** `GET /product/all`

**Query Parameters:**
- `page`: Page number
- `limit`: Items per page
- `order`: Sort order (productPrice, productViews, etc.)
- `productType`: Filter by type
- `search`: Search term

**Controller:**
```typescript
productController.getProducts = async (req: Request, res: Response) => {
  try {
    const { page, limit, order, productType, search } = req.query;
    const inquiry: ProductInquiry = {
      order: String(order),
      page: Number(page),
      limit: Number(limit),
      productType: productType as ProductType,
      search: search ? String(search) : undefined
    };

    const result = await productService.getProducts(inquiry);
    res.status(HttpCode.OK).json(result);
  }
}
```

**Service (MongoDB Aggregation):**
```typescript
public async getProducts(inquiry: ProductInquiry): Promise<Product[]> {
  const match: T = { productStatus: ProductStatus.PROCESS };
  
  if (inquiry.productType) match.productType = inquiry.productType;
  if (inquiry.search) {
    match.productName = { $regex: new RegExp(inquiry.search, "i") };
  }

  const result = await this.productModel
    .aggregate([
      { $match: match },
      { $sort: sort },
      { $skip: (inquiry.page - 1) * inquiry.limit },
      { $limit: inquiry.limit }
    ])
    .exec();

  return result;
}
```

**JSON Response Example:**
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "productName": "The Great Gatsby",
    "productPrice": 19.99,
    "productImages": [
      "products/07def7a3-cc5c-46dd-9434-6ac111f24790.jpg",
      "products/16cb894e-7fa7-43cf-b4c3-66b804b28b96.jpeg"
    ],
    "productViews": 152,
    "productType": "FICTION"
  }
]
```

**Frontend Usage (React/SPA):**
```javascript
// After fetching products
const imageUrl = `http://localhost:3003/uploads/${product.productImages[0]}`;
// Results in: http://localhost:3003/uploads/products/uuid1.jpg

<img src={imageUrl} alt={product.productName} />
```

---

#### **Get Single Product Detail**

**Route:** `GET /product/:id`

**Controller:**
```typescript
productController.getProduct = async (req: ExtendedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const memberId = req.member?._id ?? null;  // Optional authentication
    const result = await productService.getProduct(memberId, id);
    res.status(HttpCode.OK).json(result);
  }
}
```

**Service with View Tracking:**
```typescript
public async getProduct(memberId: ObjectId | null, id: string): Promise<Product> {
  const productId = shapeIntoMongooseObjectId(id);
  
  let result = await this.productModel.findOne({
    _id: productId,
    productStatus: ProductStatus.PROCESS
  }).exec();

  // Track view if member is authenticated
  if (memberId) {
    const existView = await this.viewService.checkViewExistence({
      memberId: memberId,
      viewRefId: productId,
      viewGroup: ViewGroup.PRODUCT
    });
    
    if (!existView) {
      await this.viewService.insertMemberView(input);
      // Increment view count
      result = await this.productModel.findByIdAndUpdate(
        productId,
        { $inc: { productViews: +1 } },
        { new: true }
      ).exec();
    }
  }

  return result;
}
```

**JSON Response:**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "productName": "The Great Gatsby",
  "productPrice": 19.99,
  "productImages": [
    "products/07def7a3-cc5c-46dd-9434-6ac111f24790.jpg",
    "products/16cb894e-7fa7-43cf-b4c3-66b804b28b96.jpeg",
    "products/17174d1d-3075-4661-ba0f-a311160d6e85.jpg"
  ],
  "productViews": 153,
  "productDesc": "A classic American novel...",
  "productType": "FICTION",
  "productFormat": "PAPERBACK"
}
```

**Frontend Usage (Image Gallery):**
```javascript
// Display all images in carousel/slider
product.productImages.map((imagePath) => {
  const fullImageUrl = `http://localhost:3003/uploads/${imagePath}`;
  return <img src={fullImageUrl} key={imagePath} />;
});
```

---

#### **Get Member Profile**

**Route:** `GET /member/detail`

**Controller:**
```typescript
memberController.getMemberDetail = async (req: ExtendedRequest, res: Response) => {
  try {
    const result = await memberService.getMemberDetail(req.member);
    res.status(HttpCode.OK).json(result);
  }
}
```

**Service:**
```typescript
public async getMemberDetail(member: Member): Promise<Member> {
  const memberId = shapeIntoMongooseObjectId(member._id);
  const result = await this.memberModel.findOne({
    _id: memberId,
    memberStatus: MemberStatus.ACTIVE
  }).exec();
  return result;
}
```

**JSON Response:**
```json
{
  "_id": "507f1f77bcf86cd799439012",
  "memberNick": "John's Bookstore",
  "memberImage": "members/a98c89b4-dc17-4e83-9228-2b4a73b03d2e.jpg",
  "memberPhone": "+1234567890",
  "memberPoints": 150,
  "memberType": "USER"
}
```

**Frontend Usage:**
```javascript
const memberImage = member.memberImage
  ? `http://localhost:3003/uploads/${member.memberImage}`
  : '/img/default-user.svg';  // Fallback image

<img src={memberImage} alt={member.memberNick} />
```

---

## 🔄 Complete Data Flow Diagrams

### **Product Image Upload Flow (Admin Panel):**

```
┌─────────────────────┐
│   Browser           │
│   (Admin Form)      │
│   products.ejs      │
└──────────┬──────────┘
           │ 1. POST /admin/product/create
           │    Content-Type: multipart/form-data
           │    FormData: {
           │      productImages: [File, File, ...],
           │      productName: "...",
           │      productPrice: "..."
           │    }
           ▼
┌──────────────────────────────────────┐
│  Router (router-admin.ts)            │
│  ┌────────────────────────────────┐  │
│  │ 1. verifyRestaurant            │  │
│  │    (Session authentication)    │  │
│  └────────────┬───────────────────┘  │
│               │                       │
│  ┌────────────▼───────────────────┐  │
│  │ 2. Multer Middleware           │  │
│  │    makeUploader("products")    │  │
│  │    .array("productImages", 5)  │  │
│  │                                │  │
│  │    - Saves files to:           │  │
│  │      uploads/products/         │  │
│  │    - Generates UUID filenames  │  │
│  │    - Creates req.files array   │  │
│  └────────────┬───────────────────┘  │
└───────────────┼───────────────────────┘
                │
                ▼
┌──────────────────────────────────────┐
│  Controller                          │
│  (product.controller.ts)             │
│  ┌────────────────────────────────┐  │
│  │ - Extract req.files            │  │
│  │ - Map to paths array           │  │
│  │ - Normalize paths              │  │
│  │ - Assign to data.productImages │  │
│  └────────────┬───────────────────┘  │
└───────────────┼───────────────────────┘
                │
                ▼
┌──────────────────────────────────────┐
│  Service Layer                       │
│  (Product.service.ts)                │
│  - Validate input                    │
│  - Create Product document           │
└──────────────┬───────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│  MongoDB                             │
│  Products Collection                 │
│  {                                   │
│    productName: "...",               │
│    productImages: [                  │
│      "products/uuid1.jpg",           │ ← PATHS STORED
│      "products/uuid2.jpg"            │   (not files)
│    ]                                 │
│  }                                   │
└──────────────────────────────────────┘
```

### **Image Retrieval Flow (API):**

```
┌─────────────────────┐
│   Frontend/SPA      │
│   (React/Mobile)    │
└──────────┬──────────┘
           │ 1. GET /product/all?page=1&limit=10
           │    Headers: { Cookie: "accessToken=..." }
           ▼
┌──────────────────────────────────────┐
│  Router (router.ts)                  │
│  - No auth required for list         │
└──────────┬───────────────────────────┘
           │
           ▼
┌──────────────────────────────────────┐
│  Controller                          │
│  (product.controller.ts)             │
│  - Parse query parameters            │
│  - Build inquiry object              │
│  - Call service                      │
└──────────┬───────────────────────────┘
           │
           ▼
┌──────────────────────────────────────┐
│  Service Layer                       │
│  (Product.service.ts)                │
│  - MongoDB aggregation               │
│  - Filter by status, type, search    │
│  - Sort, paginate                    │
│  - Return Product[] array            │
└──────────┬───────────────────────────┘
           │
           ▼
┌──────────────────────────────────────┐
│  MongoDB Query                       │
│  - Match conditions                  │
│  - Sort results                      │
│  - Skip/limit pagination             │
│  - Return documents                  │
└──────────┬───────────────────────────┘
           │
           ▼
┌──────────────────────────────────────┐
│  JSON Response                       │
│  {                                   │
│    productImages: [                  │
│      "products/uuid1.jpg",           │
│      "products/uuid2.jpg"            │
│    ]                                 │
│  }                                   │
└──────────┬───────────────────────────┘
           │
           ▼
┌──────────────────────────────────────┐
│  Frontend Processing                 │
│  - Construct full URLs:              │
│    `${API_URL}/uploads/${path}`      │
│  - Display images in UI              │
└──────────┬───────────────────────────┘
           │
           ▼
┌──────────────────────────────────────┐
│  Browser Image Request               │
│  GET /uploads/products/uuid1.jpg     │
└──────────┬───────────────────────────┘
           │
           ▼
┌──────────────────────────────────────┐
│  Express Static Middleware           │
│  (app.ts)                            │
│  - Maps /uploads/* to                │
│    uploads/* directory               │
│  - Serves file if exists             │
│  - Returns 404 if not found          │
└──────────┬───────────────────────────┘
           │
           ▼
┌──────────────────────────────────────┐
│  File System                         │
│  uploads/products/uuid1.jpg          │
│  - File served directly              │
│  - Browser caches image              │
└──────────────────────────────────────┘
```

---

## 🔑 Key Technical Details

### **File Path Format**

**Stored in Database:**
- Format: `{folder}/{uuid}.{ext}`
- Examples:
  - `products/07def7a3-cc5c-46dd-9434-6ac111f24790.jpg`
  - `members/a98c89b4-dc17-4e83-9228-2b4a73b03d2e.jpg`
- **No leading slash** - relative path from `uploads/` base

**URL Access:**
- Frontend constructs: `/uploads/{stored_path}`
- Full URL: `http://localhost:3003/uploads/products/uuid.jpg`
- Express maps: `/uploads/*` → `./uploads/*`

---

### **Path Normalization**

**Why needed:**
- Windows: `uploads\products\file.jpg`
- Unix/Mac: `uploads/products/file.jpg`
- Database must store consistent format (forward slashes)

**Implementation:**
```typescript
const normalizedPath = path.relative(uploadsBase, file.path);
const finalPath = normalizedPath.replace(/\\/g, "/");
```

This ensures forward slashes regardless of operating system.

---

### **File Naming Strategy**

**UUID v4 Generation:**
- Library: `uuid` package (`v4()` function)
- Format: `xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx`
- Example: `74d8d5b0-fa69-4834-b7c0-0309fe29fcb9`

**Why UUID:**
1. **Uniqueness:** Virtually no collision risk
2. **Security:** Original filename hidden
3. **Organization:** No filename conflicts

**Filename Generation:**
```typescript
filename: function (req, file, cb) {
  const extension = path.parse(file.originalname).ext;
  const random_name = v4() + extension;
  cb(null, random_name);
}
```

---

### **Multer Configuration**

**Single File Upload:**
- Method: `.single("fieldName")`
- Access: `req.file` (object)
- Use case: Member profile image

**Multiple Files Upload:**
- Method: `.array("fieldName", maxCount)`
- Access: `req.files` (array)
- Use case: Product images (up to 5)

**File Object Structure:**
```javascript
{
  fieldname: 'productImages',           // Form field name
  originalname: 'book-cover.jpg',        // Original filename
  encoding: '7bit',                      // File encoding
  mimetype: 'image/jpeg',                // MIME type
  destination: './uploads/products',     // Save directory
  filename: 'uuid.jpg',                  // Generated filename
  path: '/full/path/to/uploads/products/uuid.jpg',  // Full absolute path
  size: 245678                           // File size in bytes
}
```

---

## 📊 Summary Table

| Aspect | Product Images | Member Images |
|--------|---------------|---------------|
| **Upload Method** | `.array()` | `.single()` |
| **Field Name** | `productImages` | `memberImage` |
| **Max Files** | 5 | 1 |
| **Storage Directory** | `uploads/products/` | `uploads/members/` |
| **Database Field** | `productImages: [String]` | `memberImage: String` |
| **Access via** | `req.files` (array) | `req.file` (object) |
| **Route (Create)** | `/admin/product/create` | `/admin/signup` |
| **Route (Update)** | - | `/member/update` |
| **Required** | Yes (first image) | Yes (signup), Optional (update) |
| **Status** | ⚠️ Needs Fix | ✅ Fixed |

---

## 🎯 Quick Reference

### **Upload Multiple Images:**
```typescript
// Route
router.post("/endpoint",
  verifyAuth,
  uploader("folder").array("fieldName", maxCount),
  controller
);

// Controller
if (req.files?.length) {
  const uploadsBase = path.join(process.cwd(), 'uploads');
  data.images = req.files.map(file => {
    const relativePath = path.relative(uploadsBase, file.path);
    return relativePath.replace(/\\/g, "/");
  });
}
```

### **Upload Single Image:**
```typescript
// Route
router.post("/endpoint",
  verifyAuth,
  uploader("folder").single("fieldName"),
  controller
);

// Controller
if (req.file) {
  const uploadsBase = path.join(process.cwd(), 'uploads');
  const relativePath = path.relative(uploadsBase, req.file.path);
  data.image = relativePath.replace(/\\/g, "/");
}
```

### **Serve Static Files:**
```typescript
app.use("/uploads", express.static(path.join(process.cwd(), 'uploads')));
```

### **Access Image in Frontend:**
```javascript
// API returns: { image: "products/uuid.jpg" }
const imageUrl = `http://localhost:3003/uploads/${data.image}`;

// For arrays: { images: ["products/uuid1.jpg", "products/uuid2.jpg"] }
data.images.map(path => {
  const imageUrl = `http://localhost:3003/uploads/${path}`;
  return <img src={imageUrl} key={path} />;
});
```

---

## ✅ Checklist for Image Upload Implementation

When implementing image upload:

- [ ] Form has `enctype="multipart/form-data"`
- [ ] Route includes Multer middleware
- [ ] Multer configured with correct folder name
- [ ] Single vs Array middleware chosen correctly
- [ ] Field name matches in form and route
- [ ] Controller checks for `req.file` or `req.files`
- [ ] Path normalized using `path.relative()` + `replace(/\\/g, "/")`
- [ ] Relative path stored in database (not absolute)
- [ ] Static middleware serves `/uploads/*` from `uploads/` directory
- [ ] Frontend constructs correct image URL: `/uploads/{stored_path}`

---

## 🔍 Current Issues & Fixes Required

### **Issue 1: Product Image Path Storage**

**Location:** `src/controller/product.controller.ts` (line 89-91)

**Current (Broken):**
```typescript
data.productImages = req.files?.map((ele) => {
  return ele.path.replace(/\\/g, "/");  // Stores full absolute path
});
```

**Should be:**
```typescript
import path from "path";  // Add import

data.productImages = req.files?.map((ele) => {
  const uploadsBasePath = path.join(process.cwd(), 'uploads');
  const relativePath = path.relative(uploadsBasePath, ele.path);
  return relativePath.replace(/\\/g, "/");  // Stores "products/uuid.jpg"
});
```

**Impact:**
- Currently stores: `/Users/.../bookstore/uploads/products/file.jpg`
- Should store: `products/file.jpg`
- Frontend can't access images correctly with absolute paths

---

## 📝 File References

### Core Files
- `src/libs/utils/uploader.ts` - Multer upload configuration
- `src/app.ts` - Static file serving configuration
- `src/router-admin.ts` - Admin routes (SSR)
- `src/router.ts` - API routes (SPA)

### Controllers
- `src/controller/product.controller.ts` - Product CRUD operations
- `src/controller/member.controller.ts` - Member operations (API)
- `src/controller/seller.controller.ts` - Admin operations (SSR)

### Services
- `src/models/Product.service.ts` - Product business logic
- `src/models/Member.service.ts` - Member business logic

### Models
- `src/schema/Product.model.ts` - Product schema definition
- `src/schema/Member.model.ts` - Member schema definition

### Views (SSR)
- `src/views/products.ejs` - Product management page
- `src/views/signup.ejs` - Admin signup page

---

**End of Documentation**
