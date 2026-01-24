# Events API Documentation

## Base URL
```
http://localhost:3003
```

---

## Available Endpoints

### 1. Get All Events
**GET** `/event/all`

Returns an array of all events sorted by creation date (newest first).

**Response:** `200 OK`
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Book Reading: The Great Gatsby",
    "desc": "Join us for an evening reading of F. Scott Fitzgerald's classic novel.",
    "fullDesc": "Join us for an evening reading of F. Scott Fitzgerald's classic novel. We'll explore the themes of the American Dream, decadence, and the Jazz Age. Light refreshments will be served.",
    "date": "March 15, 2024, 6:00 PM",
    "location": "Baraka Books, Main Branch",
    "img": "events/uuid-image.jpg",
    "host": "Baraka Books Team",
    "createdAt": "2024-03-01T10:00:00.000Z",
    "updatedAt": "2024-03-01T10:00:00.000Z"
  },
  {
    "_id": "507f1f77bcf86cd799439012",
    "title": "Author Meet & Greet",
    "desc": "Meet local authors and get your books signed.",
    "fullDesc": "Join us for a special meet and greet with local authors. Bring your favorite books to get signed, and enjoy light refreshments while chatting with the authors about their work and writing process.",
    "date": "March 20, 2024, 4:00 PM",
    "location": "Baraka Books, Main Branch",
    "img": "events/uuid-image2.jpg",
    "host": "Local Writers Guild",
    "createdAt": "2024-03-02T10:00:00.000Z",
    "updatedAt": "2024-03-02T10:00:00.000Z"
  }
]
```

**Empty State:**
```json
[]
```

**Cache Control:** Caching is disabled (`Cache-Control: no-store`)

---

### 2. Get Single Event
**GET** `/event/:id`

Returns a single event by ID.

**Parameters:**
- `id` (URL parameter) - Event MongoDB ObjectId

**Response:** `200 OK`
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "title": "Book Reading: The Great Gatsby",
  "desc": "Join us for an evening reading of F. Scott Fitzgerald's classic novel.",
  "fullDesc": "Join us for an evening reading of F. Scott Fitzgerald's classic novel. We'll explore the themes of the American Dream, decadence, and the Jazz Age. Light refreshments will be served.",
  "date": "March 15, 2024, 6:00 PM",
  "location": "Baraka Books, Main Branch",
  "img": "events/uuid-image.jpg",
  "host": "Baraka Books Team",
  "createdAt": "2024-03-01T10:00:00.000Z",
  "updatedAt": "2024-03-01T10:00:00.000Z"
}
```

**Error Response:** `404 Not Found`
```json
{
  "code": 404,
  "message": "NO_DATA_FOUND"
}
```

---

## Event Object Structure

### Required Fields

| Field | Type | Max Length | Description |
|-------|------|------------|-------------|
| `_id` | ObjectId (string) | - | Unique event identifier |
| `title` | string | 80 chars | Event title (main heading) |
| `desc` | string | 150 chars | Short description for card preview |
| `fullDesc` | string | 1000 chars | Full description shown in modal when "Learn More" is clicked |
| `date` | string | 50 chars | Human-readable date/time (e.g., "March 15, 2024, 6:00 PM") |
| `location` | string | 100 chars | Event location (e.g., "Baraka Books, Main Branch") |
| `img` | string | - | Relative image path (see Image URL Construction below) |
| `createdAt` | Date (ISO string) | - | Creation timestamp |
| `updatedAt` | Date (ISO string) | - | Last update timestamp |

### Optional Fields

| Field | Type | Max Length | Description |
|-------|------|------------|-------------|
| `host` | string | 100 chars | Event host/organizer (e.g., "Baraka Books Team", "Local Writers Guild"). If omitted, host section should be hidden in UI |

---

## Image URL Construction

The `img` field contains a **relative path** from the `uploads/` directory.

**To construct the full image URL:**
```
Full URL = Base URL + "/uploads/" + img
```

