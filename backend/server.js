// backend/server.js

const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const redis = require('redis');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Redis setup
const redisClient = redis.createClient({
  url: process.env.REDIS_URL,
  socket: { tls: false }
});

redisClient.connect().catch(console.error);

// Generate 6-digit code
const generateCode = () => Math.floor(100000 + Math.random() * 900000).toString();

// Nodemailer setup
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Send email + store code
app.post('/api/send-code', async (req, res) => {
  const { email } = req.body;
  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Invalid email' });
  }

  const code = generateCode();

  try {
    // Save to Redis with 10 min expiry
    await redisClient.setEx(`verify:${email}`, 600, code);

    // Send email
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: email,
      subject: 'Your AutoX Verification Code',
      text: `Your AutoX verification code is: ${code}\n\nThis code expires in 10 minutes.`,
    });

    console.log(`✅ Code ${code} sent to ${email}`);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('❌ Email send failed:', error.message);
    res.status(500).json({ error: 'Failed to send verification code.' });
  }
});

// OPTIONAL: verify-code endpoint (future)
app.post('/api/verify-code', async (req, res) => {
  const { email, code } = req.body;
  const storedCode = await redisClient.get(`verify:${email}`);
  if (storedCode === code) {
    return res.status(200).json({ verified: true });
  }
  return res.status(400).json({ verified: false, error: 'Invalid or expired code' });
});

// Launch server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 AutoX backend running on port ${PORT}`));