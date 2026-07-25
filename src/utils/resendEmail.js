/**
 * Resend Email Notification System — InibyMaya Luxury Apparel
 * Handles automated email dispatch for:
 * 1. Order Confirmation (Customer & Admin)
 * 2. Order Shipped Notification with Delhivery Tracking (Customer)
 * 3. Order Delivered & Review / Testimonial Request (Customer)
 * 4. Order Cancellation Notice (Customer & Admin)
 * 5. Bespoke Stitching Progress Update (Customer)
 */

const RESEND_API_KEY = import.meta.env.VITE_RESEND_API_KEY || '';
const SENDER_EMAIL = import.meta.env.VITE_SENDER_EMAIL || 'Ini by Maya Couture <orders@inibymaya.com>';
const SENDER_FALLBACK = 'Ini by Maya Couture <onboarding@resend.dev>';
const ADMIN_EMAILS = ['care@inibymaya.com', 'tharanichandrasekaran2000@gmail.com'];

/**
 * Core HTTP Dispatcher to Resend REST API
 */
async function sendResendEmail({ to, subject, html, replyTo }) {
  if (!to || (Array.isArray(to) && to.length === 0)) return;

  const apiKey = RESEND_API_KEY;
  const fromAddress = apiKey.includes('re_') && !apiKey.startsWith('re_dummy') ? SENDER_EMAIL : SENDER_FALLBACK;

  // Log in development/testing mode if API key is unconfigured
  if (!apiKey || apiKey === 're_placeholder') {
    console.log(`✉️ [Resend Simulation] Subject: "${subject}" | To: ${Array.isArray(to) ? to.join(', ') : to}`);
    return { success: true, simulated: true };
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
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

    const data = await response.json();
    if (!response.ok) {
      console.warn('⚠️ [Resend API Notice]:', data.message || data);
      return { success: false, error: data };
    }

    console.log('✅ [Resend Email Sent]:', data.id);
    return { success: true, id: data.id };
  } catch (err) {
    console.error('❌ [Resend Network Exception]:', err.message || err);
    return { success: false, error: err };
  }
}

/**
 * Shared Luxury Email Layout Generator
 */
