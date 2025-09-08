# Database Documentation

## Overview

NepQue uses PostgreSQL as the primary database with Prisma ORM for database management. The database is hosted on Neon (a serverless PostgreSQL platform) for development and production.

## Database Connection

- **Host**: `ep-frosty-shape-a1eemqe4-pooler.ap-southeast-1.aws.neon.tech`
- **Database**: `neondb`
- **SSL**: Required
- **Connection String**: Available in `.env` file

## Schema Overview

### Core Tables

#### Users
- **Purpose**: Store user accounts and authentication data
- **Key Fields**: `id`, `email`, `name`, `role`, `createdAt`
- **Relationships**: One-to-many with `Account`, `Session`, `FavoriteCoupon`, `CouponUsage`

#### Brands
- **Purpose**: Store brand/company information
- **Key Fields**: `id`, `name`, `slug`, `logo`, `website`, `isActive`
- **Relationships**: One-to-many with `Coupon`

#### Categories
- **Purpose**: Organize coupons by type/industry
- **Key Fields**: `id`, `name`, `slug`, `icon`, `color`, `isActive`
- **Relationships**: One-to-many with `Coupon`

#### Coupons
- **Purpose**: Store individual coupon codes and deals
- **Key Fields**: `id`, `title`, `code`, `type`, `discountType`, `discountValue`, `isActive`, `isVerified`
- **Relationships**: Many-to-one with `Brand` and `Category`, One-to-many with `FavoriteCoupon` and `CouponUsage`

#### FavoriteCoupons
- **Purpose**: User's saved/favorite coupons
- **Key Fields**: `userId`, `couponId`, `createdAt`
- **Relationships**: Many-to-one with `User` and `Coupon`

#### CouponUsage
- **Purpose**: Track coupon usage to prevent abuse
- **Key Fields**: `userId`, `couponId`, `usedAt`, `ipAddress`
- **Relationships**: Many-to-one with `User` and `Coupon`

### Authentication Tables (NextAuth.js)

#### Accounts
- **Purpose**: OAuth provider account information
- **Key Fields**: `userId`, `provider`, `providerAccountId`, `access_token`
- **Relationships**: Many-to-one with `User`

#### Sessions
- **Purpose**: User session management
- **Key Fields**: `userId`, `sessionToken`, `expires`
- **Relationships**: Many-to-one with `User`

#### VerificationTokens
- **Purpose**: Email verification and password reset tokens
- **Key Fields**: `identifier`, `token`, `expires`

## Data Types

### Enums

#### UserRole
- `USER` - Regular user
- `ADMIN` - Admin user with management privileges
- `SUPER_ADMIN` - Super admin with full system access

#### CouponType
- `COUPON_CODE` - Traditional coupon code
- `DEAL` - Special offer without code
- `CASHBACK` - Cashback offer
- `FREE_SHIPPING` - Free shipping offer

#### DiscountType
- `PERCENTAGE` - Percentage discount
- `FIXED_AMOUNT` - Fixed dollar amount discount
- `FREE_SHIPPING` - Free shipping
- `BUY_ONE_GET_ONE` - BOGO offer

## Sample Data

The database is seeded with sample data including:

- **5 Categories**: Electronics, Fashion, Home & Garden, Beauty, Food & Dining
- **5 Brands**: Amazon, Nike, Apple, Microsoft, Adidas
- **5 Coupons**: Various discount types and brands
- **1 Admin User**: `admin@nepque.com`

## Database Management

### Available Scripts

```bash
# Seed database with sample data
npm run db:seed

# Reset database and reseed
npm run db:reset

# Show database statistics
npm run db:stats

# Clean all data (keep schema)
npm run db:clean
```

### Prisma Commands

```bash
# Generate Prisma client
npx prisma generate

# Push schema changes to database
npx prisma db push

# Create migration
npx prisma migrate dev --name migration_name

# Open Prisma Studio (database GUI)
npx prisma studio
```

## Security Considerations

1. **Environment Variables**: Database credentials are stored in `.env` file
2. **SSL Connection**: All connections use SSL encryption
3. **Role-Based Access**: User roles control data access
4. **Usage Tracking**: Coupon usage is tracked to prevent abuse
5. **Input Validation**: All inputs are validated using Zod schemas

## Performance Optimization

1. **Indexes**: Key fields are indexed for fast queries
2. **Connection Pooling**: Neon provides automatic connection pooling
3. **Query Optimization**: Prisma generates optimized SQL queries
4. **Caching**: Consider implementing Redis for frequently accessed data

## Backup Strategy

1. **Neon Backups**: Automatic daily backups provided by Neon
2. **Point-in-Time Recovery**: Available for data recovery
3. **Manual Exports**: Use `pg_dump` for manual backups

## Monitoring

1. **Database Stats**: Available via `/api/admin/stats` endpoint
2. **Prisma Studio**: Visual database management interface
3. **Neon Dashboard**: Monitor performance and usage

## Troubleshooting

### Common Issues

1. **Connection Timeout**: Check network connectivity and SSL settings
2. **Schema Mismatch**: Run `npx prisma db push` to sync schema
3. **Migration Errors**: Check migration files and rollback if needed
4. **Permission Errors**: Verify database user permissions

### Debug Commands

```bash
# Test database connection
curl http://localhost:3000/api/admin/stats

# Check Prisma client generation
npx prisma generate

# Validate schema
npx prisma validate
```

## Future Enhancements

1. **Read Replicas**: For improved read performance
2. **Database Sharding**: For horizontal scaling
3. **Advanced Analytics**: Data warehouse integration
4. **Real-time Sync**: WebSocket-based real-time updates
