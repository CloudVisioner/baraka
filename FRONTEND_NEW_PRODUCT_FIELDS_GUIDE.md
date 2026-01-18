# 📚 Frontend Guide: New Product Fields (Publisher, Publication Date, Language, Page Count)

## ✅ Complete API Specification for Frontend Team

Complete guide for the 4 new product fields: Publisher, Publication Date, Language, and Page Count.

---

## 📋 New Fields Overview

| Field Name | Type | Required | Description | Example |
|------------|------|----------|-------------|---------|
| `productPublisher` | `string \| null` | ❌ No | Publisher name | "Modern Library" |
| `productPublicationDate` | `string \| null` | ❌ No | Publication date (formatted) | "May 6, 2003" |
| `productLanguage` | `ProductLanguage \| null` | ❌ No | Language enum | "ENGLISH", "UZBEK", "RUSSIAN" |
| `productPageCount` | `number \| null` | ❌ No | Total pages | 272 |

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
    "productPublisher": "Modern Library",
    "productPublicationDate": "May 6, 2003",
    "productLanguage": "ENGLISH",
    "productPageCount": 272,
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
    "productAuthor": "James Clear",
    "productPublisher": null,
    "productPublicationDate": null,
    "productLanguage": null,
    "productPageCount": null,
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
  "productPublisher": "Modern Library",
  "productPublicationDate": "May 6, 2003",
  "productLanguage": "ENGLISH",
  "productPageCount": 272,
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

**Note:** All new fields are optional - they can be `null` or `undefined` if not set.

---

## 📝 TypeScript Interface

### Frontend Type Definition:
```typescript
// Language Enum
enum ProductLanguage {
  ENGLISH = "ENGLISH",
  UZBEK = "UZBEK",
  RUSSIAN = "RUSSIAN"
}

// Product Interface
interface Product {
  _id: string;
  productStatus: string;
  productType: "FICTION" | "NON_FICTION" | "ACADEMIC" | "COMIC" | "OTHER";
  productName: string;
  productAuthor?: string | null;
  productPublisher?: string | null;  // ✅ New field
  productPublicationDate?: string | null;  // ✅ New field
  productLanguage?: ProductLanguage | null;  // ✅ New field
  productPageCount?: number | null;  // ✅ New field
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

**Important:** All new fields are **optional** - always check if they exist before displaying.

---

## 🎨 Frontend Usage Examples

### 1. Display All New Fields in Product Card

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
        
        {/* Author */}
        {product.productAuthor && (
          <Typography variant="body2" color="text.secondary">
            by {product.productAuthor}
          </Typography>
        )}
        
        {/* Publisher */}
        {product.productPublisher && (
          <Typography variant="caption" color="text.secondary">
            Publisher: {product.productPublisher}
          </Typography>
        )}
        
        {/* Publication Date */}
        {product.productPublicationDate && (
          <Typography variant="caption" color="text.secondary">
            Published: {product.productPublicationDate}
          </Typography>
        )}
        
        {/* Language */}
        {product.productLanguage && (
          <Chip 
            label={product.productLanguage} 
            size="small" 
            sx={{ mt: 0.5 }}
          />
        )}
        
        {/* Page Count */}
        {product.productPageCount && (
          <Typography variant="caption" color="text.secondary">
            {product.productPageCount} pages
          </Typography>
        )}
        
        <Typography variant="h6">${product.productPrice}</Typography>
      </CardContent>
    </Card>
  );
};
```

---

### 2. Display in Product Detail Page

```tsx
const ProductDetail: React.FC<{ product: Product }> = ({ product }) => {
  const formatLanguage = (lang: ProductLanguage | null | undefined): string => {
    if (!lang) return "Not specified";
    const languageMap: Record<ProductLanguage, string> = {
      ENGLISH: "English",
      UZBEK: "O'zbek",
      RUSSIAN: "Русский"
    };
    return languageMap[lang] || lang;
  };

  return (
    <Box>
      <Typography variant="h4">{product.productName}</Typography>
      
      {/* Author */}
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
        <PersonIcon fontSize="small" color="action" />
        <Typography variant="body1" color="text.secondary">
          {product.productAuthor || "Unknown Author"}
        </Typography>
      </Stack>
      
      {/* Book Details Grid */}
      <Grid container spacing={2} sx={{ mt: 2 }}>
        {/* Publisher */}
        <Grid item xs={6}>
          <Typography variant="caption" color="text.secondary">
            Publisher
          </Typography>
          <Typography variant="body2">
            {product.productPublisher || "Not specified"}
          </Typography>
        </Grid>
        
        {/* Publication Date */}
        <Grid item xs={6}>
          <Typography variant="caption" color="text.secondary">
            Publication Date
          </Typography>
          <Typography variant="body2">
            {product.productPublicationDate || "Not specified"}
          </Typography>
        </Grid>
        
        {/* Language */}
        <Grid item xs={6}>
          <Typography variant="caption" color="text.secondary">
            Language
          </Typography>
          <Typography variant="body2">
            {formatLanguage(product.productLanguage)}
          </Typography>
        </Grid>
        
        {/* Page Count */}
        <Grid item xs={6}>
          <Typography variant="caption" color="text.secondary">
            Pages
          </Typography>
          <Typography variant="body2">
            {product.productPageCount ? `${product.productPageCount} pages` : "Not specified"}
          </Typography>
        </Grid>
      </Grid>
      
      <Typography variant="h5" sx={{ mt: 3 }}>
        ${product.productPrice}
      </Typography>
    </Box>
  );
};
```

