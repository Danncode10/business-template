# Auth Redirects and Tenant Env

DannFlow projects can share one Supabase project across many client websites.
That saves cost on the free/pro tier, but every deployment must identify which
client organization it serves.

This guide covers the two pieces that must stay aligned:

1. Supabase Auth URL Configuration.
2. Per-client deployment environment variables.

## Mental model

Supabase Auth is project-wide. A user can authenticate against the shared
Supabase project, but authentication alone does not mean they belong to the
current client site.

DannFlow uses two deployment identifiers:

```env
NEXT_PUBLIC_APP_ID=<project-or-client-slug>
NEXT_PUBLIC_ORG_ID=<client organization uuid>
```

The dashboard membership gate must compare the signed-in user profile or
membership row against both values. If they do not match, the app should deny
access.

## Password login

Normal email/password login does not use Supabase redirect URLs.

When a user signs in from:

```text
https://client-a.com/login
```

the app should navigate with a relative route:

```ts
router.push("/dashboard")
```

That keeps the user on the same client domain:

```text
https://client-a.com/dashboard
```

## Email-link flows

Supabase URL Configuration matters for flows that send a link by email:

- password reset
- magic link login
- email confirmation
- OAuth callback, if OAuth is enabled

For these flows, pass a client-specific redirect URL from the app:

```ts
redirectTo: `${window.location.origin}/reset-password`
```

or for server-side code:

```ts
emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/magic-link-verify`
```

The redirect URL must be listed in Supabase Auth URL Configuration.

## Supabase Auth URL Configuration

In Supabase:

```text
Authentication -> URL Configuration
```

Use **Site URL** only as the fallback/default URL. Do not put an agency domain
there unless that is truly where failed/default auth links should land.

For local development, this is fine:

```text
Site URL: http://localhost:3000
```

For production, choose a sane default production app, then allow every client
domain in **Redirect URLs**.

Recommended Redirect URLs:

```text
http://localhost:3000/**
https://client-a.com/**
https://www.client-a.com/**
https://client-b.vercel.app/**
https://client-b.com/**
https://www.client-b.com/**
```

If using Vercel preview deployments, add the narrowest preview wildcard you can
reasonably support. Avoid broad wildcards for production domains when exact
domains are known.

## Per-client Vercel env

Each Vercel project/client deployment needs its own values:

```env
NEXT_PUBLIC_APP_ID=client-a
NEXT_PUBLIC_ORG_ID=11111111-1111-1111-1111-111111111111
NEXT_PUBLIC_SITE_URL=https://client-a.com
NEXT_PUBLIC_SITE_NAME="Client A"
```

```env
NEXT_PUBLIC_APP_ID=client-b
NEXT_PUBLIC_ORG_ID=22222222-2222-2222-2222-222222222222
NEXT_PUBLIC_SITE_URL=https://client-b.com
NEXT_PUBLIC_SITE_NAME="Client B"
```

After changing Vercel env values, redeploy. Existing deployments do not pick up
new environment variables automatically.

## Owner account provisioning

When creating an owner account manually in Supabase Auth, also provision the
matching profile/membership row.

For the current profile-based gate, the profile must match:

```text
profiles.app_id = NEXT_PUBLIC_APP_ID
profiles.organization_id = NEXT_PUBLIC_ORG_ID
profiles.role = admin
```

If the profile is created with a default app id from another client, login will
succeed but `/dashboard` will show the no-access page.

## Template rule

Never hardcode one client slug as the default for new users in shared-template
database triggers. New users should either:

1. be provisioned through an invite/admin flow that knows the target org, or
2. be created with metadata that the trigger can use to set `app_id` and
   `organization_id`, or
3. be denied until an administrator assigns membership.

This keeps one shared Supabase project safe for many client websites.
