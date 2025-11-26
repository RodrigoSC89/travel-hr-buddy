// PATCH 526 - Message Service Abstraction Layer
// Centralized service for communication management with WebSocket support

import { supabase } from "@/integrations/supabase/client";
import { RealtimeChannel } from "@supabase/supabase-js";

export interface Channel {
  id: string;
  name: string;
  description: string | null;
  channel_type: string;
  is_private: boolean;
  is_active: boolean;
  created_at: string;
  created_by?: string;
  organization_id?: string;
}

export interface Message {
  id: string;
  channel_id: string;
  user_id?: string;
  content: string;
  message_type?: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at?: string;
  user?: {
    email?: string;
    full_name?: string;
  };
}

export interface MessageFilter {
  channelId?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
  messageType?: string;
  limit?: number;
}

class MessageService {
  private realtimeChannel: RealtimeChannel | null = null;
  private messageCallbacks: Set<(message: Message) => void> = new Set();
  private channelCallbacks: Set<(channel: Channel) => void> = new Set();

  /**
   * Fetch all active channels for the current user
   */
  async getChannels(): Promise<Channel[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        // Return demo channels for unauthenticated users
        return this.getDemoChannels();
      }

      const { data, error } = await supabase
        .from("communication_channels")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data || []).map((ch: any) => ({
        ...ch,
        channel_type: ch.channel_type || "public",
        is_private: ch.is_private || false,
        organization_id: ch.organization_id || undefined,
      })) as Channel[];
    } catch (error) {
      console.error("Error fetching channels:", error);
      return this.getDemoChannels();
    }
  }

  /**
   * Fetch messages for a specific channel with optional filters
   */
  async getMessages(filter: MessageFilter): Promise<Message[]> {
    try {
      const { channelId, userId, startDate, endDate, messageType, limit = 50 } = filter;

      if (!channelId) {
        throw new Error("Channel ID is required");
      }

      let query = supabase
        .from("channel_messages")
        .select("*, user:profiles(email, full_name)")
        .eq("channel_id", channelId);

      if (userId) {
        // Try both column names for compatibility
        query = query.or(`user_id.eq.${userId},sender_id.eq.${userId}`);
      }

      if (startDate) {
        query = query.gte("created_at", startDate);
      }

      if (endDate) {
        query = query.lte("created_at", endDate);
      }

      if (messageType) {
        query = query.eq("message_type", messageType);
      }

      query = query.order("created_at", { ascending: true }).limit(limit);

      const { data, error } = await query;

      if (error) throw error;
      
      // Normalize data to handle different column names
      return (data || []).map(msg => this.normalizeMessage(msg));
    } catch (error) {
      console.error("Error fetching messages:", error);
      return [];
    }
  }

  /**
   * Normalize message to handle different database schemas
   */
  private normalizeMessage(msg: any): Message {
    return {
      id: msg.id,
      channel_id: msg.channel_id,
      user_id: msg.user_id || msg.sender_id,
      content: msg.content || msg.message_content || msg.message_text || "",
      message_type: msg.message_type,
      metadata: msg.metadata,
      created_at: msg.created_at,
      updated_at: msg.updated_at || msg.edited_at,
      user: msg.user,
    };
  }

  /**
   * Send a message to a channel
   */
  async sendMessage(channelId: string, content: string, metadata?: Record<string, any>): Promise<Message | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("User must be authenticated to send messages");
      }

      // Try with primary column names first, fallback to alternatives
      const messageData: any = {
        channel_id: channelId,
        user_id: user.id,
        content,
        message_type: "text",
      };

      if (metadata) {
        messageData.metadata = metadata;
      }

      let { data, error } = await supabase
        .from("channel_messages")
        .insert(messageData)
        .select("*, user:profiles(email, full_name)")
        .single();

      // If failed with content column, try alternative names
      if (error && error.message?.includes("content")) {
        const altMessageData = {
          ...messageData,
          message_content: content,
          message_text: content,
        };
        delete altMessageData.content;

        const retry = await supabase
          .from("channel_messages")
          .insert(altMessageData)
          .select("*, user:profiles(email, full_name)")
          .single();

        data = retry.data;
        error = retry.error;
      }

      if (error) throw error;
      return data ? this.normalizeMessage(data) : null;
    } catch (error) {
      console.error("Error sending message:", error);
      throw error;
    }
  }

  /**
   * Create a new communication channel
   */
  async createChannel(
    name: string,
    description: string | null,
    channelType: string = "public",
    isPrivate: boolean = false
  ): Promise<Channel | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("User must be authenticated to create channels");
      }

      const { data, error } = await supabase
        .from("communication_channels")
        .insert({
          name,
          description,
          channel_type: channelType,
          is_private: isPrivate,
          is_active: true,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data ? ({
        ...data,
        channel_type: (data as any).channel_type || "public",
        is_private: (data as any).is_private || false,
        organization_id: (data as any).organization_id ?? undefined,
      } as Channel) : null;
    } catch (error) {
      console.error("Error creating channel:", error);
      throw error;
    }
  }

  /**
   * Update channel information
   */
  async updateChannel(
    channelId: string,
    updates: Partial<Pick<Channel, "name" | "description" | "is_private" | "is_active">>
  ): Promise<Channel | null> {
    try {
      const { data, error } = await supabase
        .from("communication_channels")
        .update(updates)
        .eq("id", channelId)
        .select()
        .single();

      if (error) throw error;
      return data ? ({
        ...data,
        channel_type: (data as any).channel_type || "public",
        is_private: (data as any).is_private || false,
        organization_id: (data as any).organization_id ?? undefined,
      } as Channel) : null;
    } catch (error) {
      console.error("Error updating channel:", error);
      throw error;
    }
  }

  /**
   * Delete a channel (soft delete by setting is_active to false)
   */
  async deleteChannel(channelId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("communication_channels")
        .update({ is_active: false })
        .eq("id", channelId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error deleting channel:", error);
      return false;
    }
  }

  /**
   * Get message history for a channel with pagination
   */
  async getMessageHistory(
    channelId: string,
    page: number = 1,
    pageSize: number = 50
  ): Promise<{ messages: Message[]; totalCount: number }> {
    try {
      const offset = (page - 1) * pageSize;

      const [messagesResult, countResult] = await Promise.all([
        supabase
          .from("channel_messages")
          .select("*, user:profiles(email, full_name)")
          .eq("channel_id", channelId)
          .order("created_at", { ascending: false })
          .range(offset, offset + pageSize - 1),
        supabase
          .from("channel_messages")
          .select("id", { count: "exact", head: true })
          .eq("channel_id", channelId),
      ]);

      if (messagesResult.error) throw messagesResult.error;
      if (countResult.error) throw countResult.error;

      return {
        messages: (messagesResult.data || []).map(msg => this.normalizeMessage(msg)),
        totalCount: countResult.count || 0,
      };
    } catch (error) {
      console.error("Error fetching message history:", error);
      return { messages: [], totalCount: 0 };
    }
  }

  /**
   * Setup WebSocket real-time subscription for messages and channels
   */
  subscribeToRealtime(channelId?: string): void {
    if (this.realtimeChannel) {
      this.unsubscribeFromRealtime();
    }

    this.realtimeChannel = supabase.channel("communication-realtime");

    // Subscribe to channel changes
    this.realtimeChannel.on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "communication_channels",
      },
      (payload) => {
        console.log("Channel change detected", payload);
        if (payload.new) {
          this.channelCallbacks.forEach((callback) => callback(payload.new as Channel));
        }
      }
    );

    // Subscribe to new messages (optionally filtered by channel)
    const messageFilter: any = {
      event: "INSERT",
      schema: "public",
      table: "channel_messages",
    };

    if (channelId) {
      messageFilter.filter = `channel_id=eq.${channelId}`;
    }

    this.realtimeChannel.on("postgres_changes", messageFilter, (payload) => {
      console.log("New message detected", payload);
      if (payload.new) {
        this.messageCallbacks.forEach((callback) => callback(payload.new as Message));
      }
    });

    this.realtimeChannel.subscribe();
  }

  /**
   * Unsubscribe from real-time updates
   */
  unsubscribeFromRealtime(): void {
    if (this.realtimeChannel) {
      supabase.removeChannel(this.realtimeChannel);
      this.realtimeChannel = null;
    }
  }

  /**
   * Register callback for new messages
   */
  onMessage(callback: (message: Message) => void): () => void {
    this.messageCallbacks.add(callback);
    return () => this.messageCallbacks.delete(callback);
  }

  /**
   * Register callback for channel changes
   */
  onChannelChange(callback: (channel: Channel) => void): () => void {
    this.channelCallbacks.add(callback);
    return () => this.channelCallbacks.delete(callback);
  }

  /**
   * Search messages across channels
   */
  async searchMessages(query: string, channelIds?: string[]): Promise<Message[]> {
    try {
      let dbQuery = supabase
        .from("channel_messages")
        .select("*, user:profiles(email, full_name)")
        .order("created_at", { ascending: false })
        .limit(100);

      // Search in all possible content columns
      if (channelIds && channelIds.length > 0) {
        dbQuery = dbQuery.in("channel_id", channelIds);
      }

      // Try to search in multiple possible content column names
      dbQuery = dbQuery.or(`content.ilike.%${query}%,message_content.ilike.%${query}%,message_text.ilike.%${query}%`);

      const { data, error } = await dbQuery;

      if (error) throw error;
      return (data || []).map(msg => this.normalizeMessage(msg));
    } catch (error) {
      console.error("Error searching messages:", error);
      return [];
    }
  }

  /**
   * Get demo channels for unauthenticated users
   */
  private getDemoChannels(): Channel[] {
    return [
      {
        id: "demo-general",
        name: "general",
        description: "General communication channel",
        channel_type: "public",
        is_private: false,
        is_active: true,
        created_at: new Date().toISOString(),
      },
      {
        id: "demo-bridge",
        name: "bridge",
        description: "Bridge team communications",
        channel_type: "public",
        is_private: false,
        is_active: true,
        created_at: new Date().toISOString(),
      },
      {
        id: "demo-emergency",
        name: "emergency",
        description: "Emergency communications",
        channel_type: "emergency",
        is_private: false,
        is_active: true,
        created_at: new Date().toISOString(),
      },
    ];
  }
}

// Export singleton instance
export const messageService = new MessageService();
export default messageService;
