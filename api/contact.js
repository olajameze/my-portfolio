const MAX_IMAGE_COUNT = 5;
const MAX_IMAGE_BYTES = 3 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png"]);
const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character]);
}

function validateAttachments(input) {
  if (input === undefined) return { attachments: [], error: null };
  if (!Array.isArray(input)) return { attachments: [], error: "Images must be uploaded as a list." };
  if (input.length > MAX_IMAGE_COUNT) {
    return { attachments: [], error: `Choose no more than ${MAX_IMAGE_COUNT} images.` };
  }

  const attachments = [];
  let totalBytes = 0;

  for (const [index, file] of input.entries()) {
    if (!file || typeof file.filename !== "string" || typeof file.content !== "string") {
      return { attachments: [], error: "One of the selected images could not be read." };
    }
    if (!ALLOWED_IMAGE_TYPES.has(file.contentType)) {
      return { attachments: [], error: "Only JPEG and PNG images are accepted." };
    }
    if (!/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(file.content)) {
      return { attachments: [], error: "One of the selected images has invalid file data." };
    }

    const content = Buffer.from(file.content, "base64");
    if (!content.length || content.toString("base64") !== file.content) {
      return { attachments: [], error: "One of the selected images has invalid file data." };
    }

    const hasValidSignature = file.contentType === "image/jpeg"
      ? content[0] === 0xff && content[1] === 0xd8 && content[2] === 0xff
      : content.length >= PNG_SIGNATURE.length && content.subarray(0, PNG_SIGNATURE.length).equals(PNG_SIGNATURE);
    if (!hasValidSignature) {
      return { attachments: [], error: "A selected file does not match its image type." };
    }

    totalBytes += content.length;
    if (totalBytes > MAX_IMAGE_BYTES) {
      return { attachments: [], error: "Images must be no more than 3 MB combined." };
    }

    const filename = file.filename
      .replace(/[\\/\u0000-\u001f\u007f]/g, "_")
      .slice(0, 120) || `image-${index + 1}`;
    attachments.push({ filename, content: file.content });
  }

  return { attachments, error: null };
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const {
    name,
    email,
    message,
    website,
    serviceTier,
    businessName = "",
    businessInfo = "",
    currentWebsite = "",
    brandColors = "",
    attachments: attachmentInput,
  } = req.body || {};

  if (website) return res.status(200).json({ success: true });

  // 1. Basic Validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (
    typeof name !== "string"
    || typeof email !== "string"
    || typeof message !== "string"
    || !name.trim()
    || !emailRegex.test(email)
    || !message.trim()
    || name.length > 160
    || email.length > 320
    || message.length > 5000
    || typeof businessName !== "string"
    || businessName.length > 160
    || typeof businessInfo !== "string"
    || businessInfo.length > 2000
    || typeof currentWebsite !== "string"
    || currentWebsite.length > 500
    || typeof brandColors !== "string"
    || brandColors.length > 1000
  ) {
    return res.status(400).json({ success: false, message: "Invalid input or email format." });
  }

  if (currentWebsite) {
    try {
      const parsedWebsite = new URL(currentWebsite);
      if (!["http:", "https:"].includes(parsedWebsite.protocol)) throw new Error("Unsupported website protocol.");
    } catch {
      return res.status(400).json({ success: false, message: "Enter a valid website URL." });
    }
  }

  const validatedAttachments = validateAttachments(attachmentInput);
  if (validatedAttachments.error) {
    return res.status(400).json({ success: false, message: validatedAttachments.error });
  }

  const safeName = escapeHtml(name.trim());
  const safeEmail = escapeHtml(email.trim());
  const safeTier = escapeHtml(typeof serviceTier === "string" ? serviceTier : "");
  const safeBusinessName = escapeHtml(businessName.trim());
  const safeBusinessInfo = escapeHtml(businessInfo.trim());
  const safeWebsite = escapeHtml(currentWebsite.trim());
  const safeBrandColors = escapeHtml(brandColors.trim());
  const safeMessage = escapeHtml(message.trim()).replace(/\r?\n/g, "<br>");
  const safeSubjectName = name.trim().replace(/[\r\n]+/g, " ").slice(0, 100);

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
        reply_to: email.trim(),
        subject: `New project request from ${safeSubjectName}`,
        html: `
          <h2>New project request</h2>
          <p><b>Name:</b> ${safeName}</p>
          <p><b>Email:</b> ${safeEmail}</p>
          <p><b>Business name:</b> ${safeBusinessName || "Not provided"}</p>
          <p><b>Business details:</b> ${safeBusinessInfo || "Not provided"}</p>
          <p><b>Current website:</b> ${safeWebsite || "Not provided"}</p>
          <p><b>Colours or visual references:</b> ${safeBrandColors || "Not provided"}</p>
          <p><b>Service tier:</b> ${safeTier || "Not selected"}</p>
          <p><b>Project details:</b><br>${safeMessage}</p>
          <p><b>Images attached:</b> ${validatedAttachments.attachments.length}</p>
        `,
        ...(validatedAttachments.attachments.length
          ? { attachments: validatedAttachments.attachments }
          : {}),
      }),
    });

    if (!ownerRes.ok) {
      const errorText = await ownerRes.text();
      console.error(`Resend API Error (Owner Email): ${ownerRes.status}`, errorText);
      return res.status(500).json({ success: false, error: errorText });
    }

    // Send the customer an acknowledgement.
    const autoRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `James Gomez <${fromEmail}>`,
        to: email.trim(),
        subject: "Received your project request!",
        html: `
          <div style="font-family: 'Inter', -apple-system, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
            <div style="background-color: #1a202c; padding: 32px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px;">JGDev</h1>
            </div>
            <div style="padding: 40px; color: #1e293b;">
              <h2 style="font-size: 20px; font-weight: 700; margin-top: 0; color: #0f172a;">Thanks for reaching out, ${safeName}!</h2>
              <p style="font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
                I've received your enquiry regarding the <strong>${safeTier || "web project"}</strong>.
              </p>
              <p style="font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
                I'll review your project details and reply within 24 to 48 hours.
              </p>
              <div style="padding: 20px; background-color: #f8fafc; border-radius: 8px; border-left: 4px solid #2563eb; margin-bottom: 24px;">
                <p style="margin: 0; font-size: 14px; font-style: italic; color: #475569;">
                  "Websites and web apps, made for your business."
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