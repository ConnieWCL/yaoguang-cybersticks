# Supabase confirmation email

- Subject: `【爻光】{{ .Token }} 是你的入册验证码`
- Template: `confirmation.html`
- Dashboard: Authentication → Email Templates → Confirm signup

The template uses `{{ .Token }}` and is paired with `supabase.auth.verifyOtp({ email, token, type: 'signup' })` in the web app.

Supabase projects created on the Free plan after 2026-06-03 need custom SMTP before authentication email templates can be customized. Configure SMTP first, then paste the subject and HTML above into the Confirm signup template.
