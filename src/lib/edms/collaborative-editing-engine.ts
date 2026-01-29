/**
 * Collaborative Editing Engine
 * Real-time collaboration with conflict resolution
 * PATCH 865 - All-in-One EDMS
 */

import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";

export interface CollaborativeSession {
  id: string;
  documentId: string;
  documentName: string;
  status: "active" | "paused" | "ended";
  createdBy: string;
  createdAt: Date;
  endedAt?: Date;
  participants: SessionParticipant[];
  settings: SessionSettings;
  operations: DocumentOperation[];
}

export interface SessionParticipant {
  userId: string;
  userName: string;
  role: "owner" | "editor" | "commenter" | "viewer";
  joinedAt: Date;
  leftAt?: Date;
  isActive: boolean;
  cursorPosition?: CursorPosition;
  selectionRange?: SelectionRange;
  color: string;
}

export interface CursorPosition {
  line: number;
  column: number;
  timestamp: Date;
}

export interface SelectionRange {
  start: { line: number; column: number };
  end: { line: number; column: number };
}

export interface SessionSettings {
  allowAnonymousComments: boolean;
  autoSaveInterval: number;
  conflictResolution: "last_write_wins" | "first_write_wins" | "manual";
  lockSections: boolean;
  trackChanges: boolean;
  notifyOnJoin: boolean;
  maxParticipants: number;
}

export interface DocumentOperation {
  id: string;
  type: "insert" | "delete" | "replace" | "format" | "comment" | "suggestion";
  userId: string;
  timestamp: Date;
  position: { start: number; end?: number };
  content?: string;
  previousContent?: string;
  metadata?: Record<string, unknown>;
  status: "pending" | "applied" | "rejected" | "reverted";
}

export interface Comment {
  id: string;
  documentId: string;
  sessionId?: string;
  userId: string;
  userName: string;
  content: string;
  position: { start: number; end: number };
  quotedText: string;
  status: "open" | "resolved" | "archived";
  createdAt: Date;
  resolvedAt?: Date;
  resolvedBy?: string;
  replies: CommentReply[];
  mentions: string[];
}

export interface CommentReply {
  id: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: Date;
  mentions: string[];
}

export interface Suggestion {
  id: string;
  documentId: string;
  sessionId: string;
  userId: string;
  userName: string;
  type: "insert" | "delete" | "replace";
  originalText: string;
  suggestedText: string;
  position: { start: number; end: number };
  status: "pending" | "accepted" | "rejected";
  createdAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
  reviewComment?: string;
}

export interface ConflictResolution {
  id: string;
  sessionId: string;
  conflictingOperations: DocumentOperation[];
  resolvedOperation?: DocumentOperation;
  resolutionType: "auto" | "manual";
  resolvedBy?: string;
  resolvedAt: Date;
}

// Participant colors for visual identification
const PARTICIPANT_COLORS = [
  "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4",
  "#FFEAA7", "#DDA0DD", "#98D8C8", "#F7DC6F",
  "#BB8FCE", "#85C1E9", "#F8B500", "#00CED1"
];

class CollaborativeEditingEngine {
  private sessions: Map<string, CollaborativeSession> = new Map();
  private comments: Map<string, Comment[]> = new Map();
  private suggestions: Map<string, Suggestion[]> = new Map();
  private operationQueue: Map<string, DocumentOperation[]> = new Map();

