import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const APP_ID = process.env.NEXT_PUBLIC_APP_ID ?? 'business-template'

export async function updateSession(request: NextRequest) {
  // Forward app-id to Server Components via request header
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-app-id', APP_ID)

  let response = NextResponse.next({ request: { headers: requestHeaders } })
  // Also expose on response so browser DevTools can see it
  response.headers.set('x-app-id', APP_ID)

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // Refresh the request and response when cookies change (token refresh)
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request: { headers: requestHeaders } })
          response.headers.set('x-app-id', APP_ID)
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // getUser() refreshes the session — must be called before any logic
  const { data: { user } } = await supabase.auth.getUser()

  return { response, user }
}
