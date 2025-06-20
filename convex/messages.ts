import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const sendMessage = mutation({
  args: {
    recipientId: v.id("users"),
    subject: v.string(),
    content: v.string(),
    threadId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    
    const recipient = await ctx.db.get(args.recipientId);
    if (!recipient) throw new Error("Recipient not found");
    
    const messageId = await ctx.db.insert("messages", {
      senderId: userId,
      recipientId: args.recipientId,
      subject: args.subject,
      content: args.content,
      threadId: args.threadId || crypto.randomUUID(),
      isRead: false,
    });
    
    // Create notification for recipient
    await ctx.db.insert("notifications", {
      userId: args.recipientId,
      type: "new_message",
      title: "New Message",
      message: `You have a new message from ${userId}: ${args.subject}`,
      isRead: false,
      relatedId: messageId,
    });
    
    return messageId;
  },
});

export const getMessages = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    
    const sentMessages = await ctx.db
      .query("messages")
      .withIndex("by_sender", (q) => q.eq("senderId", userId))
      .collect();
    
    const receivedMessages = await ctx.db
      .query("messages")
      .withIndex("by_recipient", (q) => q.eq("recipientId", userId))
      .collect();
    
    // Group messages by thread
    const threads = new Map();
    
    [...sentMessages, ...receivedMessages].forEach(message => {
      const threadId = message.threadId || message._id;
      if (!threads.has(threadId)) {
        threads.set(threadId, []);
      }
      threads.get(threadId).push(message);
    });
    
    // Sort messages within each thread by creation time
    threads.forEach(messages => {
      messages.sort((a: any, b: any) => a._creationTime - b._creationTime);
    });
    
    return Array.from(threads.values());
  },
});

export const markAsRead = mutation({
  args: { messageId: v.id("messages") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    
    const message = await ctx.db.get(args.messageId);
    if (!message) throw new Error("Message not found");
    
    if (message.recipientId !== userId) {
      throw new Error("You can only mark your own messages as read");
    }
    
    await ctx.db.patch(args.messageId, { isRead: true });
  },
});

export const getConversation = query({
  args: { threadId: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_thread", (q) => q.eq("threadId", args.threadId))
      .collect();
    
    // Verify user is part of this conversation
    const userInConversation = messages.some(
      msg => msg.senderId === userId || msg.recipientId === userId
    );
    
    if (!userInConversation) {
      throw new Error("Access denied");
    }
    
    // Get sender and recipient profiles
    const messagesWithProfiles = [];
    for (const message of messages) {
      const sender = await ctx.db.get(message.senderId);
      const recipient = await ctx.db.get(message.recipientId);
      const senderProfile = await ctx.db
        .query("profiles")
        .withIndex("by_user", (q) => q.eq("userId", message.senderId))
        .first();
      const recipientProfile = await ctx.db
        .query("profiles")
        .withIndex("by_user", (q) => q.eq("userId", message.recipientId))
        .first();
      
      messagesWithProfiles.push({
        ...message,
        sender: sender ? { ...sender, profile: senderProfile } : null,
        recipient: recipient ? { ...recipient, profile: recipientProfile } : null,
      });
    }
    
    return messagesWithProfiles.sort((a, b) => a._creationTime - b._creationTime);
  },
});
