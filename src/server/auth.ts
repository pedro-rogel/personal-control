import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { betterAuth } from "better-auth";
import { randomUUID } from "node:crypto";

import { db } from "@/server/db/client";
import * as authSchema from "@/server/modules/auth/schema";

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg", schema: authSchema }),
  emailAndPassword: { enabled: true },
  advanced: { database: { generateId: () => randomUUID() } },
});
