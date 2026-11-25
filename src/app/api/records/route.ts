import { z, ZodError } from "zod";

import { auth } from "@/server/auth";
import { DataError, deleteRow, listRows, saveRow } from "@/server/modules/data/service";

export const runtime = "nodejs";

const tableName = z.enum(["students", "lessons", "assessments", "transactions"]);

async function owner(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session || !z.uuid().safeParse(session.user.id).success) {
    throw new DataError("Sessão inválida ou expirada.", 401);
  }
  return session.user.id;
}

function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) throw new DataError("Origem inválida.", 403);
}

function failure(error: unknown) {
  if (error instanceof DataError) return Response.json({ error: error.message }, { status: error.status });
  if (error instanceof ZodError) return Response.json({ error: "Dados inválidos.", details: error.issues }, { status: 400 });
  console.error("Falha na API de registros:", error);
  return Response.json({ error: "Não foi possível processar a solicitação." }, { status: 500 });
}

export async function GET(request: Request) {
  try {
    const userId = await owner(request);
    const table = tableName.parse(new URL(request.url).searchParams.get("table"));
    return Response.json(await listRows(table, userId));
  } catch (error) { return failure(error); }
}

export async function POST(request: Request) {
  try {
    sameOrigin(request);
    const userId = await owner(request);
    const body = z.object({ table: tableName, values: z.unknown() }).strict().parse(await request.json());
    return Response.json(await saveRow(body.table, userId, body.values), { status: 201 });
  } catch (error) { return failure(error); }
}

export async function PATCH(request: Request) {
  try {
    sameOrigin(request);
    const userId = await owner(request);
    const body = z.object({ table: tableName, id: z.uuid(), values: z.unknown() }).strict().parse(await request.json());
    return Response.json(await saveRow(body.table, userId, body.values, body.id));
  } catch (error) { return failure(error); }
}

export async function DELETE(request: Request) {
  try {
    sameOrigin(request);
    const userId = await owner(request);
    const body = z.object({ table: tableName, id: z.uuid() }).strict().parse(await request.json());
    await deleteRow(body.table, userId, body.id);
    return new Response(null, { status: 204 });
  } catch (error) { return failure(error); }
}
