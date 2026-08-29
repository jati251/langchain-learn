import { toBaseMessages, toUIMessageStream } from "@ai-sdk/langchain";
import { createUIMessageStreamResponse, UIMessage } from "ai";
import { ChatOllama } from "@langchain/ollama";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";
import { getRetriever } from "@/app/lib/vector-store";

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const lastMessage = messages[messages.length - 1];
  const latestQuery = lastMessage.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("\n");

  const model = new ChatOllama({
    model: "ministral-3:3b",
    temperature: 0.3, // No yapping, just facts
    numCtx: 8192, // Safe for M1 RAM
  });

  const retriever = await getRetriever();
  const relevantDocs = await retriever.invoke(latestQuery);
  const context = relevantDocs.map((d) => d.pageContent).join("\n\n");

  const langchainMessages = await toBaseMessages(messages);

  const systemPrompt = new SystemMessage(
    `You are a helpful assistant with Gen Z energy. 
     Use the context provided inside the tags to answer the question. 
     If question is nonsense, or tricky, say "haha nice try dude".
     If the answer is nowhere to be found, say "You are too smart for me dawg" 
     
     <context>
     ${context}
     </context>

     RESPONSE GUIDELINES:
     - Stay iconic and concise.
     - Use slang sparingly but correctly.
     - Never mention the context tags in your response.`
  );

  const history = langchainMessages.slice(0, -1);
  const userQuestion = new HumanMessage(
    `Question: ${latestQuery}\n\nRemember: Use the context provided in the system prompt to answer!`
  );

  const finalMessages = [systemPrompt, ...history, userQuestion];

  const stream = await model.stream(finalMessages);

  return createUIMessageStreamResponse({
    stream: toUIMessageStream(stream),
  });
}
