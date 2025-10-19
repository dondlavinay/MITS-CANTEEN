const nodemailer = require('nodemailer');
require('dotenv').config();

async function testEmail() {
  console.log('Testing email with credentials:');
  console.log('Email User:', process.env.EMAIL_USER);
  console.log('Email Pass exists:', !!process.env.EMAIL_PASS);
  
  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  try {
    // Verify connection
    await transporter.verify();
    console.log('✅ SMTP connection verified');
    
    // Send test email
    const result = await transporter.sendMail({
      from: `"MITS Canteen" <${process.env.EMAIL_USER}>`,
      to: '23691a28i8@mits.ac.in',
      subject: 'Test OTP - MITS Canteen',
      text: 'Your OTP is: 123456',
      html: '<h2>Your OTP is: <strong>123456</strong></h2>'
    });
    
    console.log('✅ Email sent successfully:', result.messageId);
  } catch (error) {
    console.error('❌ Email test failed:', error.message);
  }
}

testEmail();