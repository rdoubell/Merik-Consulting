import "server-only";
import { prisma } from "@/lib/prisma";
import type { NotificationChannel } from "@/generated/prisma";

/**
 * Notifier abstraction. The default implementation below just records
 * messages to the `Notification` table (surfaced in a dev panel) instead of
 * calling a real provider. To go live, implement `send` against a real
 * provider (Twilio for SMS/WhatsApp, an email API like Resend, etc.) and
 * swap the export at the bottom of this file — nothing else in the app
 * needs to change since callers only depend on this interface.
 */
export interface Notifier {
  send(input: {
    userId?: string;
    channel: NotificationChannel;
    toAddress: string;
    subject?: string;
    body: string;
    meta?: Record<string, unknown>;
  }): Promise<void>;
}

class DevNotifier implements Notifier {
  async send(input: {
    userId?: string;
    channel: NotificationChannel;
    toAddress: string;
    subject?: string;
    body: string;
    meta?: Record<string, unknown>;
  }) {
    await prisma.notification.create({
      data: {
        userId: input.userId,
        channel: input.channel,
        toAddress: input.toAddress,
        subject: input.subject,
        body: input.body,
        meta: input.meta ? JSON.stringify(input.meta) : null,
      },
    });
  }
}

export const notifier: Notifier = new DevNotifier();
