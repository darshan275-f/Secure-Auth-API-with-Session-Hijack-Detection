import nodemailer from 'nodemailer';

const sendEmailAlert = async (ip, device, recipientEmail) => {
  try {
  
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASS,    
      },
    });

    
    const mailOptions = {
      from: `"Secure Auth Alert" <${process.env.EMAIL_USERNAME}>`,
      to: recipientEmail,
      subject: '🔐 Suspicious Login Detected',
      text: `A new login was detected:\n\nIP Address: ${ip}\nDevice: ${device}`,
      html: `
        <h2>⚠️ Suspicious Login Alert</h2>
        <p>A new login to your account was detected:</p>
        <ul>
          <li><strong>IP Address:</strong> ${ip}</li>
          <li><strong>Device:</strong> ${device}</li>
        </ul>
        <p>If this was not you, please reset your password immediately.</p>
      `,
    };

    // Send the email
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
  } catch (error) {
    console.error('Failed to send email alert:', error.message);
  }
};

export default sendEmailAlert;
