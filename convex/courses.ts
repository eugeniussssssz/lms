import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const createCourse = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    code: v.string(),
    credits: v.number(),
    semester: v.string(),
    year: v.number(),
    maxStudents: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
    
    if (!profile || (profile.role !== "instructor" && profile.role !== "admin")) {
      throw new Error("Only instructors and admins can create courses");
    }
    
    return await ctx.db.insert("courses", {
      ...args,
      instructorId: userId,
      isActive: true,
    });
  },
});

export const getCourses = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
    
    if (!profile) return [];
    
    if (profile.role === "admin") {
      return await ctx.db.query("courses").collect();
    } else if (profile.role === "instructor") {
      return await ctx.db
        .query("courses")
        .withIndex("by_instructor", (q) => q.eq("instructorId", userId))
        .collect();
    } else {
      // Student - get enrolled courses
      const enrollments = await ctx.db
        .query("enrollments")
        .withIndex("by_student", (q) => q.eq("studentId", userId))
        .filter((q) => q.eq(q.field("status"), "active"))
        .collect();
      
      const courses = [];
      for (const enrollment of enrollments) {
        const course = await ctx.db.get(enrollment.courseId);
        if (course) courses.push(course);
      }
      return courses;
    }
  },
});

export const getCourse = query({
  args: { courseId: v.id("courses") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    
    const course = await ctx.db.get(args.courseId);
    if (!course) return null;
    
    // Check if user has access to this course
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
    
    if (!profile) throw new Error("Profile not found");
    
    if (profile.role === "admin" || course.instructorId === userId) {
      return course;
    }
    
    // Check if student is enrolled
    const enrollment = await ctx.db
      .query("enrollments")
      .withIndex("by_course_student", (q) => 
        q.eq("courseId", args.courseId).eq("studentId", userId)
      )
      .first();
    
    if (!enrollment || enrollment.status !== "active") {
      throw new Error("Not enrolled in this course");
    }
    
    return course;
  },
});

export const enrollInCourse = mutation({
  args: { courseId: v.id("courses") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
    
    if (!profile || profile.role !== "student") {
      throw new Error("Only students can enroll in courses");
    }
    
    const course = await ctx.db.get(args.courseId);
    if (!course || !course.isActive) {
      throw new Error("Course not available");
    }
    
    // Check if already enrolled
    const existingEnrollment = await ctx.db
      .query("enrollments")
      .withIndex("by_course_student", (q) => 
        q.eq("courseId", args.courseId).eq("studentId", userId)
      )
      .first();
    
    if (existingEnrollment) {
      throw new Error("Already enrolled in this course");
    }
    
    // Check enrollment limit
    if (course.maxStudents) {
      const currentEnrollments = await ctx.db
        .query("enrollments")
        .withIndex("by_course", (q) => q.eq("courseId", args.courseId))
        .filter((q) => q.eq(q.field("status"), "active"))
        .collect();
      
      if (currentEnrollments.length >= course.maxStudents) {
        throw new Error("Course is full");
      }
    }
    
    return await ctx.db.insert("enrollments", {
      courseId: args.courseId,
      studentId: userId,
      enrolledAt: Date.now(),
      status: "active",
    });
  },
});

export const getAvailableCourses = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
    
    if (!profile || profile.role !== "student") return [];
    
    const allCourses = await ctx.db
      .query("courses")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();
    
    const enrollments = await ctx.db
      .query("enrollments")
      .withIndex("by_student", (q) => q.eq("studentId", userId))
      .collect();
    
    const enrolledCourseIds = new Set(enrollments.map(e => e.courseId));
    
    return allCourses.filter(course => !enrolledCourseIds.has(course._id));
  },
});
