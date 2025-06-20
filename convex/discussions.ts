import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const createDiscussion = mutation({
  args: {
    courseId: v.id("courses"),
    title: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    
    const course = await ctx.db.get(args.courseId);
    if (!course) throw new Error("Course not found");
    
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
    
    if (!profile || (profile.role !== "instructor" && profile.role !== "admin")) {
      throw new Error("Only instructors and admins can create discussions");
    }
    
    if (profile.role === "instructor" && course.instructorId !== userId) {
      throw new Error("You can only create discussions for your own courses");
    }
    
    return await ctx.db.insert("discussions", {
      ...args,
      createdBy: userId,
      isPinned: false,
      isLocked: false,
    });
  },
});

export const getDiscussions = query({
  args: { courseId: v.id("courses") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    
    // Verify access to course
    const course = await ctx.db.get(args.courseId);
    if (!course) throw new Error("Course not found");
    
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
    
    if (!profile) throw new Error("Profile not found");
    
    // Check access
    if (profile.role === "student") {
      const enrollment = await ctx.db
        .query("enrollments")
        .withIndex("by_course_student", (q) => 
          q.eq("courseId", args.courseId).eq("studentId", userId)
        )
        .first();
      
      if (!enrollment || enrollment.status !== "active") {
        throw new Error("Not enrolled in this course");
      }
    } else if (profile.role === "instructor" && course.instructorId !== userId) {
      throw new Error("Access denied");
    }
    
    return await ctx.db
      .query("discussions")
      .withIndex("by_course", (q) => q.eq("courseId", args.courseId))
      .collect();
  },
});

export const createPost = mutation({
  args: {
    discussionId: v.id("discussions"),
    content: v.string(),
    parentPostId: v.optional(v.id("discussionPosts")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    
    const discussion = await ctx.db.get(args.discussionId);
    if (!discussion) throw new Error("Discussion not found");
    
    if (discussion.isLocked) {
      throw new Error("Discussion is locked");
    }
    
    const course = await ctx.db.get(discussion.courseId);
    if (!course) throw new Error("Course not found");
    
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
    
    if (!profile) throw new Error("Profile not found");
    
    // Check access
    if (profile.role === "student") {
      const enrollment = await ctx.db
        .query("enrollments")
        .withIndex("by_course_student", (q) => 
          q.eq("courseId", discussion.courseId).eq("studentId", userId)
        )
        .first();
      
      if (!enrollment || enrollment.status !== "active") {
        throw new Error("Not enrolled in this course");
      }
    } else if (profile.role === "instructor" && course.instructorId !== userId) {
      throw new Error("Access denied");
    }
    
    return await ctx.db.insert("discussionPosts", {
      discussionId: args.discussionId,
      authorId: userId,
      content: args.content,
      parentPostId: args.parentPostId,
      isEdited: false,
    });
  },
});

export const getPosts = query({
  args: { discussionId: v.id("discussions") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    
    const discussion = await ctx.db.get(args.discussionId);
    if (!discussion) throw new Error("Discussion not found");
    
    const course = await ctx.db.get(discussion.courseId);
    if (!course) throw new Error("Course not found");
    
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
    
    if (!profile) throw new Error("Profile not found");
    
    // Check access
    if (profile.role === "student") {
      const enrollment = await ctx.db
        .query("enrollments")
        .withIndex("by_course_student", (q) => 
          q.eq("courseId", discussion.courseId).eq("studentId", userId)
        )
        .first();
      
      if (!enrollment || enrollment.status !== "active") {
        throw new Error("Not enrolled in this course");
      }
    } else if (profile.role === "instructor" && course.instructorId !== userId) {
      throw new Error("Access denied");
    }
    
    const posts = await ctx.db
      .query("discussionPosts")
      .withIndex("by_discussion", (q) => q.eq("discussionId", args.discussionId))
      .collect();
    
    // Get author profiles for each post
    const postsWithAuthors = [];
    for (const post of posts) {
      const author = await ctx.db.get(post.authorId);
      const authorProfile = await ctx.db
        .query("profiles")
        .withIndex("by_user", (q) => q.eq("userId", post.authorId))
        .first();
      
      postsWithAuthors.push({
        ...post,
        author: author ? { ...author, profile: authorProfile } : null,
      });
    }
    
    return postsWithAuthors;
  },
});
