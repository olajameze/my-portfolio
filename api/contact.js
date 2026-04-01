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

  if (!apiKey) {
    return res.status(500).json({ success: false });
  }

  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Portfolio <onboarding@resend.dev>",
        to: inboxEmail,
        subject: `New message from ${name}`,
        html: `
          <h2>New Contact Message</h2>
          <p><b>Name:</b> ${name}</p>
          <p><b>Email:</b> ${email}</p>
          <p><b>Message:</b> ${message}</p>
        `,
      }),
    });

    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Your Portfolio <onboarding@resend.dev>",
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

    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false });
  }
}