  /**
   * Create a new collaborative session
   */
  async createSession(
    documentId: string,
    documentName: string,
    createdBy: string,
    userName: string,
    settings?: Partial<SessionSettings>
  ): Promise<CollaborativeSession> {
    const sessionId = `session-${Date.now()}`;

    const defaultSettings: SessionSettings = {
      allowAnonymousComments: false,
      autoSaveInterval: 30000,
      conflictResolution: "last_write_wins",
      lockSections: false,
      trackChanges: true,
      notifyOnJoin: true,
      maxParticipants: 50
    };

    const session: CollaborativeSession = {
      id: sessionId,
      documentId,
      documentName,
      status: "active",
      createdBy,
      createdAt: new Date(),
      participants: [
        {
          userId: createdBy,
          userName,
          role: "owner",
          joinedAt: new Date(),
          isActive: true,
          color: PARTICIPANT_COLORS[0]
        }
      ],
      settings: { ...defaultSettings, ...settings },
      operations: []
    };

    this.sessions.set(sessionId, session);
    this.operationQueue.set(sessionId, []);

    await this.logSessionAction("created", session);
    return session;
  }

  /**
   * Join an existing session
   */
  async joinSession(
    sessionId: string,
    userId: string,
    userName: string,
    role: "editor" | "commenter" | "viewer" = "editor"
  ): Promise<SessionParticipant | null> {
    const session = this.sessions.get(sessionId);
    if (!session || session.status !== "active") {
      return null;
    }

    // Check max participants
    const activeCount = session.participants.filter(p => p.isActive).length;
    if (activeCount >= session.settings.maxParticipants) {
      logger.error("Session full", new Error("Max participants reached"));
      return null;
    }

    // Check if already in session
    const existing = session.participants.find(p => p.userId === userId);
    if (existing) {
      existing.isActive = true;
      existing.leftAt = undefined;
      return existing;
    }

    const colorIndex = session.participants.length % PARTICIPANT_COLORS.length;
    const participant: SessionParticipant = {
      userId,
      userName,
      role,
      joinedAt: new Date(),
      isActive: true,
      color: PARTICIPANT_COLORS[colorIndex]
    };

    session.participants.push(participant);

    // Notify other participants if enabled
    if (session.settings.notifyOnJoin) {
      await this.notifyParticipants(session, `${userName} joined the session`);
    }

    return participant;
  }

  /**
   * Leave session
   */
  async leaveSession(sessionId: string, userId: string): Promise<boolean> {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    const participant = session.participants.find(p => p.userId === userId);
    if (participant) {
      participant.isActive = false;
      participant.leftAt = new Date();
      participant.cursorPosition = undefined;
      participant.selectionRange = undefined;
    }

    // End session if no active participants
    const activeCount = session.participants.filter(p => p.isActive).length;
    if (activeCount === 0) {
      session.status = "ended";
      session.endedAt = new Date();
    }

    return true;
  }