---

### 3. Language Display Helper Function

```tsx
// Helper function to display language in readable format
const getLanguageDisplay = (lang: ProductLanguage | null | undefined): string => {
  if (!lang) return "Not specified";
  
  const languageDisplay: Record<ProductLanguage, string> = {
    ENGLISH: "English",
    UZBEK: "O'zbek",
    RUSSIAN: "Русский"
  };
  
  return languageDisplay[lang] || lang;
};

// Usage
<Typography>{getLanguageDisplay(product.productLanguage)}</Typography>
```

---

### 4. Language Badge Component

```tsx
const LanguageBadge: React.FC<{ language?: ProductLanguage | null }> = ({ language }) => {
  if (!language) return null;
  
  const languageColors: Record<ProductLanguage, string> = {
    ENGLISH: "#007AFF",
    UZBEK: "#34C759",
    RUSSIAN: "#FF3B30"
  };
  
  const languageLabels: Record<ProductLanguage, string> = {
    ENGLISH: "EN",
    UZBEK: "UZ",
    RUSSIAN: "RU"
  };
  
  return (
    <Chip
      label={languageLabels[language]}
      size="small"
      sx={{
        bgcolor: languageColors[language],
        color: "white",
        fontSize: "10px",
        height: 20
      }}
    />
  );
};

// Usage
<LanguageBadge language={product.productLanguage} />
```

---

## ⚠️ Important Notes

### 1. **All Fields are Optional**
- All 4 new fields can be `null`, `undefined`, or have a value
- Always check if they exist before displaying
- Provide fallback text (e.g., "Not specified") for better UX

### 2. **Language Enum Values**
- Only 3 language options available:
  - `"ENGLISH"` → Display as "English" or "EN"
  - `"UZBEK"` → Display as "O'zbek" or "UZ"
  - `"RUSSIAN"` → Display as "Русский" or "RU"

### 3. **Publication Date Format**
- Stored as string (not Date object)
- Format: "May 6, 2003" (example)
- Can be any date format string
- Display as-is from backend

### 4. **Page Count**
- Type: `number` (not string)
- Can be `null` or `undefined`
- Display with "pages" suffix (e.g., "272 pages")

### 5. **Publisher**
- Type: `string`
- Can be `null` or `undefined`
- Display as-is from backend

### 6. **Field is Read-Only (from Frontend)**
- Frontend **cannot** create/update products (admin only)
- Frontend only **reads** these fields from API responses
- No POST/PUT endpoints for frontend to modify these fields

---

## 📊 API Response Examples

### Example 1: Product with All New Fields
```json
{
  "_id": "66c4b3a5f1e2d3c4b5a6e7f8",
  "productName": "The Great Gatsby",
  "productAuthor": "F. Scott Fitzgerald",
  "productPublisher": "Modern Library",
  "productPublicationDate": "May 6, 2003",
  "productLanguage": "ENGLISH",
  "productPageCount": 272,
  "productType": "FICTION",
  "productPrice": 19.99,
  "productImages": ["products/abc123.jpg"],
  "productViews": 142
}
```

### Example 2: Product with Some Fields
```json
{
  "_id": "66c4b3a5f1e2d3c4b5a6e7f9",
  "productName": "Atomic Habits",
  "productAuthor": "James Clear",
  "productPublisher": "Penguin Books",
  "productPublicationDate": null,
  "productLanguage": "ENGLISH",
  "productPageCount": null,
  "productType": "NON_FICTION",
  "productPrice": 24.99,
  "productImages": ["products/xyz789.jpg"],
  "productViews": 89
}
```

