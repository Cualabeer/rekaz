require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const rateLimit = require('express-rate-limit');
const Redis = require('ioredis');
const session = require('express-session');
const RedisStore = require('connect-redis').default;

const app = express();

// Validate required env vars on startup (fail fast)
const {
  PORT = 3000,
  REDIS_URL,
  SESSION_SECRET,
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASS,
  SMTP_FROM
} = process.env;

if (!REDIS_URL || !SESSION_SECRET || !SMTP_HOST || !SMTP_USER || !SMTP_PASS || !SMTP_FROM) {
  console.error('Missing required environment variables. Please check .env');
  process.exit(1);
}

// Setup Redis client & session store
const redisClient = new Redis(REDIS_URL);
const redisStore = new RedisStore({ client: redisClient });

app.use(express.json());

// Rate limiter: max 50 requests per 15 minutes per IP
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: 'Too many requests, please try again later.'
}));

// Session middleware using Redis store
app.use(session({
  store: redisStore,
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 15 * 60 * 1000 } // 15 min session
}));

// Nodemailer transporter setup
const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: Number(SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS
  }
});

// Generate 6-digit numeric code
function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Endpoint: send verification code email
app.post('/api/send-code', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required' });

  const code = generateCode();

  try {
    await transporter.sendMail({
      from: SMTP_FROM,
      to: email,
      subject: 'Your AutoX Verification Code',
      text: `Your verification code is: ${code}`
    });

    // Save code in Redis with 10min expiration
    await redisClient.set(`verify:${email}`, code, 'EX', 600);

    res.json({ message: 'Verification code sent' });
  } catch (err) {
    console.error('Error sending email:', err);
    res.status(500).json({ error: 'Failed to send verification code' });
  }
});

// Endpoint: verify submitted code
app.post('/api/verify-code', async (req, res) => {
  const { email, code } = req.body;
  if (!email || !code) return res.status(400).json({ error: 'Email and code required' });

  try {
    const storedCode = await redisClient.get(`verify:${email}`);
    if (storedCode && storedCode === code) {
      await redisClient.del(`verify:${email}`); // remove code after successful verify
      res.json({ message: 'Verification successful' });
    } else {
      res.status(400).json({ error: 'Invalid verification code' });
    }
  } catch (err) {
    console.error('Verification error:', err);
    res.status(500).json({ error: 'Verification failed' });
  }
});

app.listen(PORT, () => {
  console.log(`AutoX backend listening on port ${PORT}`);
});