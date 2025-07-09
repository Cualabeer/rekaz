import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import nodemailer from 'nodemailer';

const verificationCodes = new Map();

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;

// Configure your SMTP transporter (replace with your credentials)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'your.email@gmail.com',
    pass: 'your_app_password_or_oauth'
  }
});

// Generate a random 6-digit code as string
function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Endpoint to send verification code
app.post('/api/send-code', async (req, res) => {
  const { email, register } = req.body;

  if (!email || typeof email !== 'string') {
    return res.status(400).json({ error: 'Valid email is required.' });
  }

  try {
    const code = generateCode();
    verificationCodes.set(email, code);

    const mailOptions = {
      from: '"AutoX Services" <your.email@gmail.com>',
      to: email,
      subject: register
        ? 'AutoX Registration Verification Code'
        : 'AutoX Login Verification Code',
      text: `Your AutoX verification code is: ${code}\n\nThis code will expire in 10 minutes.`
    };

    await transporter.sendMail(mailOptions);

    console.log(`Verification code sent to ${email}: ${code}`);

    res.json({ message: 'Verification code sent successfully.' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: 'Failed to send verification code.' });
  }
});

// Endpoint to verify the 6-digit code submitted by user
app.post('/api/verify-code', (req, res) => {
  const { email, code } = req.body;

  if (!email || !code) {
    return res.status(400).json({ error: 'Email and code are required.' });
  }

  const storedCode = verificationCodes.get(email);

  if (!storedCode) {
    return res.status(400).json({ error: 'No verification code found. Please request a new one.' });
  }

  if (storedCode === code) {
    verificationCodes.delete(email);
    return res.json({ message: 'Verification successful.' });
  } else {
    return res.status(400).json({ error: 'Incorrect verification code.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
