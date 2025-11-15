"use server";

import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";

export async function syncUser() {
  const user = await currentUser();
  if (!user) return null;

  const existing = await db.user.findUnique({
    where: { clerkUserId: user.id },
  });

  if (!existing) {
    await db.user.create({
      data: {
        clerkUserId: user.id,
        email: user.emailAddresses[0].emailAddress,
        name: user.fullName,
      },
    });
  }

  return user.id;
}
