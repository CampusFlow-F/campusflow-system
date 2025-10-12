
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Drawer, DrawerContent, DrawerTrigger, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Bot, Send, User, MessageSquare, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const ChatBot = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hello! I'm your CampusFlow AI assistant. I can help you with campus navigation, class schedules, faculty information, and more. How can I assist you today?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateBotResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    // Campus navigation queries
    if (lowerMessage.includes('find') || lowerMessage.includes('locate') || lowerMessage.includes('where')) {
      if (lowerMessage.includes('library')) {
        return "The library is located in the center of campus, next to the Student Center. It's open 24/7 during finals week! You can reserve study rooms through the dashboard.";
      }
      if (lowerMessage.includes('parking')) {
        return "Main parking areas are: Student Lot A (near dorms), Faculty Lot B (administration building), and Visitor Lot C (main entrance). Student parking permits are required 7 AM - 6 PM.";
      }
      if (lowerMessage.includes('dining') || lowerMessage.includes('food') || lowerMessage.includes('cafeteria')) {
        return "Campus dining options include: Main Cafeteria (Student Center), Coffee Shop (Library), and Food Court (Engineering Building). Hours: 7 AM - 9 PM weekdays.";
      }
      if (lowerMessage.includes('science building') || lowerMessage.includes('lab')) {
        return "The Science Building houses all science labs and is located on the east side of campus. Lab access requires student ID card activation.";
      }
    }

    // Schedule and classes
    if (lowerMessage.includes('schedule') || lowerMessage.includes('class') || lowerMessage.includes('course')) {
      return "You can view your complete class schedule in the Schedule tab. For today, you have 3 upcoming classes. Would you like directions to your next class?";
    }

    // Faculty information
    if (lowerMessage.includes('professor') || lowerMessage.includes('faculty') || lowerMessage.includes('office hours')) {
      return "Faculty information is available in the Faculty Directory. Currently, 18 out of 25 faculty members are available. You can check specific office hours and book appointments there.";
    }

    // Campus events and announcements
    if (lowerMessage.includes('event') || lowerMessage.includes('announcement')) {
      return "Current campus events: Tech Fair today 2-6 PM at Student Center, and Extended Library Hours during finals week. Check the Notifications tab for all updates!";
    }

    // Emergency or urgent help
    if (lowerMessage.includes('emergency') || lowerMessage.includes('help') || lowerMessage.includes('urgent')) {
      return "For emergencies, contact Campus Security at (555) 123-4567. For academic help, visit the Academic Success Center in the Library. For technical issues, contact IT Support.";
    }

    // General campus info
    if (lowerMessage.includes('hours') || lowerMessage.includes('open') || lowerMessage.includes('closed')) {
      return "Campus buildings are generally open 6 AM - 11 PM. Library has extended hours during finals. The Student Center is open 24/7. Specific building hours vary - would you like info about a particular building?";
    }

    // Default responses for common greetings and general queries
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      return "Hello! I'm here to help you navigate campus life. You can ask me about building locations, class schedules, faculty information, campus events, or any other campus-related questions.";
    }

    if (lowerMessage.includes('thank')) {
      return "You're welcome! I'm always here to help with your campus needs. Feel free to ask me anything else!";
    }

    // Default response
    return "I can help you with campus navigation, class schedules, faculty directories, campus events, and general campus information. Could you be more specific about what you're looking for?";
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    // Simulate AI response delay
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: generateBotResponse(inputValue),
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botResponse]);
      setIsLoading(false);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const ChatContent = () => (
    <div className="flex flex-col h-[500px]">
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`flex max-w-[80%] ${
                  message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
                } items-start gap-2`}
              >
                <div
                  className={`rounded-full p-2 ${
                    message.sender === 'user' ? 'bg-primary' : 'bg-muted'
                  }`}
                >
                  {message.sender === 'user' ? (
                    <User className="h-4 w-4 text-primary-foreground" />
                  ) : (
                    <Bot className="h-4 w-4" />
                  )}
                </div>
                <div
                  className={`rounded-lg px-3 py-2 ${
                    message.sender === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
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
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
      
      <div className="border-t p-4">
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me about campus navigation, schedules, faculty..."
            className="flex-1"
            disabled={isLoading}
          />
          <Button 
            onClick={handleSendMessage} 
            disabled={!inputValue.trim() || isLoading}
            size="icon"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Dialog */}
      <div className="hidden md:block">
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button
              className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50"
              size="icon"
            >
              <MessageSquare className="h-6 w-6" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md h-[600px] p-0">
            <DialogHeader className="p-4 pb-2">
              <DialogTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                CampusFlow AI Assistant
                <Badge variant="secondary" className="ml-auto">Online</Badge>
              </DialogTitle>
            </DialogHeader>
            <ChatContent />
          </DialogContent>
        </Dialog>
      </div>

      {/* Mobile Drawer */}
      <div className="md:hidden">
        <Drawer open={isOpen} onOpenChange={setIsOpen}>
          <DrawerTrigger asChild>
            <Button
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
                CampusFlow AI Assistant
                <Badge variant="secondary" className="ml-auto">Online</Badge>
              </DrawerTitle>
            </DrawerHeader>
            <div className="flex-1 overflow-hidden">
              <ChatContent />
            </div>
          </DrawerContent>
        </Drawer>
      </div>
    </>
  );
};

export default ChatBot;
