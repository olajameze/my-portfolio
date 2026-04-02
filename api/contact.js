export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { name, email, message, website } = req.body || {};

  if (website) {
    return res.status(200).json({ success: true });
  }

  if (!name || !email || !message) {
    return res.status(400).json({ success: false });
  }

  // ✅ HARDCODE your verified domain address
  const apiKey = process.env.RESEND_API_KEY;
  const inboxEmail = process.env.CONTACT_TO_EMAIL || "olajameze.jg@googlemail.com";
  const fromEmail = process.env.RESEND_FROM_EMAIL || "hello@jgdev.co.uk";  // Must be on your verified domain
  const autoReplyFromEmail = fromEmail;

  if (!apiKey) {
    console.error("Missing RESEND_API_KEY");
    return res.status(500).json({ success: false });
  }

  try {
    // Send to owner
    const ownerRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: inboxEmail,
        reply_to: email,
        subject: `New message from ${name}`,
        html: `<h2>New Contact Message</h2><p><b>Name:</b> ${name}</p><p><b>Email:</b> ${email}</p><p><b>Message:</b> ${message}</p>`,
      }),
    });

    if (!ownerRes.ok) {
      const errorText = await ownerRes.text();
      console.error("Owner email failed:", ownerRes.status, errorText);
      return res.status(500).json({ success: false, error: errorText });
    }

    // Auto-reply to client
    const autoRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: autoReplyFromEmail,
        to: email,
        subject: "Thanks for your message!",
        html: `<h2>Thanks for reaching out</h2><p>Hi ${name},</p><p>I’ve received your message and will respond shortly.</p><br/><p>— James</p>`,
      }),
    });

    if (!autoRes.ok) {
      const errorText = await autoRes.text();
      console.error("Auto-reply failed:", autoRes.status, errorText);
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Unexpected error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
}