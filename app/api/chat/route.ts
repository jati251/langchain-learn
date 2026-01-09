import { toBaseMessages, toUIMessageStream } from '@ai-sdk/langchain';
import { createUIMessageStreamResponse, UIMessage } from 'ai';
import { ChatOllama } from '@langchain/ollama';
import { SystemMessage, HumanMessage } from '@langchain/core/messages';
import { getRetriever } from '@/app/lib/vector-store';

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const lastMessage = messages[messages.length - 1];
  const latestQuery = lastMessage.parts
    .filter(part => part.type === 'text')
    .map(part => part.text)
    .join("\n");

  const model = new ChatOllama({
    model: 'llama3.2:1b',
    temperature: 0, 
    numCtx: 8192,  
  });

  const retriever = await getRetriever();
  const relevantDocs = await retriever.invoke(latestQuery);
  

  const context = relevantDocs.map(d => d.pageContent).join("\n\n");

  const langchainMessages = await toBaseMessages(messages);

  const systemPrompt = new SystemMessage(
    `You are a helpful assistant. Use the context below to answer.
     If the answer isn't in the context, just say "I don't have that info, bestie."
     
     <context>
     ${context}
     </context>`
  );

  const finalMessages = [systemPrompt, ...langchainMessages];

  const stream = await model.stream(finalMessages);

  return createUIMessageStreamResponse({
    stream: toUIMessageStream(stream),
  });
}