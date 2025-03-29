import { MainLayout } from "@/components/layout/main-layout";
import { WebhookManagement } from "@/components/webhooks/webhook-management";

export default function Webhooks() {
  return (
    <MainLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-[#2D3748]">Webhooks</h1>
        </div>
        
        <WebhookManagement />
        
        <div className="mt-6 bg-white shadow-sm rounded-lg p-6 border border-gray-200">
          <h2 className="text-lg font-semibold mb-4">Webhook Documentation</h2>
          <div className="prose max-w-none">
            <p>
              Webhooks allow you to receive real-time notifications when AI responses are generated. 
              This is useful for integrating with CLI tools, notification systems, or other external services.
            </p>
            
            <h3 className="text-md font-medium mt-4 mb-2">Payload Format</h3>
            <div className="bg-gray-50 p-4 rounded-md font-mono text-sm">
              {`{
  "message": "The AI response content...",
  "conversationId": 123,
  "timestamp": "2023-05-15T14:22:31.642Z"
}`}
            </div>
            
            <h3 className="text-md font-medium mt-4 mb-2">Implementation Example</h3>
            <p>
              Here's an example of how you might handle incoming webhook notifications in a Node.js application:
            </p>
            <div className="bg-gray-50 p-4 rounded-md font-mono text-sm overflow-x-auto">
              {`const express = require('express');
const app = express();
app.use(express.json());

app.post('/webhook', (req, res) => {
  const { message, conversationId, timestamp } = req.body;
  console.log(\`New message in conversation \${conversationId}:\`, message);
  // Process the message as needed
  res.status(200).send('OK');
});

app.listen(3000, () => {
  console.log('Webhook server running on port 3000');
});`}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