### Example 3: Product without New Fields
```json
{
  "_id": "66c4b3a5f1e2d3c4b5a6e7fa",
  "productName": "Some Book",
  "productAuthor": null,
  "productPublisher": null,
  "productPublicationDate": null,
  "productLanguage": null,
  "productPageCount": null,
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
const publisher = product.productPublisher || "Not specified";
const pubDate = product.productPublicationDate || "Not available";
const pages = product.productPageCount ? `${product.productPageCount} pages` : "Not specified";
```

### Pattern 2: Conditional Rendering
```tsx
{product.productPublisher && (
  <Typography>Publisher: {product.productPublisher}</Typography>
)}

{product.productPublicationDate && (
  <Typography>Published: {product.productPublicationDate}</Typography>
)}

{product.productLanguage && (
  <Chip label={product.productLanguage} />
)}

{product.productPageCount && (
  <Typography>{product.productPageCount} pages</Typography>
)}
```

### Pattern 3: Nullish Coalescing
```typescript
const publisher = product.productPublisher ?? "Not specified";
const pubDate = product.productPublicationDate ?? "Not available";
const language = product.productLanguage ?? null;
const pages = product.productPageCount ?? null;
```

### Pattern 4: Type Guard Helper
```typescript
const hasBookDetails = (product: Product): boolean => {
  return !!(
    product.productPublisher ||
    product.productPublicationDate ||
    product.productLanguage ||
    product.productPageCount
  );
};

// Usage
{hasBookDetails(product) && (
  <Box>
    {/* Display book details */}
  </Box>
)}
```

---

## 🔍 Field Summary

| Property | Value |
|----------|-------|
| **productPublisher** | `string \| null \| undefined` |
| **productPublicationDate** | `string \| null \| undefined` |
| **productLanguage** | `"ENGLISH" \| "UZBEK" \| "RUSSIAN" \| null \| undefined` |
| **productPageCount** | `number \| null \| undefined` |
| **Required** | ❌ No (All optional) |
| **Default** | `null` or `undefined` |
| **Editable via Frontend** | ❌ No (Admin only) |
| **Available in GET /product/all** | ✅ Yes |
| **Available in GET /product/:id** | ✅ Yes |

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

### Frontend TypeScript Types:
```typescript
// Language Enum
enum ProductLanguage {
  ENGLISH = "ENGLISH",
  UZBEK = "UZBEK",
  RUSSIAN = "RUSSIAN"
}

// Product Interface (excerpt)
interface Product {
  productPublisher?: string | null;
  productPublicationDate?: string | null;
  productLanguage?: ProductLanguage | null;
  productPageCount?: number | null;
  // ... other fields
}
```

### Safe Display Examples:
```tsx
{product.productPublisher && (
  <Typography>Publisher: {product.productPublisher}</Typography>
)}

{product.productPublicationDate && (
  <Typography>Published: {product.productPublicationDate}</Typography>
)}

{product.productLanguage && (
  <Chip label={getLanguageDisplay(product.productLanguage)} />
)}

{product.productPageCount && (
  <Typography>{product.productPageCount} pages</Typography>
)}
```

---

## 🎯 Frontend Checklist

- [ ] Add `productPublisher?: string | null` to Product interface
- [ ] Add `productPublicationDate?: string | null` to Product interface
- [ ] Add `productLanguage?: ProductLanguage | null` to Product interface
- [ ] Add `productPageCount?: number | null` to Product interface
- [ ] Create `ProductLanguage` enum (ENGLISH, UZBEK, RUSSIAN)
- [ ] Display publisher in product cards (if available)
- [ ] Display publication date in product cards (if available)
- [ ] Display language badge/chip in product cards (if available)
- [ ] Display page count in product cards (if available)
- [ ] Show all fields in product detail page
- [ ] Handle null/undefined cases with fallback text
- [ ] Create language display helper function
- [ ] Test with products that have all fields
- [ ] Test with products that have some fields
- [ ] Test with products that have no new fields
- [ ] Verify API responses include all new fields

---

## 🎨 UI Suggestions

### Product Card Layout:
```
┌─────────────────────────────┐
│ [Product Image]             │
│                             │
│ Product Name                │
│ by Author Name              │
│                             │
│ Publisher: Modern Library   │
│ Published: May 6, 2003      │
│ [EN] 272 pages              │
│                             │
│ $19.99                      │
└─────────────────────────────┘
```

### Product Detail Layout:
```
Product Name
by Author Name

Details:
Publisher:    Modern Library
Published:    May 6, 2003
Language:     English
Pages:        272 pages

$19.99
```

---

**✅ Everything is ready! All 4 new fields are available in all product API responses.**
