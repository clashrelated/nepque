'use client'

import Layout from '@/components/layout/Layout'
import { Card, CardContent } from '@/components/ui/card'

export default function TermsPage() {
  return (
    <Layout>
      <div className="bg-gray-50 border-b">
        <div className="container mx-auto px-4 py-12 text-center max-w-4xl">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 mb-3">Terms of Service</h1>
          <p className="text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Card className="shadow-sm">
          <CardContent className="p-6 space-y-8 text-gray-700 leading-relaxed">
            <section>
              <h2 className="text-xl font-semibold mb-2">1. Acceptance of Terms</h2>
              <p>By accessing or using NepQue, you agree to these Terms and our Privacy Policy.</p>
            </section>
            <section>
              <h2 className="text-xl font-semibold mb-2">2. Eligibility</h2>
              <p>You must be at least 13 years old to use the service in compliance with applicable laws.</p>
            </section>
            <section>
              <h2 className="text-xl font-semibold mb-2">3. Use of Service</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>Coupons and deals may change or expire without notice.</li>
                <li>We strive for accuracy but do not guarantee redemption success or savings.</li>
                <li>Do not misuse the platform or interfere with normal operation.</li>
              </ul>
            </section>
            <section>
              <h2 className="text-xl font-semibold mb-2">4. Accounts & Security</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>You are responsible for all activity under your account.</li>
                <li>Keep credentials secure and notify us of suspected unauthorized access.</li>
              </ul>
            </section>
            <section>
              <h2 className="text-xl font-semibold mb-2">5. Content & Submissions</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>By submitting brands or coupons, you confirm you have rights to share the information.</li>
                <li>We may moderate, edit, or remove submissions that violate guidelines.</li>
              </ul>
            </section>
            <section>
              <h2 className="text-xl font-semibold mb-2">6. Sponsored & Affiliate Disclosure</h2>
              <p>Sponsored placements are labeled, and we may earn from affiliate links. Editorial integrity is maintained.</p>
            </section>
            <section>
              <h2 className="text-xl font-semibold mb-2">7. Intellectual Property</h2>
              <p>All trademarks and brand names belong to their respective owners. Site content is protected by law.</p>
            </section>
            <section>
              <h2 className="text-xl font-semibold mb-2">8. Termination</h2>
              <p>We may suspend or terminate accounts that violate these Terms or applicable laws.</p>
            </section>
            <section>
              <h2 className="text-xl font-semibold mb-2">9. Limitation of Liability</h2>
              <p>To the fullest extent permitted by law, NepQue is not liable for indirect, incidental, or consequential damages.</p>
            </section>
            <section>
              <h2 className="text-xl font-semibold mb-2">10. Changes to Terms</h2>
              <p>We may update these Terms periodically. Continued use means you accept the changes.</p>
            </section>
            <section>
              <h2 className="text-xl font-semibold mb-2">11. Contact</h2>
              <p>Questions? Reach us via the links in the site footer.</p>
            </section>
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}


