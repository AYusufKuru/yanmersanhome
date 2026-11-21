import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaClient } from "@/generated/prisma/client";

function connectionClosed(error: unknown) {
  if (!error || typeof error !== "object") {
    return false;
  }
  if ("code" in error && error.code === "P1017") {
    return true;
  }
  const message =
    "message" in error && typeof error.message === "string"
      ? error.message
      : "";
  return (
    message.includes("closed the connection") ||
    message.includes("Connection terminated")
  );
}

function createPrisma() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL tanımlı değil.");
  }

  const host = new URL(connectionString).hostname;
  const pool = new Pool({
    connectionString,
    max: host === "localhost" || host === "127.0.0.1" ? 1 : 10,
  });
  const client = new PrismaClient({
    adapter: new PrismaPg(pool),
  });

  return client.$extends({
    query: {
      $allModels: {
        async $allOperations({ args, query }) {
          try {
            return await query(args);
          } catch (error) {
            if (!connectionClosed(error)) {
              throw error;
            }
            return query(args);
          }
        },
      },
    },
  });
}

const globalForPrisma = globalThis as unknown as {
  prisma?: ReturnType<typeof createPrisma>;
};

export const prisma = globalForPrisma.prisma ?? createPrisma();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
