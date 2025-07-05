// app/api/highlight/update/route.ts
import PdfStorage from "../../../utils/pdfStorage";
import { storageMethod } from "../../../utils/env";
import {
  deleteHighlight as supabaseDeleteHighlight,
  saveBulkHighlights as supabaseSaveBulkHighlights,
  saveHighlight as supabaseSaveHighlight,
} from "../../../utils/supabase";
import { StorageMethod, StoredHighlight } from "../../../utils/types";

async function handleRequest(
  req: Request,
  action: (body: any, db?: PdfStorage) => Promise<void>
): Promise<Response> {
  let db: PdfStorage | undefined;
  try {
    const body = await req.json();
    if (storageMethod === StorageMethod.sqlite) {
      db = new PdfStorage();
    }
    await action(body, db);
    return new Response(null, { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(null, { status: 500 });
  } finally {
    if (db) {
      await db.close();
    }
  }
}

async function savePdfs(body: any, db?: PdfStorage): Promise<void> {
  if (db) {
    if (Array.isArray(body.pdfs)) {
      await db.saveBulkPdfs(body.pdfs);
    } else {
      await db.savePdf(body.pdfs);
    }
  } else {
    /*if (Array.isArray(body)) {
      await supabaseSaveBulkHighlights(ensureKeywords(body));
    } else {
      await supabaseSaveHighlight(ensureKeyword(body));
    }*/
  }
}

async function deletePdf(
  body: any,
  db?: PdfStorage
): Promise<void> {
  if (db) {
    await db.deletePdf(body.id);
  } else {
    //await supabaseDeleteHighlight(body);
  }
}

function ensureKeyword(highlight: StoredHighlight): StoredHighlight {
  return {
    ...highlight,
    keyword: highlight.keyword || "",
  };
}

function ensureKeywords(highlights: StoredHighlight[]): StoredHighlight[] {
  return highlights.map(ensureKeyword);
}

export async function POST(req: Request): Promise<Response> {
  return handleRequest(req, savePdfs);
}

export async function DELETE(req: Request): Promise<Response> {
  return handleRequest(req, deletePdf);
}
