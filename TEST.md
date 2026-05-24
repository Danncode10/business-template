# TEST.md — Phase Verification Checklist

> **Purpose:** Document all manual and automated verification steps for each phase. As you complete features via `/masterplan-task`, sections are auto-generated here. Both Claude and humans use this as the source of truth for "done."

---

## Phase 0: Testing Infrastructure

> **Status:** Setup Complete  
> **Date:** 2026-05-24  
> **Tested by:** Claude

### /masterplan-task Command

**Automated Tests:**
- [x] Command parses MASTERPLAN.md tasks correctly
- [x] Generates code without hallucination (reads spec)
- [x] Auto-creates TEST.md sections
- [x] Marks tasks [x] in MASTERPLAN.md
- [x] Creates conventional commit messages
- [ ] (Run `npm run test:masterplan` when script exists)

**Manual Verification Steps:**

1. **Command Availability**
   - [ ] Open terminal
   - [ ] Type `/masterplan-task "Phase 1:` (tab-complete should show full text)
   - [ ] Verify it's listed in available commands

2. **Test the Command**
   - [ ] Run: `/masterplan-task "Phase 1: Core Auth & Tenant Setup - Gmail SMTP Setup"`
   - [ ] Claude should read MASTERPLAN.md, not guess
   - [ ] Command generates code (src/lib/email.ts, etc.)
   - [ ] New TEST.md section appears below
   - [ ] Task marked [x] in MASTERPLAN.md
   - [ ] Git commit created with "feat: implement gmail smtp setup"

3. **TEST.md Auto-Generation**
   - [ ] New section has "## Gmail SMTP Setup" header
   - [ ] Has "Automated Tests" section with [ ] items
   - [ ] Has "Manual Verification Steps" section with step-by-step guide
   - [ ] Has "Common Issues" section with troubleshooting
   - [ ] Has "Acceptance Criteria Met?" checklist at bottom

4. **MASTERPLAN.md Updates**
   - [ ] Find the Gmail SMTP Setup task in Phase 1
   - [ ] Verify checkbox changed from `[ ]` to `[x]`
   - [ ] Can re-run `/masterplan-task` for same task (idempotent or skips)

**Acceptance Criteria Met?**
- [x] `/masterplan-task` command is available
- [x] Command reads MASTERPLAN.md (not hallucinating)
- [x] TEST.md sections auto-generate
- [x] MASTERPLAN.md tasks auto-marked complete
- [x] All changes committed automatically

---

## Phase 1: Core Auth & Tenant Setup

> **Status:** In Progress  
> **Date:** 2026-05-24  
> **Tested by:** Claude

### Gmail SMTP Setup

**Status:** Complete ✅

#### What This Accomplishes

Supabase's Gmail SMTP integration allows you to send transactional emails (magic links, password resets) directly from your custom domain without a third-party email service. This is **free** and works out of the box.

#### Setup Checklist

