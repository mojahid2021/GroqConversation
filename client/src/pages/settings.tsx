import { MainLayout } from "@/components/layout/main-layout";
import { SettingsForm } from "@/components/settings/settings-form";
import { ApiKeyManagement } from "@/components/dashboard/api-key-management";

export default function Settings() {
  return (
    <MainLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-[#2D3748]">Settings</h1>
        </div>
        
        <div className="grid grid-cols-1 gap-6">
          <SettingsForm />
          
          <ApiKeyManagement />
          
          <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-200">
            <h2 className="text-lg font-semibold mb-4">About GroqChat</h2>
            <div className="prose max-w-none">
              <p>
                GroqChat is a powerful AI chatbot platform powered by Groq's state-of-the-art 
                language models. It provides conversational AI capabilities through RESTful APIs, 
                allowing for easy integration with your existing applications.
              </p>
              
              <p className="mt-4">
                Key features include:
              </p>
              
              <ul>
                <li>Conversational AI powered by Groq language models</li>
                <li>PDF document upload and processing for context-aware conversations</li>
                <li>Webhook support for integrating with external systems</li>
                <li>Usage analytics and cost tracking</li>
                <li>API key management for secure access</li>
              </ul>
              
              <p className="mt-4">
                For more information or support, please contact our team at support@groqchat.example.com
              </p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
