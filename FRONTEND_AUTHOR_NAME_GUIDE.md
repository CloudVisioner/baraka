# 📘 Frontend Guide: Product Author Name Field

## ✅ Field Information for Frontend Team

Complete API specification for the `productAuthor` field.

---

## 📋 Field Details

### Field Name:
**`productAuthor`**

### Field Type:
**`string | null | undefined`** (Optional)

### Description:
The author name of the book/product.

---

## 🌐 API Endpoints

### 1. ✅ Get All Products
**Endpoint:** `GET /product/all`

**Query Parameters:**
```
?order=productViews|createdAt|productPrice
&page=number
&limit=number
&productType=FICTION|NON_FICTION|ACADEMIC|COMIC|OTHER (optional)
&search=string (optional)
```

**Response Format:**
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "productName": "The Great Gatsby",
    "productAuthor": "F. Scott Fitzgerald",
    "productType": "FICTION",
    "productPrice": 19.99,
    "productImages": ["products/uuid.jpg"],
    "productViews": 142,
    "productDesc": "...",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  {
    "_id": "507f1f77bcf86cd799439012",
    "productName": "Atomic Habits",
    "productAuthor": null,  // ← Can be null if not set
    "productType": "NON_FICTION",
    "productPrice": 24.99,
    "productImages": ["products/uuid2.jpg"],
    "productViews": 89,
    "createdAt": "2024-01-02T00:00:00.000Z",
    "updatedAt": "2024-01-02T00:00:00.000Z"
  }
]
```

**Status Code:** `200 OK`

---

### 2. ✅ Get Single Product
**Endpoint:** `GET /product/:productId`

**Response Format:**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "productName": "The Great Gatsby",
  "productAuthor": "F. Scott Fitzgerald",
  "productType": "FICTION",
  "productPrice": 19.99,
  "productImages": ["products/uuid.jpg"],
  "productViews": 142,
  "productDesc": "...",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**Status Code:** `200 OK`

**Note:** If author is not set, `productAuthor` will be `null` or `undefined`.

---

## 📝 TypeScript Interface

### Frontend Type Definition:
```typescript
interface Product {
  _id: string;
  productStatus: string;
  productType: "FICTION" | "NON_FICTION" | "ACADEMIC" | "COMIC" | "OTHER";
  productName: string;
  productAuthor?: string | null;  // ✅ Optional field
  productPrice: number;
  productLeftCount: number;
  productFormat: "PAPERBACK" | "HARDCOPY";
  productDesc?: string;
  productImages: string[];
  productViews: number;
  createdAt: string;
  updatedAt: string;
}
```

**Important:** `productAuthor` is **optional** - always check if it exists before displaying.

---

## 🎨 Frontend Usage Examples

### 1. Display Author in Product Card

#### React/TypeScript Example:
```tsx
interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6">{product.productName}</Typography>
        
        {/* ✅ Safe display with fallback */}
        {product.productAuthor && (
          <Typography variant="body2" color="text.secondary">
            by {product.productAuthor}
          </Typography>
        )}
        
        <Typography variant="h6">${product.productPrice}</Typography>
      </CardContent>
    </Card>
  );
};
```

#### With Fallback:
```tsx
<Typography variant="body2" color="text.secondary">
  {product.productAuthor ? `by ${product.productAuthor}` : "Unknown Author"}
</Typography>
```

---

### 2. Display Author in Product Detail Page

```tsx
const ProductDetail: React.FC<{ product: Product }> = ({ product }) => {
  return (
    <Box>
      <Typography variant="h4">{product.productName}</Typography>
      
      {/* Author with icon */}
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
        <PersonIcon fontSize="small" color="action" />
        <Typography variant="body1" color="text.secondary">
          {product.productAuthor || "Unknown Author"}
        </Typography>
      </Stack>
      
      <Typography variant="h5" sx={{ mt: 2 }}>
        ${product.productPrice}
      </Typography>
    </Box>
  );
};
```

---

### 3. Filter/Search by Author (if needed)

```tsx
// Example: Filter products by author
const filterByAuthor = (products: Product[], authorName: string) => {
  return products.filter(product => 
    product.productAuthor?.toLowerCase().includes(authorName.toLowerCase())
  );
};

