import React from "react";
import { Message } from "@/lib/groq-api";
import { cn } from "@/lib/utils";
import { FileText } from "lucide-react";

interface ChatMessageProps {
  message: Message;
  className?: string;
}

export function ChatMessage({ message, className }: ChatMessageProps) {
  // Format message content with markdown-like features
  const formatContent = (content: string) => {
    // Replace code blocks
    const codeBlockPattern = /```([a-zA-Z]*)\n([\s\S]*?)\n```/g;
    let formattedContent = content.replace(
      codeBlockPattern,
      (_, language, code) => `
        <div class="mt-3 bg-[#1a202c] text-white p-3 font-mono text-xs rounded-md overflow-x-auto">
          <pre><code>${escapeHTML(code)}</code></pre>
        </div>
      `
    );

    // Replace unordered lists
    const ulPattern = /^\s*-\s+(.*?)$/gm;
    formattedContent = formattedContent.replace(
      ulPattern,
      (_, item) => `<li>${item}</li>`
    );
    formattedContent = formattedContent.replace(
      /(<li>.*?<\/li>(\s*\n*)*)+/g,
      (match) => `<ul class="list-disc list-inside mt-1 space-y-1">${match}</ul>`
    );

    // Replace ordered lists
    const olPattern = /^\s*\d+\.\s+(.*?)$/gm;
    formattedContent = formattedContent.replace(
      olPattern,
      (_, item) => `<li>${item}</li>`
    );
    formattedContent = formattedContent.replace(
      /(<li>.*?<\/li>(\s*\n*)*)+/g,
      (match) => {
        // Only convert to <ol> if it's not already wrapped in <ul>
        if (!match.includes("<ul")) {
          return `<ol class="list-decimal list-inside mt-1 space-y-1">${match}</ol>`;
        }
        return match;
      }
    );

    // Replace strong/bold
    formattedContent = formattedContent.replace(
      /\*\*(.*?)\*\*/g,
      '<strong>$1</strong>'
    );

    // Replace italics
    formattedContent = formattedContent.replace(
      /\*(.*?)\*/g,
      '<em>$1</em>'
    );

    // Replace paragraphs
    formattedContent = formattedContent.replace(
      /\n\s*\n/g,
      '</p><p class="mt-2">'
    );

    // Wrap in paragraph if not already
    if (!formattedContent.startsWith('<')) {
      formattedContent = `<p>${formattedContent}</p>`;
    }

    return formattedContent;
  };

  // Escape HTML to prevent XSS
  const escapeHTML = (str: string) => {
    return str.replace(
      /[&<>'"]/g,
      (tag) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          "'": "&#39;",
          '"': "&quot;",
        }[tag] || tag)
    );
  };

  // Parse document references if any
  const documentReferences = message.documentReference?.split(',').map(Number) || [];

  return (
    <div
      className={cn(
        "chat-message mb-4 flex",
        message.role === "user" ? "ml-auto" : "mr-auto",
        className
      )}
    >
      {message.role === "assistant" && (
        <div className="w-8 h-8 rounded-full bg-[#2D3748] flex-shrink-0 mr-2 flex items-center justify-center">
          <span className="text-white text-xs font-bold">AI</span>
        </div>
      )}

      <div
        className={cn(
          "rounded-lg px-4 py-2 text-sm",
          message.role === "user"
            ? "bg-[#805AD5] bg-opacity-10"
            : "bg-gray-100"
        )}
      >
        {documentReferences.length > 0 && (
          <div className="flex items-center mb-2 text-xs text-gray-500">
            <FileText className="text-red-500 mr-1 h-3 w-3" />
            <span>Referencing document context</span>
          </div>
        )}

        <div
          dangerouslySetInnerHTML={{ __html: formatContent(message.content) }}
          className="prose prose-sm max-w-none"
        />
      </div>

      {message.role === "user" && (
        <div className="w-8 h-8 rounded-full bg-[#805AD5] flex-shrink-0 ml-2 flex items-center justify-center">
          <span className="text-white text-xs font-bold">ME</span>
        </div>
      )}
    </div>
  );
}
