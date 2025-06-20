import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const createAssignment = mutation({
  args: {
    courseId: v.id("courses"),
    title: v.string(),
    description: v.string(),
    dueDate: v.number(),
    maxPoints: v.number(),
    instructions: v.optional(v.string()),
    allowLateSubmissions: v.boolean(),
    submissionTypes: v.array(v.union(v.literal("file"), v.literal("text"), v.literal("url"))),
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
      throw new Error("Only instructors and admins can create assignments");
    }
    
    if (profile.role === "instructor" && course.instructorId !== userId) {
      throw new Error("You can only create assignments for your own courses");
    }
    
    return await ctx.db.insert("assignments", {
      ...args,
      isPublished: false,
    });
  },
});

export const getAssignments = query({
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
    
    let assignments = await ctx.db
      .query("assignments")
      .withIndex("by_course", (q) => q.eq("courseId", args.courseId))
      .collect();
    
    // Students only see published assignments
    if (profile.role === "student") {
      assignments = assignments.filter(a => a.isPublished);
    }
    
    return assignments;
  },
});

export const submitAssignment = mutation({
  args: {
    assignmentId: v.id("assignments"),
    content: v.optional(v.string()),
    url: v.optional(v.string()),
    attachments: v.optional(v.array(v.id("_storage"))),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    
    const assignment = await ctx.db.get(args.assignmentId);
    if (!assignment) throw new Error("Assignment not found");
    
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
    
    if (!profile || profile.role !== "student") {
      throw new Error("Only students can submit assignments");
    }
    
    // Check if student is enrolled in the course
    const enrollment = await ctx.db
      .query("enrollments")
      .withIndex("by_course_student", (q) => 
        q.eq("courseId", assignment.courseId).eq("studentId", userId)
      )
      .first();
    
    if (!enrollment || enrollment.status !== "active") {
      throw new Error("Not enrolled in this course");
    }
    
    // Check if assignment is published
    if (!assignment.isPublished) {
      throw new Error("Assignment is not yet available");
    }
    
    // Check if already submitted
    const existingSubmission = await ctx.db
      .query("submissions")
      .withIndex("by_assignment_student", (q) => 
        q.eq("assignmentId", args.assignmentId).eq("studentId", userId)
      )
      .first();
    
    if (existingSubmission) {
      // Update existing submission
      await ctx.db.patch(existingSubmission._id, {
        content: args.content,
        url: args.url,
        attachments: args.attachments,
        submittedAt: Date.now(),
        status: "submitted",
      });
      return existingSubmission._id;
    } else {
      // Create new submission
      return await ctx.db.insert("submissions", {
        assignmentId: args.assignmentId,
        studentId: userId,
        content: args.content,
        url: args.url,
        attachments: args.attachments,
        submittedAt: Date.now(),
        status: "submitted",
      });
    }
  },
});

export const gradeSubmission = mutation({
  args: {
    submissionId: v.id("submissions"),
    grade: v.number(),
    feedback: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    
    const submission = await ctx.db.get(args.submissionId);
    if (!submission) throw new Error("Submission not found");
    
    const assignment = await ctx.db.get(submission.assignmentId);
    if (!assignment) throw new Error("Assignment not found");
    
    const course = await ctx.db.get(assignment.courseId);
    if (!course) throw new Error("Course not found");
    
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
    
    if (!profile || (profile.role !== "instructor" && profile.role !== "admin")) {
      throw new Error("Only instructors and admins can grade submissions");
    }
    
    if (profile.role === "instructor" && course.instructorId !== userId) {
      throw new Error("You can only grade submissions for your own courses");
    }
    
    await ctx.db.patch(args.submissionId, {
      grade: args.grade,
      feedback: args.feedback,
      gradedAt: Date.now(),
      gradedBy: userId,
      status: "graded",
    });
    
    // Create notification for student
    await ctx.db.insert("notifications", {
      userId: submission.studentId,
      type: "assignment_graded",
      title: "Assignment Graded",
      message: `Your submission for "${assignment.title}" has been graded.`,
      isRead: false,
      relatedId: args.submissionId,
    });
  },
});

export const getSubmissions = query({
  args: { assignmentId: v.id("assignments") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    
    const assignment = await ctx.db.get(args.assignmentId);
    if (!assignment) throw new Error("Assignment not found");
    
    const course = await ctx.db.get(assignment.courseId);
    if (!course) throw new Error("Course not found");
    
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
    
    if (!profile) throw new Error("Profile not found");
    
    if (profile.role === "student") {
      // Students can only see their own submission
      return await ctx.db
        .query("submissions")
        .withIndex("by_assignment_student", (q) => 
          q.eq("assignmentId", args.assignmentId).eq("studentId", userId)
        )
        .collect();
    } else if (profile.role === "instructor" && course.instructorId === userId) {
      // Instructors can see all submissions for their courses
      return await ctx.db
        .query("submissions")
        .withIndex("by_assignment", (q) => q.eq("assignmentId", args.assignmentId))
        .collect();
    } else if (profile.role === "admin") {
      // Admins can see all submissions
      return await ctx.db
        .query("submissions")
        .withIndex("by_assignment", (q) => q.eq("assignmentId", args.assignmentId))
        .collect();
    } else {
      throw new Error("Access denied");
    }
  },
});

export const publishAssignment = mutation({
  args: { assignmentId: v.id("assignments") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    
    const assignment = await ctx.db.get(args.assignmentId);
    if (!assignment) throw new Error("Assignment not found");
    
    const course = await ctx.db.get(assignment.courseId);
    if (!course) throw new Error("Course not found");
    
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
    
    if (!profile || (profile.role !== "instructor" && profile.role !== "admin")) {
      throw new Error("Only instructors and admins can publish assignments");
    }
    
    if (profile.role === "instructor" && course.instructorId !== userId) {
      throw new Error("You can only publish assignments for your own courses");
    }
    
    await ctx.db.patch(args.assignmentId, { isPublished: true });
    
    // Notify all enrolled students
    const enrollments = await ctx.db
      .query("enrollments")
      .withIndex("by_course", (q) => q.eq("courseId", assignment.courseId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .collect();
    
    for (const enrollment of enrollments) {
      await ctx.db.insert("notifications", {
        userId: enrollment.studentId,
        type: "assignment_due",
        title: "New Assignment",
        message: `New assignment "${assignment.title}" is now available in ${course.title}.`,
        isRead: false,
        relatedId: args.assignmentId,
      });
    }
  },
});
