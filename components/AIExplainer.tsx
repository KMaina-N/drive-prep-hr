"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, User, Send, Loader2 } from "lucide-react";

const formatResponse = (text: string) => {
  if (!text) return { __html: "" };
  // Replace **text** with <strong>text</strong>
  const html = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  return { __html: html };
};

interface AIMessage {
  id: string;
  type: "user" | "ai";
  content: string;
  timestamp: Date;
}

interface AIExplainerProps {
  question: string;
  userAnswer: string | number;
  correctAnswer: string | number;
  explanation: string;
  isOpen: boolean;
  onClose: () => void;
  gotItRight?: boolean;
}

export const AIExplainer = ({
  question,
  userAnswer,
  correctAnswer,
  explanation,
  isOpen,
  onClose,
  gotItRight = false,
}: AIExplainerProps) => {
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      const initialMessageContent = gotItRight
        ? `Nice work! You chose "${userAnswer}", which is correct. Here's why: ${explanation}
Want to go deeper? Ask me to compare it with common mistakes or request a quick scenario example.`
        : `I see you selected "${userAnswer}". The correct answer is "${correctAnswer}". Here's why: ${explanation}
Ask me anything about this rule, or request a memory trick to remember it next time.`;

      setMessages([
        {
          id: "intro",
          type: "ai",
          content: initialMessageContent,
          timestamp: new Date(),
        },
      ]);
    }
  }, [isOpen, gotItRight, userAnswer, correctAnswer, explanation]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: AIMessage = {
      id: Date.now().toString(),
      type: "user",
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/gemini", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          question,
          userAnswer,
          correctAnswer,
          explanation,
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error("Failed to get AI response.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let receivedContent = "";
      const streamingMessageId = (Date.now() + 1).toString();

      setMessages((prev) => [
        ...prev,
        {
          id: streamingMessageId,
          type: "ai",
          content: "",
          timestamp: new Date(),
        },
      ]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        receivedContent += chunk;

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === streamingMessageId
              ? { ...msg, content: receivedContent }
              : msg
          )
        );
      }
    } catch (error) {
      console.error("Error fetching AI response:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          type: "ai",
          content:
            "Sorry, I am having trouble with that request. Please try again later.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl h-[600px] flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-primary" />
            AI Driving Instructor
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            aria-label="Close AI Explainer"
          >
            ✕
          </Button>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col gap-4 overflow-hidden">
          <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
            <strong>Question:</strong> {question}
          </div>
          <ScrollArea className="flex-1 pr-4 overflow-y-auto">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.type === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      message.type === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {message.type === "ai" && (
                        <Bot className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      )}
                      {message.type === "user" && (
                        <User className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      )}
                      <div
                        className="text-sm leading-relaxed"
                        dangerouslySetInnerHTML={formatResponse(
                          message.content
                        )}
                      />
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-muted p-3 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Bot className="w-4 h-4" />
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm">AI is thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          </ScrollArea>
          <div className="flex gap-2 pt-2">
            <Input
              placeholder="Ask me anything about this driving rule..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              disabled={isLoading}
              className="flex-1"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
              size="icon"
              aria-label="Send"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
