import { Request, Response } from "express";
import { MessageRole } from "../entities/Message";
import { Conversation } from "../entities/Conversation";
import { conversationRepo, messageRepo } from "../config/data-source";
import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function createConversation(req: Request, res: Response) {
  try {

    const newConversationPayload = conversationRepo.create({
      name: "New chat",
    });
    const newConversation = await conversationRepo.save(newConversationPayload);
   res.json({ conversationId: newConversation.id });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
}

async function getConversationMessages(req: Request, res: Response) {
  const conversationId = req.params.id;

  try {
    const conversation = await conversationRepo.findOneBy({
      id: conversationId,
    });
    if (!conversation) throw new Error("Conversation does not exist");

    const messages = await messageRepo.findBy({ conversationId });
    res.json({ messages });
  } catch (error: any) {
    if (!res.headersSent) {
      res.status(400).json({ message: error.message });
    }
  }
}

async function streamResponse(req: Request, res: Response) {
  const { prompt, conversationId } = req.body;
  
  try {
    // 1. Validate inputs
    if (!prompt || !conversationId) {
      throw new Error("Prompt and ConversationId are required");
    }

    // 2. Verify conversation exists
    const conversation = await conversationRepo.findOne({where:{id:conversationId}});
    if (!conversation) {
      throw new Error("Conversation not found");
    }

    // 3. Save user message
    const userMessage = messageRepo.create({
      conversationId,
      content: prompt,
      role: MessageRole.USER,
    });
    await messageRepo.save(userMessage);

    // 4. Fetch conversation history (sorted by creation time)
    const history = await messageRepo.find({
      where: { conversationId },
      order: { createdAt: 'ASC' },
    });

    // Format messages for OpenAI
    const openaiMessages = history.map((msg) => ({
      role: msg.role === MessageRole.USER ? 'user' : 'assistant',
      content: msg.content,
    }));

    // 5. Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    // 6. Stream OpenAI response
// @ts-ignore
    const stream = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo', // Specify your model
      messages: [...openaiMessages, { role: 'user', content: prompt }],
      stream: true,
    });

    let botResponseContent = '';
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      botResponseContent += content;
      
      // Send chunk to client
      res.write(`data: ${JSON.stringify({ content })}\n\n`);
    }

    // 7. Save bot message
    const botMessage = messageRepo.create({
      conversationId,
      content: botResponseContent,
      role: MessageRole.BOT,
    });
    await messageRepo.save(botMessage);

    // End SSE stream
    res.end();

  } catch (error: any) {
    console.error(error);
    
    if (!res.headersSent) {
       res.status(500).json({ error: error.message });
return
    }
    
    // If streaming started, send error event
    res.write(`data: ${JSON.stringify({ error: "Stream failed" })}\n\n`);
    res.end();
  }
}


export { createConversation, getConversationMessages, streamResponse };
