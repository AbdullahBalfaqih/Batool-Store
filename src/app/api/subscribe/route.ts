import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { createClient } from '@supabase/supabase-js';

// Supabase client (Server-side)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_EMAIL,
    pass: process.env.GMAIL_APP_PASS,
  },
});

const getEmailTemplate = (logoUrl: string) => `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>شكرًا لاشتراكك!</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #000000;
      font-family: 'Tajawal', sans-serif;
      color: #ffffff;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 40px;
      text-align: center;
    }
    .logo {
      max-width: 120px;
      margin-bottom: 30px;
    }
    .content {
      background-color: #111111;
      border-radius: 1rem;
      padding: 30px;
      border: 1px solid #222222;
    }
    h1 {
      color: #60a5fa;
      font-size: 28px;
      margin-bottom: 20px;
    }
    p {
      font-size: 16px;
      line-height: 1.6;
      margin-bottom: 30px;
    }
    .button {
      display: inline-block;
      background-color: #60a5fa;
      color: #ffffff;
      padding: 12px 30px;
      border-radius: 9999px;
      text-decoration: none;
      font-weight: bold;
      font-size: 16px;
    }
    .footer {
      margin-top: 30px;
      font-size: 12px;
      color: #888888;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="content">
      ${logoUrl ? `<img src="${logoUrl}" class="logo" alt="شعار عدسات بتول"/>` : ''}
      <h1>أهلاً بك في عالم عدسات بتول!</h1>
      <p>
        شكرًا لانضمامك لقائمتنا البريدية 🌸  
        <br/><br/>
        سنرسل لك أحدث العروض والأخبار مباشرة إلى بريدك.
      </p>
      <a
        href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://batool.store'}/products"
        class="button">
        اكتشف مجموعتنا
      </a>
    </div>
    <div class="footer">
      &copy; ${new Date().getFullYear()} عدسات بتول. جميع الحقوق محفوظة.
    </div>
  </div>
</body>
</html>
`;

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: 'البريد الإلكتروني مطلوب' },
        { status: 400 }
      );
    }

    // جلب الشعار من Supabase
    const { data, error } = await supabase
      .from('site_settings')
      .select('logo_url')
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    const logoUrl = data?.logo_url || '';

    await transporter.sendMail({
      from: `"عدسات بتول" <${process.env.GMAIL_EMAIL}>`,
      to: email,
      subject: '🎉 أهلًا بك في عائلة عدسات بتول!',
      html: getEmailTemplate(logoUrl),
    });

    return NextResponse.json(
      { message: 'تم الاشتراك بنجاح!' },
      { status: 200 }
    );

  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء الاشتراك' },
      { status: 500 }
    );
  }
}
