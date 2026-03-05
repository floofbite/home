"use server";

import { signOut } from "@/app/logto";

export async function signOutAction() {
  await signOut();
}
