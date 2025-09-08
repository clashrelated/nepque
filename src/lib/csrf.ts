// Client-side CSRF token management
let csrfToken: string | null = null
let tokenPromise: Promise<string> | null = null

export const getCSRFToken = async (): Promise<string> => {
  if (csrfToken) {
    return csrfToken
  }

  if (tokenPromise) {
    return tokenPromise
  }

  tokenPromise = fetch('/api/csrf-token')
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        csrfToken = data.data.csrfToken
        return csrfToken!
      }
      throw new Error('Failed to get CSRF token')
    })
    .catch(error => {
      tokenPromise = null
      throw error
    })

  return tokenPromise
}

export const clearCSRFToken = () => {
  csrfToken = null
  tokenPromise = null
}

export const getCSRFHeaders = async (): Promise<Record<string, string>> => {
  const token = await getCSRFToken()
  return {
    'X-CSRF-Token': token,
    'Content-Type': 'application/json'
  }
}
