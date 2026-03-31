import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport, UIMessage } from 'ai';

const x = useChat({
  transport: new DefaultChatTransport({
    api: '/api/chat',
    body: {
      agent_id: "test",
      session_id: "test",
    }
  })
});

// Test sendMessage
x.sendMessage({ text: 'test' });
