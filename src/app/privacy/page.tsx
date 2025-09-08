'use client'

import Layout from '@/components/layout/Layout'
import { Card, CardContent } from '@/components/ui/card'

export default function PrivacyPage() {
  return (
    <Layout>
      <div className="bg-gray-50 border-b">
        <div className="container mx-auto px-4 py-12 text-center max-w-4xl">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 mb-3">Privacy Policy</h1>
          <p className="text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Card className="shadow-sm">
          <CardContent className="p-6 space-y-8 text-gray-700 leading-relaxed">
            <section>
              <h2 className="text-xl font-semibold mb-2">1. Information We Collect</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>Account data: name, email, and profile settings.</li>
                <li>Usage data: pages viewed, actions taken, device and browser metadata.</li>
                <li>Submission data: information you provide about brands and coupons.</li>
              </ul>
            </section>
            <section>
              <h2 className="text-xl font-semibold mb-2">2. How We Use Information</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>Provide, maintain, and improve the service and user experience.</li>
                <li>Detect abuse, prevent fraud, and ensure platform integrity.</li>
                <li>Communicate updates and respond to support requests.</li>
              </ul>
            </section>
            <section>
              <h2 className="text-xl font-semibold mb-2">3. Cookies & Similar Technologies</h2>
              <p>We use cookies for authentication, preferences, and analytics. You can manage cookies in your browser settings.</p>
            </section>
            <section>
              <h2 className="text-xl font-semibold mb-2">4. Data Security</h2>
              <p>We apply industry-standard security measures. However, no method is 100% secure.</p>
            </section>
            <section>
              <h2 className="text-xl font-semibold mb-2">5. Data Sharing</h2>
              <p>We do not sell your personal data. Limited sharing may occur with service providers and as required by law.</p>
            </section>
            <section>
              <h2 className="text-xl font-semibold mb-2">6. Your Rights</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>Access and update your profile information.</li>
                <li>Request deletion of your account by contacting support.</li>
                <li>Opt-out of non-essential communications.</li>
              </ul>
            </section>
            <section>
              <h2 className="text-xl font-semibold mb-2">7. Children’s Privacy</h2>
              <p>Our service is not directed to children under 13. We do not knowingly collect their information.</p>
            </section>
            <section>
              <h2 className="text-xl font-semibold mb-2">8. Changes</h2>
              <p>We may update this policy periodically. Continued use signifies acceptance of updates.</p>
            </section>
            <section>
              <h2 className="text-xl font-semibold mb-2">9. Contact</h2>
              <p>Questions or requests? Reach out via the links in the site footer.</p>
            </section>
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}


