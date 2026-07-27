/**
 * Server-only transactional email, via Resend's HTTP API.
 *
 * Deliberately dependency-free — a single `fetch` to https://api.resend.com/emails
 * is all Resend needs, so there's no SDK to keep up to date.
 *
 * Env vars (see README → "RSVP confirmation emails"):
 *   RESEND_API_KEY   — from https://resend.com/api-keys
 *   RSVP_FROM_EMAIL  — e.g. "Katie & Matty <rsvp@your-domain.co.uk>". The domain
 *                      must be verified in Resend, otherwise sends are rejected.
 *   RSVP_BCC_EMAIL   — optional; blind-copies the couple on every confirmation.
 *
 * Degrades quietly: with no API key configured nothing is sent and `sent: false`
 * is returned. Email must never be the reason an RSVP fails, so callers should
 * treat a failure here as non-fatal.
 */

const RESEND_ENDPOINT = "https://api.resend.com/emails";

export type SendResult = { sent: boolean; skipped?: boolean; error?: string };

export async function sendEmail({
  to,
  subject,
  text,
}: {
  to: string;
  subject: string;
  text: string;
}): Promise<SendResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RSVP_FROM_EMAIL;
  const bcc = process.env.RSVP_BCC_EMAIL;

  if (!apiKey || !from) {
    return { sent: false, skipped: true };
  }

  try {
    const res = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        ...(bcc ? { bcc: [bcc] } : {}),
        subject,
        text,
      }),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      return { sent: false, error: `${res.status} ${detail}`.trim() };
    }
    return { sent: true };
  } catch (err) {
    return { sent: false, error: (err as Error).message };
  }
}
