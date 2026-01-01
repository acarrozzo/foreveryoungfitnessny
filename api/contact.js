const nodemailer = require('nodemailer');

async function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

function validatePayload(payload) {
  if (!payload) {
    return 'Missing request body.';
  }
  const { name, email, message } = payload;
  if (!name || !email || !message) {
    return 'Name, email, and message are required.';
  }
  return null;
}

async function sendEmail(payload) {
  const { name, email, phone, message } = payload;
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!user || !pass) {
    throw new Error('Email credentials are not configured.');
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
  });

  return transporter.sendMail({
    from: user,
    to: 'foreveryoungfitny@gmail.com',
    replyTo: email,
    subject: `New contact from ${name}`,
    text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone || 'Not provided'}\n\n${message}`,
    html: `
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
      <p><strong>Message:</strong></p>
      <p>${(message || '').replace(/\n/g, '<br>')}</p>
    `,
  });
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const bodyText = await parseBody(req);
    let payload;
    try {
      payload = JSON.parse(bodyText || '{}');
    } catch (error) {
      return res.status(400).json({ error: 'Invalid JSON body.' });
    }

    const validationError = validatePayload(payload);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    await sendEmail(payload);
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Contact form error:', error);
    return res.status(500).json({ error: 'Failed to send message.' });
  }
};
