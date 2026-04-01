export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { name, email, message, website } = req.body || {};

  // Honeypot spam check
  if (website) {
    return res.status(200).json({ success: true });
  }

  if (!name || !email || !message) {
    return res.status(400).json({ success: false });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const inboxEmail = process.env.CONTACT_TO_EMAIL || "YOUR_EMAIL@gmail.com";
  const fromEmail = process.env.RESEND_FROM_EMAIL || "Portfolio <onboarding@resend.dev>";
  const autoReplyFromEmail =
    process.env.RESEND_AUTOREPLY_FROM_EMAIL || fromEmail;

  if (!apiKey) {
    return res.status(500).json({ success: false });
  }

  try {
    const ownerEmailRes = await fetch("https://api.resend.com/emails", {
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
        html: `
          <h2>New Contact Message</h2>
          <p><b>Name:</b> ${name}</p>
          <p><b>Email:</b> ${email}</p>
          <p><b>Message:</b> ${message}</p>
        `,
      }),
    });

    const autoReplyRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: autoReplyFromEmail,
        to: email,
        subject: "Thanks for your message!",
        html: `
          <h2>Thanks for reaching out</h2>
          <p>Hi ${name},</p>
          <p>I’ve received your message and will respond shortly.</p>
          <br/>
          <p>— James</p>
        `,
      }),
    });

    if (!ownerEmailRes.ok || !autoReplyRes.ok) {
      return res.status(500).json({ success: false });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false });
  }
}
