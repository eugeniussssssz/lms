import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

interface DiscussionListProps {
  userRole: string;
}

export function DiscussionList({ userRole }: DiscussionListProps) {
  const [selectedCourse, setSelectedCourse] = useState<Id<"courses"> | "">("");
  const courses = useQuery(api.courses.getCourses) || [];
  const discussions = useQuery(
    api.discussions.getDiscussions,
    selectedCourse ? { courseId: selectedCourse as Id<"courses"> } : "skip"
  ) || [];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Discussions</h2>
          <p className="text-gray-600">Engage in course discussions and forums</p>
        </div>
      </div>

      {/* Course Selection */}
      <div className="bg-white rounded-2xl shadow-soft p-6">
        <label htmlFor="course-select" className="form-label flex items-center space-x-2">
          <span className="text-lg">📚</span>
          <span>Select Course</span>
        </label>
        <select
          id="course-select"
          value={selectedCourse}
          onChange={(e) => setSelectedCourse(e.target.value as Id<"courses"> | "")}
          className="form-input mt-2"
        >
          <option value="">Choose a course...</option>
          {courses.map((course) => (
            <option key={course._id} value={course._id}>
              {course.code} - {course.title}
            </option>
          ))}
        </select>
      </div>

      {/* Discussions List */}
      {selectedCourse && (
        <div className="space-y-4">
          {discussions.length > 0 ? (
            discussions.map((discussion) => (
              <div key={discussion._id} className="bg-white rounded-2xl shadow-soft card-hover p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">{discussion.title}</h3>
                  <div className="flex items-center space-x-2">
                    {discussion.isPinned && (
                      <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                        Pinned
                      </span>
                    )}
                    {discussion.isLocked && (
                      <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                        Locked
                      </span>
                    )}
                  </div>
                </div>
                {discussion.description && (
                  <p className="text-gray-600 mb-4">{discussion.description}</p>
                )}
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span>Created: {new Date(discussion._creationTime).toLocaleDateString()}</span>
                </div>
                <div className="mt-6">
                  <button className="bg-gradient-to-r from-teal to-navy text-white px-6 py-3 rounded-xl font-medium hover:shadow-glow transition-all duration-200">
                    View Discussion
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl mx-auto mb-6 flex items-center justify-center">
                <span className="text-4xl">💬</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">No discussions yet</h3>
              <p className="text-gray-600 max-w-md mx-auto">
                {userRole === "student" 
                  ? "No discussions have been created for this course yet. Check back later!" 
                  : "Create your first discussion to get started with this course"}
              </p>
            </div>
          )}
        </div>
      )}

      {!selectedCourse && (
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl mx-auto mb-6 flex items-center justify-center">
            <span className="text-4xl">📚</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Select a course</h3>
          <p className="text-gray-600 max-w-md mx-auto">Choose a course from the dropdown above to view its discussions and join the conversation</p>
        </div>
      )}
    </div>
  );
}
