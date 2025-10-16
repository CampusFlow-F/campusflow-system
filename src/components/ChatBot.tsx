import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Drawer, DrawerContent, DrawerTrigger, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Bot, Send, User, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  content: string;
  sender: "user" | "bot";
  timestamp: string; // ISO string for persistence
}

// Helpful motivational quotes and a small coupon/code generator
const MOTIVATIONAL_QUOTES = [
  "Small progress each day adds up to big results.",
  "You've got this — one step at a time.",
  "Study smart, rest well, repeat.",
  "Focus on progress, not perfection.",
  "Turn 'I can't' into 'I'll try' — then watch yourself grow.",
];

const generateMotivationCode = () => {
  // simple readable code like STUD-AB12
  const parts = [
    "STUD",
    Math.random().toString(36).substring(2, 6).toUpperCase(),
  ];
  return parts.join("-");
};

const STORAGE_KEY = "campusflow_messages_v1";

export default function CampusFlowChatBot() {
  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved) as Message[];
    } catch (e) {
      // ignore
    }
    return [
      {
        id: "welcome",
        content:
          "Hello! I'm CampusFlow — your student assistant. Ask about locations, schedules, events, or type 'motivate me' for a motivational code.",
        sender: "bot",
        timestamp: new Date().toISOString(),
      },
    ];
  });
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch (e) {
      // ignore storage errors
    }
  }, [messages]);

  useEffect(() => {
    // auto-scroll when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    // focus input when drawer/dialog opens
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 120);
  }, [isOpen]);

  const nowStr = () => new Date().toISOString();

  const addBotMessage = (content: string) => {
    const botMessage: Message = {
      id: (Date.now() + Math.random()).toString(),
      content,
      sender: "bot",
      timestamp: nowStr(),
    };
    setMessages((prev) => [...prev, botMessage]);
  };

  const generateBotResponse = (userMessage: string) => {
    const lower = userMessage.toLowerCase();

    // handle motivate shortcut
    if (lower.includes("motivate") || lower.includes("motivation") || lower.includes("motivate me")) {
      const code = generateMotivationCode();
      const quote = MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];
      return `✨ Motivation Code: ${code} — "${quote}" \nUse this code as a reminder: take a 25-minute focused session, then reward yourself.`;
    }

    // Quick campus lookups
    if (lower.includes("library")) {
      return "The library is in the campus center next to the Student Center. During exam weeks it has extended hours — check the Schedule tab to reserve a room.";
    }
    if (lower.includes("parking")) {
      return "Student parking: Lot A (dorms), Lot B (near admin). Permits required 7:00-18:00 on weekdays.";
    }
    if (lower.includes("food") || lower.includes("dining") || lower.includes("cafeteria")) {
      return "Dining options: Main Cafeteria (Student Center), Coffee Spot (Library), Food Court (Engineering). Many outlets accept meal card swipes.";
    }
    if (lower.includes("schedule") || lower.includes("class") || lower.includes("timetable")) {
      return "Open the Schedule tab to see your classes. Tip: enable notifications for class reminders and assignment deadlines.";
    }
    if (lower.includes("event") || lower.includes("fair") || lower.includes("announcement")) {
      return "Today's top event: Tech Fair 14:00–18:00 at the Student Center. Visit Notifications for the full events list.";
    }
    if (lower.includes("emergency")) {
      return "For emergencies contact Campus Security at (555) 123-4567. For medical help, go to the Health Center immediately.";
    }

    // greetings
    if (/(hi|hello|hey|good morning|good afternoon)/.test(lower)) {
      return "Hi! Ask me where things are, about schedules, or say 'motivate me' for a motivational code.";
    }

    if (lower.includes("thank")) {
      return "You're welcome — happy to help! Remember: short, focused study sessions beat long, unfocused ones.";
    }

    // fallback
    return "I can help with campus locations, schedules, faculty info, events, and motivation. Can you say that again in another way?";
  };

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMsg: Message = {
      id: (Date.now() + Math.random()).toString(),
      content: inputValue.trim(),
      sender: "user",
      timestamp: nowStr(),
    };

    setMessages((prev) => [...prev, userMsg]);
    const userText = inputValue.trim();
    setInputValue("");
    setIsLoading(true);

    // simulate typing delay, but deterministic
    setTimeout(() => {
      try {
        const reply = generateBotResponse(userText);
        // if reply contains a motivation code, extract code for copy-button UX
        addBotMessage(reply);
      } finally {
        setIsLoading(false);
      }
    }, 700);
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const copyLatestMotivation = () => {
    // find last bot message with "Motivation Code:" pattern
    const found = [...messages].reverse().find((m) => /Motivation Code:/i.test(m.content));
    if (!found) {
      toast({ title: "No motivation code found", description: "Ask me to 'motivate me' to generate one." });
      return;
    }
    const match = found.content.match(/Motivation Code:\s*([A-Z0-9-]+)/i);
    const code = match ? match[1] : found.content;
    navigator.clipboard?.writeText(code).then(
      () => toast({ title: "Copied", description: `Motivation code ${code} copied to clipboard` }),
      () => toast({ title: "Copy failed", description: "Couldn't copy code to clipboard" })
    );
  };

  const quickSuggestions = [
    "Where is the library?",
    "What's my schedule?",
    "Motivate me",
    "Any events today?",
  ];

  return (
    <>
      {/* Desktop Dialog */}
      <div className="hidden md:block">
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button
              aria-label="Open campus chat"
              className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50"
              size="icon"
            >
              <MessageSquare className="h-6 w-6" />
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-lg w-full h-[80vh] p-0">
            <DialogHeader className="p-4 pb-2">
              <DialogTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                CampusFlow Assistant
                <Badge variant="secondary" className="ml-auto">Online</Badge>
              </DialogTitle>
            </DialogHeader>

            <div className="flex flex-col h-[calc(80vh-64px)]">
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map((m) => (
                    <div
                      key={m.id}
                      className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`flex max-w-[85%] ${
                          m.sender === "user" ? "flex-row-reverse" : "flex-row"
                        } items-start gap-3`}
                      >
                        <div className="rounded-full p-2 bg-surface-50/50 flex items-center justify-center">
                          {m.sender === "user" ? (
                            <User className="h-4 w-4 text-primary-foreground" />
                          ) : (
                            <Bot className="h-4 w-4" />
                          )}
                        </div>
                        <div className={`rounded-lg px-3 py-2 ${m.sender === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                          <p className="whitespace-pre-line text-sm">{m.content}</p>
                          <p className="text-xs opacity-60 mt-1">
                            {new Date(m.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="flex items-start gap-2">
                        <div className="rounded-full p-2 bg-muted">
                          <Bot className="h-4 w-4" />
                        </div>
                        <div className="rounded-lg px-3 py-2 bg-muted">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              <div className="border-t p-3">
                <div className="flex gap-2 items-center mb-2">
                  <div className="flex flex-wrap gap-2">
                    {quickSuggestions.map((s) => (
                      <Button
                        key={s}
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setInputValue(s);
                          inputRef.current?.focus();
                        }}
                      >
                        {s}
                      </Button>
                    ))}
                  </div>
                  <Button size="sm" variant="outline" className="ml-auto" onClick={copyLatestMotivation}>
                    Copy last motivation
                  </Button>
                </div>

                <div className="flex gap-2">
                  <Input
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask about campus, schedules, or type 'motivate me'..."
                    aria-label="Chat input"
                    className="flex-1"
                    disabled={isLoading}
                  />
                  <Button onClick={handleSend} disabled={!inputValue.trim() || isLoading} size="icon">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Mobile Drawer */}
      <div className="md:hidden">
        <Drawer open={isOpen} onOpenChange={setIsOpen}>
          <DrawerTrigger asChild>
            <Button
              aria-label="Open campus chat"
              className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50"
              size="icon"
            >
              <MessageSquare className="h-6 w-6" />
            </Button>
          </DrawerTrigger>

          <DrawerContent className="h-[85vh]">
            <DrawerHeader>
              <DrawerTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                CampusFlow Assistant
                <Badge variant="secondary" className="ml-auto">Online</Badge>
              </DrawerTitle>
            </DrawerHeader>

            <div className="flex flex-col h-[calc(85vh-64px)]">
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map((m) => (
                    <div
                      key={m.id}
                      className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`flex max-w-[85%] ${
                          m.sender === "user" ? "flex-row-reverse" : "flex-row"
                        } items-start gap-3`}
                      >
                        <div className="rounded-full p-2 bg-surface-50/50 flex items-center justify-center">
                          {m.sender === "user" ? (
                            <User className="h-4 w-4 text-primary-foreground" />
                          ) : (
                            <Bot className="h-4 w-4" />
                          )}
                        </div>
                        <div className={`rounded-lg px-3 py-2 ${m.sender === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                          <p className="whitespace-pre-line text-sm">{m.content}</p>
                          <p className="text-xs opacity-60 mt-1">
                            {new Date(m.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="flex items-start gap-2">
                        <div className="rounded-full p-2 bg-muted">
                          <Bot className="h-4 w-4" />
                        </div>
                        <div className="rounded-lg px-3 py-2 bg-muted">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              <div className="border-t p-3">
                <div className="flex gap-2 items-center mb-2">
                  <div className="flex flex-wrap gap-2">
                    {quickSuggestions.map((s) => (
                      <Button
                        key={s}
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setInputValue(s);
                          inputRef.current?.focus();
                        }}
                      >
                        {s}
                      </Button>
                    ))}
                  </div>
                  <Button size="sm" variant="outline" className="ml-auto" onClick={copyLatestMotivation}>
                    Copy last motivation
                  </Button>
                </div>

                <div className="flex gap-2">
                  <Input
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask about campus, schedules, or type 'motivate me'..."
                    aria-label="Chat input"
                    className="flex-1"
                    disabled={isLoading}
                  />
                  <Button onClick={handleSend} disabled={!inputValue.trim() || isLoading} size="icon">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </DrawerContent>
        </Drawer>
      </div>
    </>
  );
}

