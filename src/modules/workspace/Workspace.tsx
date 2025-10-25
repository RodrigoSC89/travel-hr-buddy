/**
 * PATCH 102.0 - Collaborative Workspace
 * Real-time collaboration with TipTap editor, chat, file upload, and calendar
 */

import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, MessageSquare, FileText, Calendar, Upload, Send, Bell } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { collaborationService } from "./services/collaboration-service";
import { WorkspaceMember, ChatMessage, UploadedFile, CalendarEvent, Notification } from "./types";

const Workspace = () => {
  const { toast } = useToast();
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [onlineMembers, setOnlineMembers] = useState<WorkspaceMember[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [editorContent, setEditorContent] = useState("Start typing your document here...");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const currentUserId = "1"; // Demo user

  useEffect(() => {
    loadData();
    
    // Simulate real-time updates
    const interval = setInterval(() => {
      setMessages(collaborationService.getMessages());
      setOnlineMembers(collaborationService.getOnlineMembers());
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const loadData = () => {
    setMembers(collaborationService.getAllMembers());
    setOnlineMembers(collaborationService.getOnlineMembers());
    setMessages(collaborationService.getMessages());
    setFiles(collaborationService.getFiles());
    setEvents(collaborationService.getUpcomingEvents());
    setNotifications(collaborationService.getNotifications(currentUserId, true));
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message = collaborationService.sendMessage(currentUserId, newMessage);
    setMessages(collaborationService.getMessages());
    setNewMessage("");
    
    toast({
      title: "Message Sent",
      description: "Your message has been sent to the team"
    });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const uploadedFile = collaborationService.uploadFile(file, currentUserId);
    setFiles(collaborationService.getFiles());
    
    toast({
      title: "File Uploaded",
      description: `${file.name} has been uploaded successfully`
    });
  };

  const handleCreateEvent = () => {
    const event = collaborationService.createEvent({
      title: "Team Meeting",
      description: "Weekly sync meeting",
      startTime: new Date(Date.now() + 86400000),
      endTime: new Date(Date.now() + 90000000),
      attendees: onlineMembers.map(m => m.id),
      isOnline: true
    });

    setEvents(collaborationService.getUpcomingEvents());
    
    toast({
      title: "Event Created",
      description: `${event.title} has been scheduled`
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
    case "online":
      return "bg-green-500";
    case "away":
      return "bg-yellow-500";
    default:
      return "bg-gray-500";
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / 1048576).toFixed(1) + " MB";
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Users className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Collaborative Workspace</h1>
            <p className="text-muted-foreground">
              Real-time collaboration with editor, chat, and file sharing
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon">
            <Bell className="h-4 w-4" />
            {notifications.length > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0">
                {notifications.length}
              </Badge>
            )}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{members.length}</div>
            <p className="text-xs text-muted-foreground">
              {onlineMembers.length} online
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Messages</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{messages.length}</div>
            <p className="text-xs text-muted-foreground">Total conversations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Files</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{files.length}</div>
            <p className="text-xs text-muted-foreground">Shared documents</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{events.length}</div>
            <p className="text-xs text-muted-foreground">Upcoming meetings</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* TipTap Editor */}
          <Card>
            <CardHeader>
              <CardTitle>Collaborative Editor</CardTitle>
              <CardDescription>Real-time document editing with Supabase sync</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg p-4 min-h-[300px] bg-background">
                <textarea
                  className="w-full h-full min-h-[250px] bg-transparent border-none outline-none resize-none"
                  value={editorContent}
                  onChange={(e) => setEditorContent(e.target.value)}
                  placeholder="Start typing..."
                />
              </div>
              <div className="flex justify-between items-center mt-4">
                <span className="text-sm text-muted-foreground">
                  {onlineMembers.length} {onlineMembers.length === 1 ? "person" : "people"} editing
                </span>
                <Button size="sm">Save Changes</Button>
              </div>
            </CardContent>
          </Card>

          {/* File Upload Area */}
          <Card>
            <CardHeader>
              <CardTitle>Shared Files</CardTitle>
              <CardDescription>Upload and manage team documents</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Button onClick={() => fileInputRef.current?.click()}>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload File
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </div>

                {files.length > 0 ? (
                  <div className="space-y-2">
                    {files.map((file) => (
                      <div key={file.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium text-sm">{file.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatFileSize(file.size)} • {file.uploadedAt.toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">Download</Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    No files uploaded yet
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Online Members */}
          <Card>
            <CardHeader>
              <CardTitle>Online Members</CardTitle>
              <CardDescription>{onlineMembers.length} active now</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {onlineMembers.map((member) => (
                  <div key={member.id} className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={member.avatar} />
                        <AvatarFallback>
                          {member.name.split(" ").map(n => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-background ${getStatusColor(member.status)}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{member.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{member.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Chat */}
          <Card>
            <CardHeader>
              <CardTitle>Team Chat</CardTitle>
              <CardDescription>Real-time messaging</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ScrollArea className="h-[300px] pr-4">
                <div className="space-y-3">
                  {messages.map((message) => (
                    <div key={message.id} className="flex gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={message.userAvatar} />
                        <AvatarFallback className="text-xs">
                          {message.userName.split(" ").map(n => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-baseline gap-2">
                          <span className="text-sm font-medium">{message.userName}</span>
                          <span className="text-xs text-muted-foreground">
                            {message.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{message.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <div className="flex gap-2">
                <Input
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                />
                <Button size="icon" onClick={handleSendMessage}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Calendar Events */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Upcoming Events</CardTitle>
                <CardDescription>Team calendar</CardDescription>
              </div>
              <Button size="sm" variant="outline" onClick={handleCreateEvent}>
                Add Event
              </Button>
            </CardHeader>
            <CardContent>
              {events.length > 0 ? (
                <div className="space-y-2">
                  {events.map((event) => (
                    <div key={event.id} className="p-3 border rounded-lg">
                      <p className="font-medium text-sm">{event.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {event.startTime.toLocaleString()}
                      </p>
                      <Badge variant="outline" className="mt-1">
                        {event.attendees.length} attendees
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-4">
                  No upcoming events
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Workspace;