// Example: Search in products
const searchProducts = (products: Product[], searchTerm: string) => {
  const term = searchTerm.toLowerCase();
  return products.filter(product =>
    product.productName.toLowerCase().includes(term) ||
    product.productAuthor?.toLowerCase().includes(term) || // ✅ Search author too
    product.productDesc?.toLowerCase().includes(term)
  );
};
```

---

## ⚠️ Important Notes

### 1. **Field is Optional**
- `productAuthor` can be `null`, `undefined`, or a string
- Always check if it exists before displaying
- Provide a fallback (e.g., "Unknown Author") for better UX

### 2. **Field is Read-Only (from Frontend)**
- Frontend **cannot** create/update products (admin only)
- Frontend only **reads** `productAuthor` from API responses
- No POST/PUT endpoints for frontend to modify this field

### 3. **Backend Handles Author**
- Products are created/updated via admin panel only
- Author name is set during product creation in admin panel

---

## 📊 API Response Examples

### Example 1: Product with Author
```json
{
  "_id": "66c4b3a5f1e2d3c4b5a6e7f8",
  "productName": "The Great Gatsby",
  "productAuthor": "F. Scott Fitzgerald",
  "productType": "FICTION",
  "productPrice": 19.99,
  "productImages": ["products/abc123.jpg"],
  "productViews": 142
}
```

### Example 2: Product without Author
```json
{
  "_id": "66c4b3a5f1e2d3c4b5a6e7f9",
  "productName": "Atomic Habits",
  "productAuthor": null,
  "productType": "NON_FICTION",
  "productPrice": 24.99,
  "productImages": ["products/xyz789.jpg"],
  "productViews": 89
}
```

### Example 3: Product with undefined Author
```json
{
  "_id": "66c4b3a5f1e2d3c4b5a6e7fa",
  "productName": "Some Book",
  "productAuthor": undefined,
  "productType": "ACADEMIC",
  "productPrice": 29.99,
  "productImages": ["products/def456.jpg"],
  "productViews": 56
}
```

---

## ✅ Safe Access Patterns

### Pattern 1: Optional Chaining with Fallback
```typescript
const authorName = product.productAuthor || "Unknown Author";
```

### Pattern 2: Conditional Rendering
```tsx
{product.productAuthor && (
  <Typography>by {product.productAuthor}</Typography>
)}
```

### Pattern 3: Nullish Coalescing
```typescript
const authorName = product.productAuthor ?? "No Author";
```

### Pattern 4: Type Guard
```typescript
const hasAuthor = (product: Product): product is Product & { productAuthor: string } => {
  return product.productAuthor !== null && product.productAuthor !== undefined;
};

if (hasAuthor(product)) {
  console.log(product.productAuthor); // TypeScript knows it's string
}
```

---

## 🔍 Field Summary

| Property | Value |
|----------|-------|
| **Field Name** | `productAuthor` |
| **Type** | `string \| null \| undefined` |
| **Required** | ❌ No (Optional) |
| **Default** | `null` or `undefined` |
| **Editable via Frontend** | ❌ No (Admin only) |
| **Available in GET /product/all** | ✅ Yes |
| **Available in GET /product/:id** | ✅ Yes |
| **Can be filtered** | ⚠️ Not directly (use search) |
| **Can be searched** | ✅ Yes (via `search` query param) |

---

## 📝 Quick Reference

### API Base URL:
```
http://localhost:3003
```

### Get All Products:
```
GET http://localhost:3003/product/all?order=productViews&page=1&limit=10
```

### Get Single Product:
```
GET http://localhost:3003/product/:productId
```

### Frontend TypeScript Type:
```typescript
productAuthor?: string | null;
```

### Safe Display:
```tsx
{product.productAuthor ? `by ${product.productAuthor}` : "Unknown Author"}
```

---

## 🎯 Frontend Checklist

- [ ] Add `productAuthor?: string | null` to Product interface
- [ ] Display author name in product cards
- [ ] Display author name in product detail page
- [ ] Handle null/undefined cases with fallback
- [ ] Include author in search functionality (optional)
- [ ] Test with products that have no author
- [ ] Test with products that have author
- [ ] Verify API responses include `productAuthor` field

---

**✅ Everything is ready! The `productAuthor` field is available in all product API responses.**
