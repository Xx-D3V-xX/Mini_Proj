import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Send } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiRequest } from "@/lib/queryClient";

interface ChatResponse {
  session_id: string;
  reply_markdown: string;
  poi_ids_referenced: string[];
  quick_actions?: { label: string; payload: Record<string, unknown> }[];
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  quickActions?: ChatResponse["quick_actions"];
}

export default function Chat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessionId, setSessionId] = useState<string | undefined>();
  const [input, setInput] = useState("");

  const chatMutation = useMutation({
    mutationFn: (message: string) =>
      apiRequest<ChatResponse>("POST", "/chat", { message, session_id: sessionId }),
    onSuccess: (response, message) => {
      setSessionId(response.session_id);
      setMessages((prev) => [
        ...prev,
        { role: "user", content: message },
        { role: "assistant", content: response.reply_markdown, quickActions: response.quick_actions },
      ]);
    },
  });

  const handleSend = () => {
    if (!input.trim() || chatMutation.isPending) return;
    const pendingMessage = input.trim();
    setInput("");
    chatMutation.mutate(pendingMessage);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-3xl space-y-6">
        <div className="text-center space-y-2">
          <p className="text-sm uppercase tracking-wide text-muted-foreground">AI Trail Assistant</p>
          <h1 className="font-serif text-4xl font-bold">Plan with the chat concierge</h1>
          <p className="text-muted-foreground">
            Responses are grounded in the normalized POI database and cite only verified locations.
          </p>
        </div>

        <Card className="p-4 space-y-4 min-h-[400px]">
          {messages.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center mt-16">
              Ask for a neighbourhood plan, food crawl, or family-friendly suggestions.
            </p>
          ) : (
            messages.map((message, index) => (
              <div key={index} className={`space-y-2 ${message.role === "assistant" ? "text-primary" : "text-foreground"}`}>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">{message.role}</p>
                <div
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: message.content.replace(/\n/g, "<br />") }}
                />
                {message.role === "assistant" && message.quickActions?.length ? (
                  <div className="flex flex-wrap gap-2">
                    {message.quickActions.map((action, idx) => (
                      <Button
                        key={idx}
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setInput((action.payload?.message as string) ?? action.label)}
                      >
                        {action.label}
                      </Button>
                    ))}
                  </div>
                ) : null}
              </div>
            ))
          )}
        </Card>

        <div className="flex gap-2">
          <Input
            placeholder="Ask for an artsy evening in Bandra..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <Button onClick={handleSend} disabled={chatMutation.isPending}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
