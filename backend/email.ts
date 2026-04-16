import nodemailer from 'nodemailer';

function createTransporter() {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!user || !pass) return null;

  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: { user, pass },
    tls: {
      rejectUnauthorized: true,
      minVersion: 'TLSv1.2'
    }
  });
}

type OTPContext = 'login' | 'register' | 'forgot-password';

export async function sendOTPEmail(
  to: string,
  otp: string,
  name: string,
  context: OTPContext = 'register'
): Promise<boolean> {
  const transporter = createTransporter();
  const from = process.env.SMTP_USER;

  if (!transporter || !from) {
    console.warn(`[OTP NO-SMTP] To: ${to} | Code: ${otp}`);
    return false;
  }

  let subject = '';
  let actionLabel = '';

  if (context === 'login') {
    subject = 'رمز تسجيل الدخول — Great Society';
    actionLabel = 'تسجيل الدخول إلى حسابك';
  } else if (context === 'forgot-password') {
    subject = 'رمز استعادة كلمة المرور — Great Society';
    actionLabel = 'استعادة كلمة المرور';
  } else {
    subject = 'رمز التحقق لإنشاء حسابك — Great Society';
    actionLabel = 'تأكيد إنشاء حسابك';
  }

  const html = `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
<body style="margin:0;padding:0;background:#f0f4f8;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4f8;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" style="max-width:480px;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#005a7d,#007a9a);padding:36px 32px;text-align:center;">
            <p style="margin:0 0 4px;color:#bca056;font-size:12px;letter-spacing:3px;text-transform:uppercase;font-weight:700;">GREAT SOCIETY</p>
            <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:900;">منصة إسكنك العقارية</h1>
            <p style="margin:8px 0 0;color:rgba(255,255,255,0.7);font-size:14px;">Alexandria, Egypt</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:36px 32px;text-align:center;">
            <p style="margin:0 0 8px;color:#374151;font-size:16px;">مرحباً <strong style="color:#005a7d;">${name}</strong></p>
            <p style="margin:0 0 28px;color:#6b7280;font-size:14px;line-height:1.6;">
              طلبت <strong>${actionLabel}</strong>.<br/>
              استخدم الرمز التالي لإتمام العملية:
            </p>

            <!-- OTP Box -->
            <div style="display:inline-block;background:linear-gradient(135deg,#005a7d,#007a9a);border-radius:16px;padding:24px 40px;margin-bottom:28px;">
              <span style="color:#ffffff;font-size:40px;font-weight:900;letter-spacing:14px;display:block;">${otp}</span>
            </div>

            <!-- Warning -->
            <table width="100%" style="background:#fef3cd;border:1px solid #fde68a;border-radius:12px;margin-bottom:24px;">
              <tr><td style="padding:14px 16px;text-align:center;">
                <p style="margin:0;color:#92400e;font-size:13px;">
                  ⏱️ هذا الرمز صالح لمدة <strong>5 دقائق فقط</strong>
                </p>
                <p style="margin:6px 0 0;color:#92400e;font-size:12px;">
                  🔒 لديك 3 محاولات قبل الحجب المؤقت
                </p>
              </td></tr>
            </table>

            <p style="margin:0;color:#9ca3af;font-size:12px;line-height:1.7;">
              إذا لم تطلب هذا الرمز، تجاهل هذا البريد فوراً.<br/>
              لا تشارك هذا الرمز مع أي شخص.
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f9fafb;padding:20px 32px;text-align:center;border-top:1px solid #e5e7eb;">
            <p style="margin:0;color:#9ca3af;font-size:11px;">
              &copy; 2026 Great Society Real Estate · الإسكندرية، مصر
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>
  `;

  try {
    const info = await transporter.sendMail({
      from: `"Great Society إسكنك" <${from}>`,
      to,
      subject,
      html,
    });
    console.log(`[EMAIL] ✅ Sent to ${to} — ${info.messageId}`);
    return true;
  } catch (err: any) {
    console.error('[EMAIL] ❌ Failed:', err?.message || err);
    console.error('[EMAIL] Full error:', JSON.stringify(err, null, 2));
    return false;
  }
}