**Example:**
```javascript
const event = {
  img: "events/uuid-image.jpg"
};

// Construct full URL
const imageUrl = `http://localhost:3003/uploads/${event.img}`;
// Result: "http://localhost:3003/uploads/events/uuid-image.jpg"
```

**Image Specifications:**
- **Aspect Ratio:** 16:9 or 4:3
- **Minimum Size:** 360px × 200px
- **Recommended Size:** 720px × 405px
- **Formats:** JPG, PNG, or WebP
- **Optimization:** <200KB recommended

---

## Frontend Usage Examples

### React/JavaScript Example

```javascript
// Fetch all events
const fetchEvents = async () => {
  try {
    const response = await fetch('http://localhost:3003/event/all');
    const events = await response.json();
    
    // Construct full image URLs
    const eventsWithFullImages = events.map(event => ({
      ...event,
      imageUrl: `http://localhost:3003/uploads/${event.img}`
    }));
    
    return eventsWithFullImages;
  } catch (error) {
    console.error('Error fetching events:', error);
    return [];
  }
};

// Fetch single event
const fetchEvent = async (eventId) => {
  try {
    const response = await fetch(`http://localhost:3003/event/${eventId}`);
    const event = await response.json();
    
    // Construct full image URL
    event.imageUrl = `http://localhost:3003/uploads/${event.img}`;
    
    return event;
  } catch (error) {
    console.error('Error fetching event:', error);
    return null;
  }
};
```

### Axios Example

```javascript
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3003';

// Get all events
const getAllEvents = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/event/all`);
    return response.data.map(event => ({
      ...event,
      imageUrl: `${API_BASE_URL}/uploads/${event.img}`
    }));
  });
} catch (error) {
  console.error('Error fetching events:', error);
  return [];
}

// Get single event
const getEvent = async (eventId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/event/${eventId}`);
    const event = response.data;
    event.imageUrl = `${API_BASE_URL}/uploads/${event.img}`;
    return event;
  } catch (error) {
    console.error('Error fetching event:', error);
    return null;
  }
};
```

---

## Field Usage Guidelines

### `desc` vs `fullDesc`

- **`desc`**: Use this for card previews, list views, and short descriptions
  - Maximum 150 characters
  - Shown on event cards
  
- **`fullDesc`**: Use this for detailed modal/overlay views when user clicks "Learn More"
  - Maximum 1000 characters
  - Contains complete event information
  - Fallback: If `fullDesc` is not available, use `desc`

### `host` Field

- **If `host` exists**: Display the host information in the UI
- **If `host` is null/undefined**: Hide the host section completely

---

## Error Handling

### Standard Error Response Format
```json
{
  "code": 404,
  "message": "NO_DATA_FOUND"
}
```

### Common HTTP Status Codes
- `200 OK` - Success
- `404 Not Found` - Event not found
- `500 Internal Server Error` - Server error

---

## CORS Configuration

The API is configured to allow requests from:
- `http://localhost:3000`
- `http://localhost:3001`
- Other frontend origins as configured

---

## Notes

1. **No Authentication Required**: The public event endpoints (`/event/all` and `/event/:id`) do not require authentication.

2. **Caching Disabled**: The `/event/all` endpoint has caching disabled to ensure fresh data.

3. **Image Paths**: Always construct full image URLs using the pattern: `{BASE_URL}/uploads/{img}`

4. **Date Format**: The `date` field is stored as a human-readable string. No parsing needed.

5. **Empty Arrays**: If no events exist, `/event/all` returns an empty array `[]`, not an error.

---

## Complete Example Response

```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Book Reading: The Great Gatsby",
    "desc": "Join us for an evening reading of F. Scott Fitzgerald's classic novel.",
    "fullDesc": "Join us for an evening reading of F. Scott Fitzgerald's classic novel. We'll explore the themes of the American Dream, decadence, and the Jazz Age. Light refreshments will be served. This event is perfect for book lovers and literature enthusiasts.",
    "date": "March 15, 2024, 6:00 PM",
    "location": "Baraka Books, Main Branch",
    "img": "events/336625e5-d0ab-4444-b484-bd5b85535d7e.jpg",
    "host": "Baraka Books Team",
    "createdAt": "2024-03-01T10:00:00.000Z",
    "updatedAt": "2024-03-01T10:00:00.000Z"
  }
]
```

**Image URL for above example:**
```
http://localhost:3003/uploads/events/336625e5-d0ab-4444-b484-bd5b85535d7e.jpg
```
