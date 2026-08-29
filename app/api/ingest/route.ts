import { NextRequest, NextResponse } from "next/server";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";

import { getVectorStore } from "@/app/lib/vector-store";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

// Use a named export for the POST method
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as Blob; // LangChain can handle the Blob/File directly

    if (!file) {
      return NextResponse.json(
        { error: "No file found, bestie" },
        { status: 400 }
      );
    }

    // 1. Load the PDF
    const loader = new PDFLoader(file);
    const docs = await loader.load();

    // 2. Shred it (Chunking) - Fix the typo here!
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    const splitDocs = await splitter.splitDocuments(docs);

    // 3. Add to your local Vector Store
    const vectorStore = await getVectorStore();
    await vectorStore.addDocuments(splitDocs);

    return NextResponse.json({
      success: true,
      message: "Juice is extracted! 🥤",
      chunks: splitDocs.length,
    });
  } catch (error: any) {
    console.error("Ingest Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