function wrapLuxuryEmailTemplate(contentHtml, title = 'Ini by Maya Couture') {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f8f6f2; margin: 0; padding: 0; color: #1a1a1a; }
    .email-wrapper { max-width: 620px; margin: 20px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.06); border: 1px solid #eae5dc; }
    .email-header { background-color: #0f0f0f; color: #ffffff; text-align: center; padding: 32px 20px; }
    .email-header h1 { font-family: 'Georgia', serif; font-size: 26px; font-weight: 400; letter-spacing: 3px; margin: 0 0 6px 0; color: #ffffff; text-transform: uppercase; }
    .email-header p { font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: #d4af37; margin: 0; }
    .email-body { padding: 36px 32px; }
    .email-footer { background-color: #f4f0e8; text-align: center; padding: 24px 20px; font-size: 12px; color: #666666; border-top: 1px solid #eae5dc; }
    .email-footer a { color: #8b0000; text-decoration: none; font-weight: 600; }
    .btn-gold { display: inline-block; background-color: #8b0000; color: #ffffff !important; padding: 14px 28px; border-radius: 6px; text-decoration: none; font-size: 14px; font-weight: 600; letter-spacing: 1px; margin: 16px 0; text-transform: uppercase; }
    .item-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    .item-table th { text-align: left; padding: 10px; border-bottom: 2px solid #1a1a1a; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #555; }
    .item-table td { padding: 14px 10px; border-bottom: 1px solid #eeeeee; font-size: 13.5px; }
    .badge-custom { background-color: #fff4e5; color: #b45309; padding: 3px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; border: 1px solid #fed7aa; }
    .box-callout { background-color: #fdfbf7; border: 1px solid #e8dfd1; padding: 18px; border-radius: 8px; margin: 20px 0; }
    .tracking-box { background-color: #0f0f0f; color: #ffffff; padding: 20px; border-radius: 8px; text-align: center; margin: 24px 0; }
    .tracking-box h3 { margin: 0 0 8px 0; font-size: 14px; color: #d4af37; text-transform: uppercase; letter-spacing: 1px; }
    .tracking-code { font-family: monospace; font-size: 20px; letter-spacing: 2px; color: #ffffff; margin: 6px 0; font-weight: bold; }
  </style>
</head>
<body>
  <div className="email-wrapper">
    <div className="email-header">
      <h1>INI BY MAYA</h1>
      <p>Bespoke Couture & Handcrafted Apparel</p>
    </div>
    <div className="email-body">
      ${contentHtml}
    </div>
    <div className="email-footer">
      <p>© ${new Date().getFullYear()} Ini by Maya. All rights reserved.</p>
      <p>Questions? Contact Couture Care at <a href="mailto:care@inibymaya.com">care@inibymaya.com</a></p>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * 1. ORDER CONFIRMATION EMAIL (Customer & Admin)
 */
export async function sendOrderConfirmationEmail(order) {
  if (!order || !order.shippingDetails?.email) return;

  const customerName = order.shippingDetails.name || 'Valued Patron';
  const customerEmail = order.shippingDetails.email;
  const isCustomStitched = order.items?.some(i => i.wantsCustomStitching);

  const itemsHtml = (order.items || []).map(item => `
    <tr>
      <td>
        <strong>${item.title}</strong><br>
        <span style="color:#666; font-size:12px;">Size: ${item.selectedSize} ${item.wantsCustomStitching ? '<span class="badge-custom">Bespoke Custom Stitching</span>' : ''}</span>
      </td>
      <td style="text-align:center;">${item.quantity}</td>
      <td style="text-align:right;">₹${(item.price * item.quantity).toLocaleString('en-IN')}</td>
    </tr>
  `).join('');

  const customerContent = `
    <h2 style="font-family:'Georgia',serif; color:#8b0000; margin-top:0;">Thank You for Your Order, ${customerName}! ✨</h2>
    <p style="font-size:14px; color:#444; line-height:1.6;">We have received your order <strong>#${order.id}</strong>. Our artisans are reviewing your order specifications with utmost care.</p>
    
    ${isCustomStitched ? `
      <div class="box-callout">
        <h4 style="margin:0 0 6px 0; color:#8b0000;">✂️ Custom Tailoring Note</h4>
        <p style="margin:0; font-size:13px; color:#555;">Your order includes bespoke stitching. Our master patternmakers will review your exact bust, waist, hip, and length measurements.</p>
      </div>
    ` : ''}

    <table class="item-table">
      <thead>
        <tr>
          <th>Item Details</th>
          <th style="text-align:center;">Qty</th>
          <th style="text-align:right;">Price</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
    </table>

    <div style="background-color:#f9f9f9; padding:16px; border-radius:6px; margin-top:20px;">
      <div style="display:flex; justify-content:space-between; margin-bottom:6px; font-size:13px;">
        <span>Subtotal:</span>
        <span>₹${(order.subtotal || 0).toLocaleString('en-IN')}</span>
      </div>
      ${order.discount ? `
        <div style="display:flex; justify-content:space-between; margin-bottom:6px; font-size:13px; color:#059669;">
          <span>Discount Savings:</span>
          <span>-₹${order.discount.toLocaleString('en-IN')}</span>
        </div>
      ` : ''}
      <div style="display:flex; justify-content:space-between; margin-bottom:6px; font-size:13px;">
        <span>Shipping Fee:</span>
        <span>${order.shippingFee === 0 ? 'FREE' : `₹${order.shippingFee}`}</span>
      </div>
      <hr style="border:none; border-top:1px solid #ddd; margin:10px 0;">
      <div style="display:flex; justify-content:space-between; font-size:16px; font-weight:bold; color:#8b0000;">
        <span>Total Paid/COD Amount:</span>
        <span>₹${(order.total || 0).toLocaleString('en-IN')}</span>
      </div>
    </div>

    <div style="margin-top:24px; font-size:13.5px; color:#444;">
      <h4 style="margin:0 0 6px 0; font-size:14px; text-transform:uppercase; letter-spacing:1px;">Shipping Destination:</h4>
      <p style="margin:0; line-height:1.5;">
        ${order.shippingDetails.name}<br>
        ${order.shippingDetails.address}<br>
        ${order.shippingDetails.city}, ${order.shippingDetails.state || ''} - ${order.shippingDetails.pinCode}<br>
        Phone: ${order.shippingDetails.phone}
      </p>
    </div>

    <div style="text-align:center; margin-top:30px;">
      <a href="https://iniby-maya.vercel.app" class="btn-gold">View Order Status on Customer Portal</a>
    </div>
  `;

  // Send to Customer
  await sendResendEmail({
    to: customerEmail,
    subject: `✨ Order Confirmation #${order.id} — Ini by Maya Couture`,
    html: wrapLuxuryEmailTemplate(customerContent, `Order #${order.id} Confirmation`)
  });

  // Admin Notification Email
  const adminContent = `
    <h2 style="font-family:'Georgia',serif; color:#8b0000; margin-top:0;">🚨 New Order Alert #${order.id}</h2>
    <p style="font-size:14px; color:#444;">A new order was placed by <strong>${customerName}</strong> (${customerEmail}).</p>
    <table class="item-table">
      <thead>
        <tr><th>Item</th><th>Qty</th><th style="text-align:right;">Total</th></tr>
      </thead>
      <tbody>${itemsHtml}</tbody>
    </table>
    <p><strong>Total Value:</strong> ₹${(order.total || 0).toLocaleString('en-IN')} (${order.paymentId || 'COD'})</p>
    <a href="https://iniby-maya.vercel.app" class="btn-gold">Open Admin Console</a>
  `;

  await sendResendEmail({
    to: ADMIN_EMAILS,
    subject: `🚨 New Order Received #${order.id} (₹${(order.total || 0).toLocaleString('en-IN')})`,
    html: wrapLuxuryEmailTemplate(adminContent, `New Order #${order.id}`)
  });
}

/**
 * 2. ORDER SHIPPED EMAIL WITH DELHIVERY TRACKING (Customer)
 */
export async function sendOrderShippedEmail(order, trackingNum = '') {
  if (!order || !order.shippingDetails?.email) return;

  const customerName = order.shippingDetails.name || 'Valued Patron';
  const trackingNumber = trackingNum || order.trackingNumber || 'DELHIVERY-PENDING';
  const trackingUrl = `https://www.delhivery.com/track/package/${trackingNumber}`;

  const shippedContent = `
    <h2 style="font-family:'Georgia',serif; color:#8b0000; margin-top:0;">Your Couture Piece Has Been Shipped! 🚚</h2>
    <p style="font-size:14px; color:#444; line-height:1.6;">Good news, <strong>${customerName}</strong>! Your order <strong>#${order.id}</strong> has passed final quality inspection and is on its way to you.</p>

    <div class="tracking-box">
      <h3>Delhivery Express Tracking Number</h3>
      <div class="tracking-code">${trackingNumber}</div>
      <p style="margin:8px 0 0 0; font-size:12px; color:#aaa;">Shipped via Delhivery Express Courier</p>
    </div>

    <div style="text-align:center; margin:24px 0;">
      <a href="${trackingUrl}" target="_blank" class="btn-gold">Track Live Shipment on Delhivery</a>
    </div>

    <p style="font-size:13px; color:#666; text-align:center;">Estimated Delivery: 3 to 5 business days.</p>
  `;

  await sendResendEmail({
    to: order.shippingDetails.email,
    subject: `🚚 Your Order #${order.id} Has Been Shipped! — Ini by Maya`,
    html: wrapLuxuryEmailTemplate(shippedContent, `Order #${order.id} Shipped`)
  });
}

/**
 * 3. ORDER DELIVERED & FEEDBACK / TESTIMONIAL EMAIL (Customer)
 */
export async function sendOrderDeliveredEmail(order) {
  if (!order || !order.shippingDetails?.email) return;

  const customerName = order.shippingDetails.name || 'Valued Patron';

  const deliveredContent = `
    <h2 style="font-family:'Georgia',serif; color:#8b0000; margin-top:0;">Your Package Has Been Delivered! ✨</h2>
    <p style="font-size:14px; color:#444; line-height:1.6;">Dear <strong>${customerName}</strong>, your order <strong>#${order.id}</strong> has been successfully delivered to your shipping address.</p>

    <div class="box-callout" style="text-align:center; background-color:#fffdfa; border-color:#d4af37;">
      <h3 style="font-family:'Georgia',serif; color:#8b0000; margin:0 0 10px 0;">Share Your Experience & Win Couture Rewards</h3>
      <p style="font-size:13.5px; color:#555; line-height:1.6; margin:0 0 16px 0;">
        We hope you fall in love with the weight, silhouette, and detailing of your new piece. We would be honored to feature your story and photograph in <em>"What Our Patrons Say"</em>!
      </p>
      <a href="https://iniby-maya.vercel.app" class="btn-gold">Share Review & Story</a>
    </div>

    <p style="font-size:13px; color:#666; text-align:center; margin-top:20px;">If you require any size adjustments or fit guidance, our team is always at your service.</p>
  `;

  await sendResendEmail({
    to: order.shippingDetails.email,
    subject: `✨ Order Delivered! How was your experience with Order #${order.id}? — Ini by Maya`,
    html: wrapLuxuryEmailTemplate(deliveredContent, `Order #${order.id} Delivered`)
  });
}

/**
 * 4. ORDER CANCELLED EMAIL (Customer & Admin)
 */
export async function sendOrderCancelledEmail(order) {
  if (!order || !order.shippingDetails?.email) return;

  const customerName = order.shippingDetails.name || 'Valued Patron';

  const cancelledContent = `
    <h2 style="font-family:'Georgia',serif; color:#dc2626; margin-top:0;">Order Cancellation Notice — #${order.id}</h2>
    <p style="font-size:14px; color:#444; line-height:1.6;">Dear <strong>${customerName}</strong>, your order <strong>#${order.id}</strong> has been cancelled.</p>
    <p style="font-size:13.5px; color:#666;">If you have any questions or wish to replace your order, please reach out to Couture Care at <a href="mailto:care@inibymaya.com" style="color:#8b0000; font-weight:bold;">care@inibymaya.com</a>.</p>
  `;

  // Send to Customer
  await sendResendEmail({
    to: order.shippingDetails.email,
    subject: `Order Cancellation Notice #${order.id} — Ini by Maya`,
    html: wrapLuxuryEmailTemplate(cancelledContent, `Order #${order.id} Cancelled`)
  });

  // Admin Alert
  await sendResendEmail({
    to: ADMIN_EMAILS,
    subject: `⚠️ Order #${order.id} Cancelled by ${customerName}`,
    html: wrapLuxuryEmailTemplate(`<h3>Order #${order.id} Cancelled</h3><p>Order #${order.id} by ${customerName} was marked as Cancelled.</p>`, `Order #${order.id} Cancelled`)
  });
}

/**
 * 5. BESPOKE TAILORING PROGRESS EMAIL (Customer)
 */
export async function sendStitchingProgressEmail(order, statusName) {
  if (!order || !order.shippingDetails?.email) return;

  const customerName = order.shippingDetails.name || 'Valued Patron';

  const progressContent = `
    <h2 style="font-family:'Georgia',serif; color:#8b0000; margin-top:0;">Your Master Tailoring Update ✂️</h2>
    <p style="font-size:14px; color:#444; line-height:1.6;">Dear <strong>${customerName}</strong>, your custom order <strong>#${order.id}</strong> is progressing beautifully.</p>

    <div class="box-callout" style="text-align:center;">
      <h3 style="margin:0 0 6px 0; color:#8b0000;">Current Atelier Stage: ${statusName}</h3>
      <p style="margin:0; font-size:13px; color:#555;">Our master craftsmen are drafting your custom patterns and executing hand-finishing for exact posture and measurements.</p>
    </div>

    <div style="text-align:center; margin-top:20px;">
      <a href="https://iniby-maya.vercel.app" class="btn-gold">Track Atelier Progress</a>
    </div>
  `;

  await sendResendEmail({
    to: order.shippingDetails.email,
    subject: `✂️ Atelier Progress: Order #${order.id} is now in ${statusName} — Ini by Maya`,
    html: wrapLuxuryEmailTemplate(progressContent, `Order #${order.id} Atelier Update`)
  });
}
