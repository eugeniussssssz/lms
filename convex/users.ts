import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    
    const user = await ctx.db.get(userId);
    if (!user) return null;
    
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
    
    return { ...user, profile };
  },
});

export const createProfile = mutation({
  args: {
    firstName: v.string(),
    lastName: v.string(),
    role: v.union(v.literal("admin"), v.literal("instructor"), v.literal("student")),
    bio: v.optional(v.string()),
    department: v.optional(v.string()),
    phoneNumber: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    
    // Check if profile already exists
    const existingProfile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
    
    if (existingProfile) {
      throw new Error("Profile already exists");
    }
    
    return await ctx.db.insert("profiles", {
      userId,
      ...args,
    });
  },
});

export const updateProfile = mutation({
  args: {
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    bio: v.optional(v.string()),
    department: v.optional(v.string()),
    phoneNumber: v.optional(v.string()),
    avatar: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
    
    if (!profile) throw new Error("Profile not found");
    
    const updates = Object.fromEntries(
      Object.entries(args).filter(([_, value]) => value !== undefined)
    );
    
    await ctx.db.patch(profile._id, updates);
  },
});

export const getAllUsers = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    
    // Check if user is admin
    const currentProfile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
    
    if (!currentProfile || currentProfile.role !== "admin") {
      throw new Error("Admin access required");
    }
    
    const users = await ctx.db.query("users").collect();
    const profiles = await ctx.db.query("profiles").collect();
    
    return users.map(user => {
      const profile = profiles.find(p => p.userId === user._id);
      return { ...user, profile };
    });
  },
});
