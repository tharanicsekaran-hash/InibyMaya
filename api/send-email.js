/**
 * Vercel Serverless Function — Resend Email Dispatcher
 * Server-to-Server API endpoint to bypass client CORS restrictions and securely handle Resend API keys.
 */

export default async function handler(req, res) {
  // CORS Header Support
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed. Use POST.' });
  }

  const { to, subject, html, replyTo } = req.body || {};

  if (!to || !subject || !html) {
    return res.status(400).json({ error: 'Missing required parameters: to, subject, html.' });
  }

  // Get Resend API Key from server environment variable
  const apiKey = process.env.RESEND_API_KEY || process.env.VITE_RESEND_API_KEY || '';

  if (!apiKey) {
    console.warn('⚠️ Serverless Function Warning: RESEND_API_KEY environment variable is not configured.');
    return res.status(500).json({ 
      error: 'RESEND_API_KEY is missing in server environment variables.',
      simulated: true 
    });
  }

  try {
    const fromAddress = process.env.SENDER_EMAIL || process.env.VITE_SENDER_EMAIL || 'Ini by Maya Couture <orders@inibymaya.com>';

    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        from: fromAddress,
        to: Array.isArray(to) ? to : [to],
        subject: subject,
        html: html,
        reply_to: replyTo || 'care@inibymaya.com'
      })
    });

    const data = await resendResponse.json();

    if (!resendResponse.ok) {
      console.error('❌ Resend API Error Response:', data);
      return res.status(resendResponse.status).json({ error: data });
    }

    console.log('✅ Resend Email Dispatched Successfully:', data.id);
    return res.status(200).json({ success: true, id: data.id });
  } catch (err) {
    console.error('❌ Network/Serverless Exception:', err.message || err);
    return res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
}
