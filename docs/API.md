# API Documentation

## Overview

NepQue provides a comprehensive REST API for managing coupons, brands, categories, and user interactions. All API endpoints return JSON responses and follow RESTful conventions.

## Base URL

```
http://localhost:3000/api
```

## Authentication

Currently, the API does not require authentication for read operations. Write operations will be protected in future updates.

## Response Format

All API responses follow this format:

```json
{
  "success": true|false,
  "message": "Optional message",
  "data": {}, // Response data
  "pagination": {}, // Pagination info (when applicable)
  "error": "Error message (on failure)"
}
```

## Endpoints

### Coupons

#### GET /api/coupons
Get a paginated list of coupons with filtering and search.

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 12)
- `q` (string): Search query
- `categoryId` (string): Filter by category
- `brandId` (string): Filter by brand
- `type` (string): Filter by coupon type (COUPON_CODE, DEAL, CASHBACK, FREE_SHIPPING)
- `discountType` (string): Filter by discount type (PERCENTAGE, FIXED_AMOUNT, FREE_SHIPPING, BUY_ONE_GET_ONE)
- `minDiscount` (number): Minimum discount value
- `maxDiscount` (number): Maximum discount value
- `verified` (boolean): Filter by verification status
- `exclusive` (boolean): Filter by exclusivity
- `sortBy` (string): Sort by (newest, popular, discount, expiry)
- `sortOrder` (string): Sort order (asc, desc)

**Example:**
```bash
GET /api/coupons?page=1&limit=12&q=electronics&categoryId=cat123&sortBy=popular
```

#### GET /api/coupons/[id]
Get a specific coupon by ID.

**Example:**
```bash
GET /api/coupons/coupon-123
```

#### POST /api/coupons/create
Create a new coupon.

**Request Body:**
```json
{
  "title": "20% Off Electronics",
  "description": "Get 20% off on all electronics",
  "code": "SAVE20",
  "type": "COUPON_CODE",
  "discountType": "PERCENTAGE",
  "discountValue": 20,
  "minOrderValue": 100,
  "maxDiscount": 50,
  "isExclusive": true,
  "usageLimit": 1000,
  "startDate": "2024-01-01T00:00:00Z",
  "endDate": "2024-12-31T23:59:59Z",
  "terms": "Valid on electronics only",
  "affiliateUrl": "https://example.com",
  "brandId": "brand-123",
  "categoryId": "cat-123"
}
```

#### PUT /api/coupons/[id]
Update an existing coupon.

#### DELETE /api/coupons/[id]
Soft delete a coupon (sets isActive to false).

#### GET /api/coupons/popular
Get popular/trending coupons.

**Query Parameters:**
- `limit` (number): Number of results (default: 10)
- `timeframe` (string): Time period (1d, 7d, 30d, all)

### Brands

#### GET /api/brands
Get a paginated list of brands.

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20)
- `search` (string): Search query
- `active` (boolean): Filter by active status (default: true)

#### POST /api/brands
Create a new brand.

**Request Body:**
```json
{
  "name": "Amazon",
  "description": "Everything you need, delivered fast",
  "logo": "https://logo.clearbit.com/amazon.com",
  "website": "https://amazon.com",
  "isActive": true
}
```

### Categories

#### GET /api/categories
Get a paginated list of categories.

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20)
- `search` (string): Search query
- `active` (boolean): Filter by active status (default: true)

#### POST /api/categories
Create a new category.

**Request Body:**
```json
{
  "name": "Electronics",
  "description": "Electronics and gadgets",
  "icon": "📱",
  "color": "#3B82F6",
  "isActive": true
}
```

### Search

#### GET /api/search
Universal search across coupons, brands, and categories.

**Query Parameters:**
- `q` (string): Search query (required)
- `type` (string): Search type (all, coupons, brands, categories)
- `limit` (number): Number of results per type (default: 10)

### User Favorites

#### GET /api/user/favorites
Get user's favorite coupons.

**Query Parameters:**
- `userId` (string): User ID (required)
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 12)

#### POST /api/user/favorites
Add a coupon to user's favorites.

**Request Body:**
```json
{
  "userId": "user-123",
  "couponId": "coupon-123"
}
```

#### DELETE /api/user/favorites
Remove a coupon from user's favorites.

**Query Parameters:**
- `userId` (string): User ID (required)
- `couponId` (string): Coupon ID (required)

### Coupon Usage

#### POST /api/coupons/[id]/use
Record coupon usage.

**Request Body:**
```json
{
  "userId": "user-123",
  "ipAddress": "192.168.1.1",
  "userAgent": "Mozilla/5.0..."
}
```

### Admin Statistics

#### GET /api/admin/stats
Get database statistics for admin dashboard.

## Data Models

### Coupon
```typescript
{
  id: string
  title: string
  description?: string
  code?: string
  type: 'COUPON_CODE' | 'DEAL' | 'CASHBACK' | 'FREE_SHIPPING'
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'FREE_SHIPPING' | 'BUY_ONE_GET_ONE'
  discountValue: number
  minOrderValue?: number
  maxDiscount?: number
  isActive: boolean
  isVerified: boolean
  isExclusive: boolean
  usageLimit?: number
  usedCount: number
  startDate?: Date
  endDate?: Date
  terms?: string
  image?: string
  affiliateUrl?: string
  brandId: string
  categoryId: string
  createdAt: Date
  updatedAt: Date
  brand: Brand
  category: Category
  usageCount: number
  favoriteCount: number
}
```

### Brand
```typescript
{
  id: string
  name: string
  slug: string
  description?: string
  logo?: string
  website?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  couponCount: number
}
```

### Category
```typescript
{
  id: string
  name: string
  slug: string
  description?: string
  icon?: string
  color?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  couponCount: number
}
```

## Error Handling

The API uses standard HTTP status codes:

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `404` - Not Found
- `500` - Internal Server Error

Error responses include:
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

## Rate Limiting

Currently, there are no rate limits implemented. This will be added in future updates.

## Caching

API responses are not currently cached. Caching strategies will be implemented for better performance.

## Testing

You can test the API using curl, Postman, or any HTTP client:

```bash
# Get all coupons
curl http://localhost:3000/api/coupons

# Search for electronics
curl "http://localhost:3000/api/search?q=electronics"

# Get popular coupons
curl http://localhost:3000/api/coupons/popular

# Get database stats
curl http://localhost:3000/api/admin/stats
```

## Future Enhancements

1. **Authentication**: JWT-based authentication
2. **Rate Limiting**: Prevent API abuse
3. **Caching**: Redis-based caching
4. **Webhooks**: Real-time updates
5. **Analytics**: Usage tracking and metrics
6. **Bulk Operations**: Batch create/update/delete
7. **Export**: CSV/JSON export functionality
