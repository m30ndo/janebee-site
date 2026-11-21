import "server-only";
import webpush from "web-push";

/**
 * Phone notifications for the installed app (Web Push). Needs
 * NEXT_PUBLIC_VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY and VAPID_SUBJECT
 * (mailto:…). Make a key pair once with `npx web-push generate-vapid-keys`.
 */
export const pushConfigured = () => !!(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY);

type Sub = { endpoint: string; p256dh: string; auth: string };

/** Sends to every subscription; returns the endpoints that are gone (to delete). */
export async function sendPush(subs: Sub[], note: { title: string; body: string; url: string }) {
  if (!pushConfigured()) return { sent: 0, gone: [] as string[] };
  webpush.setVapidDetails(process.env.VAPID_SUBJECT || "mailto:hello@janebee.co.uk", process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!, process.env.VAPID_PRIVATE_KEY!);
  const payload = JSON.stringify(note);
  let sent = 0;
  const gone: string[] = [];
  await Promise.all(
    subs.map(async (s) => {
      try {
        await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, payload, { TTL: 60 * 60 * 24 * 3 });
        sent++;
      } catch (e) {
        const code = (e as { statusCode?: number }).statusCode;
        if (code === 404 || code === 410) gone.push(s.endpoint);
      }
    }),
  );
  return { sent, gone };
}
