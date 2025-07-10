require('dotenv').config();
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors()); 
app.use(express.json());

// Create reusable transporter object using Gmail SMTP with OAuth2 or App Password
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,      // Your Gmail address
    pass: process.env.GMAIL_APP_PASS,  // Your Gmail App Password
  },
});

// Generate 6-digit code
function generateCode() {
  return ('' + Math.floor(100000 + Math.random() * 900000));
}

// POST endpoint to send verification code email
app.post('/api/send-code', async (req, res) => {
  try {
    const { email, service, register } = req.body;

    if (!email || !service) {
      return res.status(400).json({ error: 'Email and service are required.' });
    }

    const code = generateCode();

    // Store the code in your DB or cache with expiry - For demo, just log it
    console.log(`Verification code for ${email} (Service: ${service}): ${code}`);

    const mailOptions = {
      from: `"AutoX Services" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: register ? 'AutoX Registration Code' : 'AutoX Login Code',
      text: `Your AutoX verification code is: ${code}\n\nThis code will expire in 10 minutes.`,
      html: `<p>Your AutoX verification code is: <strong>${code}</strong></p><p>This code will expire in 10 minutes.</p>`,
    };

    await transporter.sendMail(mailOptions);

    res.json({ message: 'Verification code sent.' });
  } catch (err) {
    console.error('Error sending email:', err);
    res.status(500).json({ error: 'Failed to send verification code.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});