  /**
   * Apply document operation
   */
  async applyOperation(
    sessionId: string,
    operation: Omit<DocumentOperation, "id" | "status">
  ): Promise<DocumentOperation | null> {
    const session = this.sessions.get(sessionId);
    if (!session || session.status !== "active") {
      return null;
    }

    // Check user permissions
    const participant = session.participants.find(p => p.userId === operation.userId);
    if (!participant || !["owner", "editor"].includes(participant.role)) {
      return null;
    }

    const fullOperation: DocumentOperation = {
      ...operation,
      id: `op-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      status: "pending"
    };

    // Check for conflicts
    const conflicts = this.detectConflicts(session, fullOperation);
    if (conflicts.length > 0) {
      const resolved = await this.resolveConflict(session, fullOperation, conflicts);
      if (!resolved) {
        fullOperation.status = "rejected";
        return fullOperation;
      }
    }

    fullOperation.status = "applied";
    session.operations.push(fullOperation);

    // Queue for sync
    const queue = this.operationQueue.get(sessionId) || [];
    queue.push(fullOperation);
    this.operationQueue.set(sessionId, queue);

    return fullOperation;
  }

  /**
   * Update cursor position
   */
  updateCursor(
    sessionId: string,
    userId: string,
    position: CursorPosition
  ): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    const participant = session.participants.find(p => p.userId === userId);
    if (participant) {
      participant.cursorPosition = position;
    }
  }

  /**
   * Update selection range
   */
  updateSelection(
    sessionId: string,
    userId: string,
    selection: SelectionRange | undefined
  ): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    const participant = session.participants.find(p => p.userId === userId);
    if (participant) {
      participant.selectionRange = selection;
    }
  }

  /**
   * Add comment
   */
  async addComment(
    documentId: string,
    userId: string,
    userName: string,
    content: string,
    position: { start: number; end: number },
    quotedText: string,
    sessionId?: string
  ): Promise<Comment> {
    const comment: Comment = {
      id: `comment-${Date.now()}`,
      documentId,
      sessionId,
      userId,
      userName,
      content,
      position,
      quotedText,
      status: "open",
      createdAt: new Date(),
      replies: [],
      mentions: this.extractMentions(content)
    };

    const docComments = this.comments.get(documentId) || [];
    docComments.push(comment);
    this.comments.set(documentId, docComments);

    // Notify mentioned users
    if (comment.mentions.length > 0) {
      await this.notifyMentions(comment);
    }

    return comment;
  }

  /**
   * Reply to comment
   */
  async replyToComment(
    documentId: string,
    commentId: string,
    userId: string,
    userName: string,
    content: string
  ): Promise<CommentReply | null> {
    const docComments = this.comments.get(documentId);
    const comment = docComments?.find(c => c.id === commentId);
    if (!comment) return null;

    const reply: CommentReply = {
      id: `reply-${Date.now()}`,
      userId,
      userName,
      content,
      createdAt: new Date(),
      mentions: this.extractMentions(content)
    };

    comment.replies.push(reply);
    return reply;
  }

  /**
   * Resolve comment
   */
  async resolveComment(
    documentId: string,
    commentId: string,
    resolvedBy: string
  ): Promise<boolean> {
    const docComments = this.comments.get(documentId);
    const comment = docComments?.find(c => c.id === commentId);
    if (!comment) return false;

    comment.status = "resolved";
    comment.resolvedAt = new Date();
    comment.resolvedBy = resolvedBy;
    return true;
  }

  /**
   * Create suggestion (track changes)
   */
  async createSuggestion(
    documentId: string,
    sessionId: string,
    userId: string,
    userName: string,
    type: "insert" | "delete" | "replace",
    originalText: string,
    suggestedText: string,
    position: { start: number; end: number }
  ): Promise<Suggestion> {
    const suggestion: Suggestion = {
      id: `suggestion-${Date.now()}`,
      documentId,
      sessionId,
      userId,
      userName,
      type,
      originalText,
      suggestedText,
      position,
      status: "pending",
      createdAt: new Date()
    };

    const docSuggestions = this.suggestions.get(documentId) || [];
    docSuggestions.push(suggestion);
    this.suggestions.set(documentId, docSuggestions);

    return suggestion;
  }

  /**
   * Accept or reject suggestion
   */
  async reviewSuggestion(
    documentId: string,
    suggestionId: string,
    reviewedBy: string,
    accept: boolean,
    comment?: string
  ): Promise<boolean> {
    const docSuggestions = this.suggestions.get(documentId);
    const suggestion = docSuggestions?.find(s => s.id === suggestionId);
    if (!suggestion) return false;

    suggestion.status = accept ? "accepted" : "rejected";
    suggestion.reviewedAt = new Date();
    suggestion.reviewedBy = reviewedBy;
    suggestion.reviewComment = comment;

    return true;
  }

  /**
   * Detect operation conflicts
   */
  private detectConflicts(
    session: CollaborativeSession,
    newOperation: DocumentOperation
  ): DocumentOperation[] {
    const conflicts: DocumentOperation[] = [];
    const recentOps = session.operations.filter(
      op => op.status === "applied" &&
      Date.now() - op.timestamp.getTime() < 5000
    );

    for (const op of recentOps) {
      if (this.operationsOverlap(op, newOperation)) {
        conflicts.push(op);
      }
    }

    return conflicts;
  }

  /**
   * Check if operations overlap
   */
  private operationsOverlap(
    opA: DocumentOperation,
    opB: DocumentOperation
  ): boolean {
    const aStart = opA.position.start;
    const aEnd = opA.position.end || opA.position.start;
    const bStart = opB.position.start;
    const bEnd = opB.position.end || opB.position.start;

    return !(aEnd < bStart || bEnd < aStart);
  }

  /**
   * Resolve conflict between operations
   */
  private async resolveConflict(
    session: CollaborativeSession,
    newOperation: DocumentOperation,
    conflicts: DocumentOperation[]
  ): Promise<boolean> {
    switch (session.settings.conflictResolution) {
      case "last_write_wins":
        // New operation wins
        return true;
      case "first_write_wins":
        // Existing operation wins
        return false;
      case "manual":
        // Would trigger UI for manual resolution
        logger.info("Manual conflict resolution required", { conflicts });
        return false;
      default:
        return true;
    }
  }

  /**
   * Extract @mentions from text
   */
  private extractMentions(text: string): string[] {
    const mentionRegex = /@(\w+)/g;
    const mentions: string[] = [];
    let match;
    while ((match = mentionRegex.exec(text)) !== null) {
      mentions.push(match[1]);
    }
    return mentions;
  }

  /**
   * Notify participants
   */
  private async notifyParticipants(
    session: CollaborativeSession,
    message: string
  ): Promise<void> {
    // In production, use Supabase Realtime or WebSocket
    logger.info("Session notification", { sessionId: session.id, message });
  }

  /**
   * Notify mentioned users
   */
  private async notifyMentions(comment: Comment): Promise<void> {
    logger.info("Mention notifications", {
      commentId: comment.id,
      mentions: comment.mentions
    });
  }

  /**
   * Log session action
   */
  private async logSessionAction(
    action: string,
    session: CollaborativeSession
  ): Promise<void> {
    try {
      await supabase.from("ai_audit_logs").insert({
        user_input: `Collaborative session ${action}: ${session.documentName}`,
        module_name: "collaborative_editing",
        interaction_type: `session_${action}`,
        ai_response: JSON.stringify({
          sessionId: session.id,
          documentId: session.documentId,
          participantCount: session.participants.length
        })
      });
    } catch (error) {
      logger.error("Error logging session action", error as Error);
    }
  }

  /**
   * Get session by ID
   */
  getSession(sessionId: string): CollaborativeSession | undefined {
    return this.sessions.get(sessionId);
  }

  /**
   * Get active sessions for document
   */
  getActiveSessionsForDocument(documentId: string): CollaborativeSession[] {
    const sessions: CollaborativeSession[] = [];
    for (const session of this.sessions.values()) {
      if (session.documentId === documentId && session.status === "active") {
        sessions.push(session);
      }
    }
    return sessions;
  }

  /**
   * Get comments for document
   */
  getDocumentComments(documentId: string): Comment[] {
    return this.comments.get(documentId) || [];
  }

  /**
   * Get suggestions for document
   */
  getDocumentSuggestions(documentId: string): Suggestion[] {
    return this.suggestions.get(documentId) || [];
  }

  /**
   * Get pending operations for sync
   */
  getPendingOperations(sessionId: string): DocumentOperation[] {
    return this.operationQueue.get(sessionId) || [];
  }

  /**
   * Clear synced operations
   */
  clearSyncedOperations(sessionId: string): void {
    this.operationQueue.set(sessionId, []);
  }

  /**
   * End session
   */
  async endSession(sessionId: string, endedBy: string): Promise<boolean> {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    // Only owner can end session
    const participant = session.participants.find(p => p.userId === endedBy);
    if (participant?.role !== "owner") return false;

    session.status = "ended";
    session.endedAt = new Date();

    // Mark all participants as inactive
    session.participants.forEach(p => {
      p.isActive = false;
      p.leftAt = new Date();
    });

    await this.logSessionAction("ended", session);
    return true;
  }
}

export const collaborativeEditingEngine = new CollaborativeEditingEngine();
