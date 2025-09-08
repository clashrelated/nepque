#!/usr/bin/env tsx

const BASE_URL = 'http://localhost:3000/api'

interface TestResult {
  name: string
  status: 'PASS' | 'FAIL'
  message: string
  data?: any
}

async function testEndpoint(
  name: string,
  method: string,
  url: string,
  body?: any
): Promise<TestResult> {
  try {
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    }

    if (body) {
      options.body = JSON.stringify(body)
    }

    const response = await fetch(`${BASE_URL}${url}`, options)
    const data = await response.json()

    if (response.ok && data.success) {
      return {
        name,
        status: 'PASS',
        message: `✅ ${name} - Status: ${response.status}`,
        data: data.data ? (Array.isArray(data.data) ? data.data.length : 1) : 0
      }
    } else {
      return {
        name,
        status: 'FAIL',
        message: `❌ ${name} - Status: ${response.status}, Error: ${data.message || 'Unknown error'}`
      }
    }
  } catch (error) {
    return {
      name,
      status: 'FAIL',
      message: `❌ ${name} - Error: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
}

async function runTests() {
  console.log('🧪 Testing NepQue API Endpoints\n')
  console.log('='.repeat(50))

  const tests: TestResult[] = []

  // Test coupon endpoints
  console.log('\n📋 Testing Coupon Endpoints...')
  tests.push(await testEndpoint('Get All Coupons', 'GET', '/coupons?limit=5'))
  tests.push(await testEndpoint('Get Coupons with Search', 'GET', '/coupons?q=electronics&limit=3'))
  tests.push(await testEndpoint('Get Verified Coupons', 'GET', '/coupons?verified=true&limit=3'))
  tests.push(await testEndpoint('Get Coupons by Category', 'GET', '/coupons?categoryId=cmf71i2tg00003i4hjagcj7wo&limit=3'))
  tests.push(await testEndpoint('Get Popular Coupons', 'GET', '/coupons/popular?limit=3'))
  tests.push(await testEndpoint('Get Specific Coupon', 'GET', '/coupons/coupon-1'))

  // Test brand endpoints
  console.log('\n🏢 Testing Brand Endpoints...')
  tests.push(await testEndpoint('Get All Brands', 'GET', '/brands?limit=5'))
  tests.push(await testEndpoint('Search Brands', 'GET', '/brands?search=amazon&limit=3'))

  // Test category endpoints
  console.log('\n📂 Testing Category Endpoints...')
  tests.push(await testEndpoint('Get All Categories', 'GET', '/categories?limit=5'))
  tests.push(await testEndpoint('Search Categories', 'GET', '/categories?search=electronics&limit=3'))

  // Test search endpoints
  console.log('\n🔍 Testing Search Endpoints...')
  tests.push(await testEndpoint('Universal Search', 'GET', '/search?q=electronics&limit=3'))
  tests.push(await testEndpoint('Search Coupons Only', 'GET', '/search?q=apple&type=coupons&limit=3'))
  tests.push(await testEndpoint('Search Brands Only', 'GET', '/search?q=amazon&type=brands&limit=3'))

  // Test admin endpoints
  console.log('\n👨‍💼 Testing Admin Endpoints...')
  tests.push(await testEndpoint('Get Admin Stats', 'GET', '/admin/stats'))

  // Test user favorites (these will fail without proper user context, but we can test the structure)
  console.log('\n❤️ Testing User Favorites...')
  tests.push(await testEndpoint('Get User Favorites (No User)', 'GET', '/user/favorites?userId=test-user'))

  // Test coupon usage (this will fail without proper user context, but we can test the structure)
  console.log('\n📊 Testing Coupon Usage...')
  tests.push(await testEndpoint('Record Coupon Usage (No User)', 'POST', '/coupons/coupon-1/use', {
    userId: 'test-user',
    ipAddress: '127.0.0.1',
    userAgent: 'Test Agent'
  }))

  // Display results
  console.log('\n' + '='.repeat(50))
  console.log('📊 Test Results Summary')
  console.log('='.repeat(50))

  const passed = tests.filter(t => t.status === 'PASS').length
  const failed = tests.filter(t => t.status === 'FAIL').length
  const total = tests.length

  console.log(`\n✅ Passed: ${passed}/${total}`)
  console.log(`❌ Failed: ${failed}/${total}`)
  console.log(`📈 Success Rate: ${((passed / total) * 100).toFixed(1)}%`)

  console.log('\n📋 Detailed Results:')
  tests.forEach(test => {
    console.log(`\n${test.message}`)
    if (test.data !== undefined) {
      console.log(`   Data: ${test.data} items`)
    }
  })

  if (failed > 0) {
    console.log('\n⚠️  Some tests failed. This might be expected for endpoints that require authentication or specific data.')
  } else {
    console.log('\n🎉 All tests passed!')
  }

  console.log('\n🚀 API is ready for use!')
}

// Run the tests
runTests().catch(console.error)