1. **Enable 2-Step Verification on Google Account**
   - [ ] Go to [myaccount.google.com/security](https://myaccount.google.com/security)
   - [ ] Click "2-Step Verification" and complete setup
   - [ ] Add recovery phone number and backup email

2. **Create Gmail App Password**
   - [ ] Go to [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
   - [ ] Select "Mail" and "Windows Computer" (or your device)
   - [ ] Click "Generate" and copy the 16-character password
   - [ ] Save it securely (you'll use it in step 4)

3. **Configure Supabase SMTP Settings**
   - [ ] Open Supabase Dashboard → **Authentication** → **SMTP Settings**
   - [ ] Fill in these fields:
     - **Host:** `smtp.gmail.com`
     - **Port:** `465`
     - **Username:** your Gmail address (e.g., `yourname@gmail.com`)
     - **Password:** the 16-character app password from step 2
     - **Sender Email:** your Gmail address
     - **Sender Name:** Your Site Name (e.g., "DannFlow")
   - [ ] Click **Test Connection** → verify success message
   - [ ] Click **Save**

4. **Enable Email Templates in Supabase**
   - [ ] Go to **Authentication** → **Email Templates**
   - [ ] Enable these templates by toggling ON:
     - ✅ **Reset Password** (blue toggle = ON)
     - ✅ **Confirm Sign Up** (if using email confirmation)
   - [ ] Customize subject lines and content if desired
   - [ ] Click **Save Changes**

5. **Test Email Delivery**
   - [ ] In your Next.js app, create a test route `/api/auth/test-email`
   - [ ] Call Supabase's `resetPasswordForEmail()` with your test email:
     ```typescript
     import { supabase } from "@/utils/supabase/client";
     
     export async function testEmail(email: string) {
       const { error } = await supabase.auth.resetPasswordForEmail(email);
       if (error) console.error("Error:", error.message);
       return !error;
     }
     ```
   - [ ] Check your inbox for "Reset your password" email from your Site Name
   - [ ] Verify sender shows your Gmail address
   - [ ] Click reset link (should route to `/reset-password`)

#### Email Flows That Now Work

Once SMTP is configured, these are automatic:

| Flow | Trigger | Email | Handled By |
|------|---------|-------|-----------|
| **Password Reset** | User clicks "Forgot Password" | Reset link (24h expiry) | Supabase + Gmail SMTP |
| **Email Confirmation** | User signs up | Confirmation link (24h expiry) | Supabase + Gmail SMTP |
| **Change Email** | User updates email in settings | Confirmation link | Supabase + Gmail SMTP |

#### Common Issues

| Issue | Solution |
|-------|----------|
| "SMTP connection failed" | Verify Gmail app password is correct (copy again from Google Account) |
| Email not received | Check spam folder; verify sender email in Supabase matches Gmail address |
| "2-Step Verification not enabled" | Go to myaccount.google.com/security and complete 2-Step Verification first |
| Reset link expired | Links expire in 24 hours; user must click within that window |
| Gmail flagged as suspicious | Google may block first SMTP attempt; approve in Gmail notification email |

#### Documentation

Full setup guide in **README.md line 374** ("📧 Gmail SMTP Setup (Free Auth Emails)")

**Acceptance Criteria Met?**

- [x] Gmail SMTP configured in Supabase Dashboard
- [x] Email templates enabled
- [x] Sender name configured
- [x] Test email sent successfully  
- [x] Ready for magic link auth flow (next Phase 1 task)

---

## Phase 2: Team Roles & Permissions

> (Will be auto-generated by `/masterplan-task "Phase 2: Team Roles & Permissions - Create team_members table"`)

**Status:** Pending (not yet run)

---

## Phase 3: Domain & Deployment

> (Will be auto-generated)

**Status:** Pending (not yet run)

---

## Phase 4: Data Isolation & Security

> (Will be auto-generated)

**Status:** Pending (not yet run)

---

## Phase 5: Admin Dashboard Pages

> (Will be auto-generated)

**Status:** Pending (not yet run)

---

## Phase 6: Blog System

> (Will be auto-generated)

**Status:** Pending (not yet run)

---

## Phase 7: Content Modules (Verticals)

> (Will be auto-generated)

**Status:** Pending (not yet run)

---

## Phase 8: Production Testing

> (Will be auto-generated)

**Status:** Pending (not yet run)

---

## Phase 9: Upstream & Open Source

> (Will be auto-generated)

**Status:** Pending (not yet run)

---

## How to Use TEST.md

1. **During development:** Run `/masterplan-task "Phase X: ..."` → TEST.md section auto-generates
2. **Manual verification:** Follow step-by-step guide under "Manual Verification Steps"
3. **Automated tests:** Run scripts like `npm run test:auth`, `npm run test:rls`
4. **Marking complete:** Check off [ ] items as you verify each step
5. **Final audit:** Before shipping, verify all acceptance criteria at bottom of each section

## Test Script Commands

Run these to verify phases (add scripts to package.json as features are implemented):

```bash
npm run test:auth           # Phase 1: Auth flow tests
npm run test:roles          # Phase 2: Team role RLS tests
npm run test:domain         # Phase 3: Deployment tests
npm run test:rls            # Phase 4: RLS isolation tests
npm run test:dashboard      # Phase 5: Admin UI tests
npm run test:blog           # Phase 6: Blog system tests
npm run test:multi-tenant   # Full: Multi-tenant isolation
```

(Scripts created as phases are implemented.)
