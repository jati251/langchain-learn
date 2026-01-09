import { MemoryVectorStore } from "@langchain/classic/vectorstores/memory";
import { OllamaEmbeddings } from "@langchain/ollama";

const embeddings = new OllamaEmbeddings({
  model: "nomic-embed-text", 
  baseUrl: "http://localhost:11434",
  requestOptions: {
    numThread: 4,
  },
});

export async function getRetriever() {
  // Create the store
  const vectorStore = new MemoryVectorStore(embeddings);

  // Add some sample data (Ingestion)
  await vectorStore.addDocuments([
    { pageContent: "The secret code for the vault is 12345.", metadata: { id: 1 } },
    { pageContent: "Qwen3-VL 8B has a native thinking mode.", metadata: { id: 2 } },
  ]);

  // Turn it into a retriever that grabs the top 2 matches
  return vectorStore.asRetriever(2);
}