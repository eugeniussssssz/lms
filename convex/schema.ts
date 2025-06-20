import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  // User profiles with roles
  profiles: defineTable({
    userId: v.id("users"),
    role: v.union(v.literal("admin"), v.literal("instructor"), v.literal("student")),
    firstName: v.string(),
    lastName: v.string(),
    bio: v.optional(v.string()),
    avatar: v.optional(v.id("_storage")),
    department: v.optional(v.string()),
    phoneNumber: v.optional(v.string()),
  }).index("by_user", ["userId"]),

  // Courses
  courses: defineTable({
    title: v.string(),
    description: v.string(),
    instructorId: v.id("users"),
    code: v.string(), // e.g., "CS101"
    credits: v.number(),
    semester: v.string(),
    year: v.number(),
    isActive: v.boolean(),
    maxStudents: v.optional(v.number()),
    syllabus: v.optional(v.id("_storage")),
    coverImage: v.optional(v.id("_storage")),
  })
    .index("by_instructor", ["instructorId"])
    .index("by_code", ["code"])
    .index("by_active", ["isActive"]),

  // Course enrollments
  enrollments: defineTable({
    courseId: v.id("courses"),
    studentId: v.id("users"),
    enrolledAt: v.number(),
    status: v.union(v.literal("active"), v.literal("dropped"), v.literal("completed")),
    grade: v.optional(v.string()),
  })
    .index("by_course", ["courseId"])
    .index("by_student", ["studentId"])
    .index("by_course_student", ["courseId", "studentId"]),

  // Assignments
  assignments: defineTable({
    courseId: v.id("courses"),
    title: v.string(),
    description: v.string(),
    dueDate: v.number(),
    maxPoints: v.number(),
    instructions: v.optional(v.string()),
    attachments: v.optional(v.array(v.id("_storage"))),
    isPublished: v.boolean(),
    allowLateSubmissions: v.boolean(),
    submissionTypes: v.array(v.union(v.literal("file"), v.literal("text"), v.literal("url"))),
  }).index("by_course", ["courseId"]),

  // Assignment submissions
  submissions: defineTable({
    assignmentId: v.id("assignments"),
    studentId: v.id("users"),
    submittedAt: v.number(),
    content: v.optional(v.string()),
    attachments: v.optional(v.array(v.id("_storage"))),
    url: v.optional(v.string()),
    status: v.union(v.literal("submitted"), v.literal("graded"), v.literal("returned")),
    grade: v.optional(v.number()),
    feedback: v.optional(v.string()),
    gradedAt: v.optional(v.number()),
    gradedBy: v.optional(v.id("users")),
  })
    .index("by_assignment", ["assignmentId"])
    .index("by_student", ["studentId"])
    .index("by_assignment_student", ["assignmentId", "studentId"]),

  // Discussion forums
  discussions: defineTable({
    courseId: v.id("courses"),
    title: v.string(),
    description: v.optional(v.string()),
    createdBy: v.id("users"),
    isPinned: v.boolean(),
    isLocked: v.boolean(),
  }).index("by_course", ["courseId"]),

  // Discussion posts
  discussionPosts: defineTable({
    discussionId: v.id("discussions"),
    authorId: v.id("users"),
    content: v.string(),
    parentPostId: v.optional(v.id("discussionPosts")),
    attachments: v.optional(v.array(v.id("_storage"))),
    isEdited: v.boolean(),
    editedAt: v.optional(v.number()),
  })
    .index("by_discussion", ["discussionId"])
    .index("by_parent", ["parentPostId"]),

  // Messages (private messaging)
  messages: defineTable({
    senderId: v.id("users"),
    recipientId: v.id("users"),
    subject: v.string(),
    content: v.string(),
    isRead: v.boolean(),
    attachments: v.optional(v.array(v.id("_storage"))),
    threadId: v.optional(v.string()),
  })
    .index("by_recipient", ["recipientId"])
    .index("by_sender", ["senderId"])
    .index("by_thread", ["threadId"]),

  // Notifications
  notifications: defineTable({
    userId: v.id("users"),
    type: v.union(
      v.literal("assignment_due"),
      v.literal("assignment_graded"),
      v.literal("new_message"),
      v.literal("discussion_reply"),
      v.literal("course_announcement"),
      v.literal("enrollment_confirmed")
    ),
    title: v.string(),
    message: v.string(),
    isRead: v.boolean(),
    relatedId: v.optional(v.string()), // ID of related entity
    actionUrl: v.optional(v.string()),
  }).index("by_user", ["userId"]),

  // Course announcements
  announcements: defineTable({
    courseId: v.id("courses"),
    title: v.string(),
    content: v.string(),
    authorId: v.id("users"),
    isPinned: v.boolean(),
    attachments: v.optional(v.array(v.id("_storage"))),
  }).index("by_course", ["courseId"]),

  // Grades
  grades: defineTable({
    courseId: v.id("courses"),
    studentId: v.id("users"),
    assignmentId: v.optional(v.id("assignments")),
    gradeType: v.union(v.literal("assignment"), v.literal("quiz"), v.literal("exam"), v.literal("participation")),
    points: v.number(),
    maxPoints: v.number(),
    gradedBy: v.id("users"),
    comments: v.optional(v.string()),
  })
    .index("by_course_student", ["courseId", "studentId"])
    .index("by_assignment", ["assignmentId"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
