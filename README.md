# NepQue - Coupon Listing Website

A modern, full-stack coupon aggregation platform built with Next.js 14, TypeScript, and Prisma. Inspired by popular coupon websites like [FatCoupon](https://fatcoupon.com/), [Coupert](https://www.coupert.com/), and [CouponBirds](https://www.couponbirds.com/).

## 🚀 Features

### For Users
- **Browse & Search**: Find coupons by brand, category, or keywords
- **Advanced Filtering**: Filter by discount type, amount, verification status
- **Favorites System**: Save your favorite coupons for later
- **User Accounts**: Track usage history and preferences
- **Responsive Design**: Works perfectly on desktop and mobile

### For Admins
- **Content Management**: Add, edit, and manage coupons, brands, and categories
- **Analytics Dashboard**: Track usage statistics and performance
- **Bulk Upload**: Import coupons via CSV
- **User Management**: Manage user accounts and permissions

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Shadcn/ui** for UI components
- **Zustand** for state management
- **React Hook Form** with Zod validation
- **Lucide React** for icons

### Backend
- **Next.js API Routes** (full-stack approach)
- **Prisma ORM** with PostgreSQL
- **NextAuth.js** for authentication
- **JWT** for session management

### Database
- **PostgreSQL** for data storage
- **Prisma** for database management and migrations

## 📁 Project Structure

```
nepque/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── (auth)/         # Authentication pages
│   │   ├── admin/          # Admin dashboard
│   │   ├── api/            # API routes
│   │   └── (main)/         # Main user pages
│   ├── components/         # Reusable components
│   │   ├── ui/             # Shadcn/ui components
│   │   ├── forms/          # Form components
│   │   ├── layout/         # Layout components
│   │   ├── coupon/         # Coupon-related components
│   │   └── admin/          # Admin components
│   ├── lib/                # Utilities and configs
│   │   ├── auth.ts         # Auth configuration
│   │   ├── db.ts           # Database connection
│   │   └── utils.ts        # Helper functions
│   ├── hooks/              # Custom React hooks
│   ├── store/              # Zustand stores
│   └── types/              # TypeScript types
├── prisma/                 # Database schema
├── public/                 # Static assets
└── docs/                   # Documentation
```

## 🗄️ Database Schema

### Core Models
- **User**: User accounts with role-based access
- **Brand**: Companies offering coupons
- **Category**: Organizing coupons by type
- **Coupon**: Individual coupon codes and deals
- **FavoriteCoupon**: User's saved coupons
- **CouponUsage**: Track usage to prevent abuse

### Key Features
- Role-based access control (USER, ADMIN, SUPER_ADMIN)
- Comprehensive coupon metadata (discounts, terms, expiry)
- Usage tracking and analytics
- Favorites system for users

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd nepque
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your database URL and other configurations:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/nepque_db?schema=public"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key-here"
   ```

4. **Set up the database**
   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🎨 Design Inspiration

This project draws inspiration from leading coupon websites:

- **[FatCoupon](https://fatcoupon.com/)**: Clean hero section, trust indicators, and user-focused design
- **[Coupert](https://www.coupert.com/)**: Modern UI patterns and effective coupon presentation
- **[CouponBirds](https://www.couponbirds.com/)**: Comprehensive filtering and search functionality

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npx prisma studio` - Open Prisma Studio (database GUI)
- `npx prisma migrate dev` - Run database migrations
- `npx prisma generate` - Generate Prisma client

## 📊 Features Roadmap

### Phase 1: Foundation ✅
- [x] Project setup and configuration
- [x] Database schema implementation
- [x] Basic authentication system
- [x] Main layout and hero section

### Phase 2: Core Features (Next)
- [ ] Coupon management system
- [ ] User browsing interface
- [ ] Search and filtering
- [ ] Basic admin functionality

### Phase 3: Enhanced Features
- [ ] User accounts and favorites
- [ ] Advanced search
- [ ] Analytics dashboard
- [ ] Email notifications

### Phase 4: Polish & Deploy
- [ ] UI/UX improvements
- [ ] Performance optimization
- [ ] Testing and bug fixes
- [ ] Deployment and monitoring

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by [FatCoupon](https://fatcoupon.com/), [Coupert](https://www.coupert.com/), and [CouponBirds](https://www.couponbirds.com/)
- Built with [Next.js](https://nextjs.org/), [Prisma](https://prisma.io/), and [Tailwind CSS](https://tailwindcss.com/)
- UI components from [Shadcn/ui](https://ui.shadcn.com/)

---

**NepQue** - Your ultimate destination for amazing coupons and deals! 🎉