import { Session, User } from "better-auth/types";
import { auth } from "~/lib/auth";
import { headers } from "next/headers";

export async function getCurrentUser(): Promise<{
  user: User;
  session: Session;
} | null> {
  const headersList = await headers();

  const session = await auth.api.getSession({
    headers: headersList,
  });

  return session;
}
