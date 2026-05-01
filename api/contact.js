export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { name, email, message, website, serviceTier } = req.body || {};

  if (website) return res.status(200).json({ success: true });

  // 1. Basic Validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!name || !email || !message || !emailRegex.test(email)) {
    return res.status(400).json({ success: false, message: "Invalid input or email format." });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const inboxEmail = process.env.CONTACT_TO_EMAIL || "olajameze.jg@googlemail.com"; // Your personal inbox
  const fromEmail = process.env.RESEND_FROM_EMAIL || "hello@jgdev.co.uk"; // Must be a verified domain in Resend

  if (!apiKey) {
    console.error("Missing RESEND_API_KEY");
    return res.status(500).json({ success: false, message: "Server configuration error." });
  }

  try {
    // Email to you (owner)
    const ownerRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `James Gomez Portfolio <${fromEmail}>`,
        to: inboxEmail,
        reply_to: email,
        subject: `New message from ${name}`,
        html: `
          <h2>New Contact Message</h2>
          <p><b>Name:</b> ${name}</p>
          <p><b>Email:</b> ${email}</p>
          <p><b>Service Tier:</b> ${serviceTier || "Not selected"}</p>
          <p><b>Message:</b> ${message}</p>
        `,
      }),
    });

    if (!ownerRes.ok) {
      const errorText = await ownerRes.text();
      console.error(`Resend API Error (Owner Email): ${ownerRes.status}`, errorText);
      return res.status(500).json({ success: false, error: errorText });
    }

    // Auto-reply to client (optional – you can mention the selected tier)
    const autoRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `James Gomez <${fromEmail}>`,
        to: email,
        subject: "Received your project request!",
        html: `
          <div style="font-family: 'Inter', -apple-system, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
            <div style="background-color: #1a202c; padding: 32px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px;">JGDev</h1>
            </div>
            <div style="padding: 40px; color: #1e293b;">
              <h2 style="font-size: 20px; font-weight: 700; margin-top: 0; color: #0f172a;">Thanks for reaching out, ${name}!</h2>
              <p style="font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
                I've successfully received your enquiry regarding the <strong>${serviceTier || "web project"}</strong>.
              </p>
              <p style="font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
                I'll review your details and get back to you personally within the next 24–48 hours to discuss how we can bring your project to life.
              </p>
              <div style="padding: 20px; background-color: #f8fafc; border-radius: 8px; border-left: 4px solid #2563eb; margin-bottom: 24px;">
                <p style="margin: 0; font-size: 14px; font-style: italic; color: #475569;">
                  "High-performance web solutions that grow your business."
                </p>
              </div>
              <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 32px 0;" />
              <p style="font-size: 14px; color: #64748b; margin-bottom: 8px;">Best regards,</p>
              <p style="font-size: 16px; font-weight: 600; color: #0f172a; margin: 0;">James Gomez</p>
              <p style="font-size: 14px; color: #64748b; margin: 4px 0 0 0;">Front-End Developer | jgdev.co.uk</p>
            </div>
            <div style="background-color: #f1f5f9; padding: 24px; text-align: center; font-size: 12px; color: #94a3b8;">
              © 2026 JGDev. All rights reserved.
            </div>
          </div>
        `,
      }),
    });

    if (!autoRes.ok) {
      const errorText = await autoRes.text();
      console.error(`Resend API Error (Auto-reply): ${autoRes.status}`, errorText);
      // Don't fail the whole request
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Internal Server Error during email dispatch:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
}