# Supabase confirmation email

- Subject: `【爻光】{{ .Token }} 是你的入册验证码`
- Sender name: `爻光`
- Sender address: `no-reply@auth.hiconnie.com`
- Sending domain: `auth.hiconnie.com`
- Template: `confirmation.html`
- Dashboard: Authentication → Email Templates → Confirm signup

The template uses `{{ .Token }}` and is paired with `supabase.auth.verifyOtp({ email, token, type: 'email' })` in the web app.
It deliberately contains no verification link and no rasterized code image. The six digits remain selectable, copyable, accessible, and visible when an email client blocks remote images.

Supabase projects created on the Free plan after 2026-06-03 need custom SMTP before authentication email templates can be customized. Configure SMTP first, then paste the subject and HTML above into the Confirm signup template.
