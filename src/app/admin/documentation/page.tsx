"use client"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function AdminDocumentationPage() {
  return (
    <div className="py-6 space-y-6">
      <div className="mb-2">
        <h1 className="text-3xl font-bold tracking-tight">Admin Documentation</h1>
        <p className="text-gray-600">Overview of modules, APIs, authentication, and integration guidance.</p>
      </div>

      {/* Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Overview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-gray-700">
          <p>Frontend: Next.js App Router + Shadcn UI. Backend: Next.js API Routes + Prisma (PostgreSQL). Auth via NextAuth with session cookies.</p>
          <ul className="list-disc pl-5">
            <li>Coupons & Brands with sponsored placements and weights</li>
            <li>Categories, Favorites, and Coupon Usage tracking</li>
            <li>User Submissions for Brands/Coupons</li>
            <li>Admin Analytics and Usage Analytics</li>
            <li>Contact & Partner submissions</li>
          </ul>
        </CardContent>
      </Card>

      {/* Modules */}
      <Card>
        <CardHeader><CardTitle>Modules</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 text-gray-700">
              <h3 className="font-semibold">Coupons</h3>
              <p>Create, edit, sponsor, and track usage.</p>
              <ul className="list-disc pl-5">
                <li>Types: COUPON_CODE, DEAL, CASHBACK, FREE_SHIPPING</li>
                <li>DiscountType: PERCENTAGE, FIXED_AMOUNT, etc.</li>
                <li>Sponsorship: `sponsored` boolean and `sponsorWeight` integer</li>
              </ul>
            </div>
            <div className="space-y-2 text-gray-700">
              <h3 className="font-semibold">Brands</h3>
              <p>Manage brand info, website, logo, and sponsorship.</p>
            </div>
            <div className="space-y-2 text-gray-700">
              <h3 className="font-semibold">Categories</h3>
              <p>Organize coupons for browsing and filters.</p>
            </div>
            <div className="space-y-2 text-gray-700">
              <h3 className="font-semibold">Submissions</h3>
              <p>Approve or move user submissions into Brands/Coupons (inactive first).</p>
            </div>
            <div className="space-y-2 text-gray-700">
              <h3 className="font-semibold">Contacts</h3>
              <p>Leads from /contact and /partner with clear labels, viewed at /admin/contact.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pages */}
      <Card>
        <CardHeader><CardTitle>Pages</CardTitle></CardHeader>
        <CardContent className="space-y-4 text-gray-700">
          <div>
            <h3 className="font-semibold">Homepage (/)</h3>
            <ul className="list-disc pl-5 text-sm">
              <li>Hero + featured/sponsored rails</li>
              <li>Popular coupons section</li>
              <li>Shared UI: `CouponCard`, quick actions, open `CouponModal` on click</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold">Coupons (/coupons)</h3>
            <ul className="list-disc pl-5 text-sm">
              <li>Full filters: type, verified, exclusive, sort, pagination</li>
              <li>Top sponsored rail (filtered out from main grid)</li>
              <li>Components: `CouponCard`, `CouponModal`, filter controls, search input</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold">Brand (/brand/[slug])</h3>
            <ul className="list-disc pl-5 text-sm">
              <li>Brand header (logo, link, description)</li>
              <li>Same filter UI as /coupons but scoped to the brand</li>
              <li>Brand-specific sponsored rail</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold">Categories (/categories) and Category grids</h3>
            <ul className="list-disc pl-5 text-sm">
              <li>Browse categories with icons/colors</li>
              <li>Category detail uses the same coupon list building blocks</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold">Profile (/profile)</h3>
            <ul className="list-disc pl-5 text-sm">
              <li>Edit name, preferences (currency Rs), Estimated Total Savings</li>
              <li>Uses `apiClient` to update user profile</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold">Favorites (/favorites)</h3>
            <ul className="list-disc pl-5 text-sm">
              <li>Lists user’s saved coupons via `favoritesApi.list()`</li>
              <li>Cards reuse `CouponCard`; unsave via action button</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold">Shared Building Blocks</h3>
            <ul className="list-disc pl-5 text-sm">
              <li>`Search` inputs built with Shadcn `Input` and URLSearchParams</li>
              <li>`CouponCard` handles layout, favorite state, sponsored badge ribbon</li>
              <li>`CouponModal` opens on card click; tracks usage via `couponsApi.use()`</li>
              <li>`Layout` wraps pages with header/footer and scroll-to-top</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* APIs */}
      <Card>
        <CardHeader><CardTitle>APIs</CardTitle></CardHeader>
        <CardContent className="space-y-4 text-gray-700">
          <div>
            <div className="font-semibold">Public</div>
            <ul className="list-disc pl-5 text-sm">
              <li><Badge variant="outline">GET</Badge> /api/coupons — list coupons (query params: pagination, filters)</li>
              <li><Badge variant="outline">GET</Badge> /api/brands — list brands (supports sponsored ordering)</li>
              <li><Badge variant="outline">POST</Badge> /api/contact — submit contact/partner inquiry</li>
            </ul>
          </div>
          <div>
            <div className="font-semibold">Authenticated (User)</div>
            <ul className="list-disc pl-5 text-sm">
              <li><Badge variant="outline">POST</Badge> /api/user/favorites — add favorite</li>
              <li><Badge variant="outline">DELETE</Badge> /api/user/favorites?couponId=...</li>
              <li><Badge variant="outline">POST</Badge> /api/coupons/[id]/use — track usage</li>
            </ul>
          </div>
          <div>
            <div className="font-semibold">Admin</div>
            <ul className="list-disc pl-5 text-sm">
              <li><Badge>GET</Badge> /api/admin/stats — admin KPIs</li>
              <li><Badge>GET</Badge> /api/admin/coupon-usages — raw usage data</li>
              <li><Badge>GET</Badge> /api/submissions — list user submissions</li>
              <li><Badge>PATCH</Badge> /api/submissions — update/move submission</li>
              <li><Badge>GET</Badge> /api/contact — list contacts (optional ?type=CONTACT|PARTNER)</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* External Use */}
      <Card>
        <CardHeader><CardTitle>External Use</CardTitle></CardHeader>
        <CardContent className="space-y-3 text-gray-700">
          <p>You can consume selected endpoints from other services or sites.</p>
          <ul className="list-disc pl-5">
            <li>Public endpoints: no auth, rate limits may apply.</li>
            <li>User endpoints: require session cookie (SSO) or convert to token-based proxy.</li>
            <li>Admin endpoints: server-to-server only; protect by IP allowlist, admin session, or API key gateway.</li>
          </ul>
        </CardContent>
      </Card>

      {/* Auth & Security */}
      <Card>
        <CardHeader><CardTitle>Auth & Security</CardTitle></CardHeader>
        <CardContent className="space-y-3 text-gray-700">
          <ul className="list-disc pl-5">
            <li>Sessions: NextAuth cookie-based; use `getServerSession` in APIs.</li>
            <li>Roles: USER, ADMIN, SUPER_ADMIN; admin routes enforce role checks.</li>
            <li>CSRF: enforced for state-changing public endpoints via `api-client` token header.</li>
            <li>Validation: Zod schemas in `src/lib/validation.ts`.</li>
            <li>Prisma: parameterized queries prevent SQL injection; avoid raw SQL unless necessary.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}


