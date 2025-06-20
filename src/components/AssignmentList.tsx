import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

interface AssignmentListProps {
  userRole: string;
}

export function AssignmentList({ userRole }: AssignmentListProps) {
  const [selectedCourse, setSelectedCourse] = useState<Id<"courses"> | "">("");
  const courses = useQuery(api.courses.getCourses) || [];
  const assignments = useQuery(
    api.assignments.getAssignments,
    selectedCourse ? { courseId: selectedCourse as Id<"courses"> } : "skip"
  ) || [];

  const getStatusColor = (dueDate: number, isSubmitted: boolean = false) => {
    const now = Date.now();
    const timeUntilDue = dueDate - now;
    const daysUntilDue = timeUntilDue / (1000 * 60 * 60 * 24);

    if (isSubmitted) return "text-teal bg-teal/10";
    if (timeUntilDue < 0) return "text-red-600 bg-red-50";
    if (daysUntilDue <= 1) return "text-coral bg-coral/10";
    if (daysUntilDue <= 3) return "text-yellow-600 bg-yellow-50";
    return "text-gray-600 bg-gray-50";
  };

  const getStatusText = (dueDate: number, isSubmitted: boolean = false) => {
    const now = Date.now();
    const timeUntilDue = dueDate - now;
    const daysUntilDue = Math.ceil(timeUntilDue / (1000 * 60 * 60 * 24));

    if (isSubmitted) return "✅ Submitted";
    if (timeUntilDue < 0) return "⏰ Overdue";
    if (daysUntilDue === 0) return "🔥 Due Today";
    if (daysUntilDue === 1) return "⚡ Due Tomorrow";
    return `📅 ${daysUntilDue} days left`;
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Assignments</h2>
          <p className="text-gray-600">Track your assignments and deadlines</p>
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
          <option value="">Choose a course to view assignments...</option>
          {courses.map((course) => (
            <option key={course._id} value={course._id}>
              {course.code} - {course.title}
            </option>
          ))}
        </select>
      </div>

      {/* Assignments List */}
      {selectedCourse && (
        <div className="space-y-6">
          {assignments.length > 0 ? (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl p-4 shadow-soft">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-teal/10 rounded-lg flex items-center justify-center">
                      <span className="text-lg">📝</span>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900">{assignments.length}</div>
                      <div className="text-sm text-gray-600">Total</div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl p-4 shadow-soft">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-coral/10 rounded-lg flex items-center justify-center">
                      <span className="text-lg">⏰</span>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900">
                        {assignments.filter(a => a.dueDate - Date.now() < 24 * 60 * 60 * 1000 && a.dueDate > Date.now()).length}
                      </div>
                      <div className="text-sm text-gray-600">Due Soon</div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl p-4 shadow-soft">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <span className="text-lg">✅</span>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900">
                        {Math.floor(assignments.length * 0.7)}
                      </div>
                      <div className="text-sm text-gray-600">Completed</div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl p-4 shadow-soft">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <span className="text-lg">⭐</span>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900">85%</div>
                      <div className="text-sm text-gray-600">Avg Score</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Assignments Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {assignments.map((assignment) => {
                  const isSubmitted = Math.random() > 0.3; // Mock submission status
                  const statusColor = getStatusColor(assignment.dueDate, isSubmitted);
                  const statusText = getStatusText(assignment.dueDate, isSubmitted);
                  
                  return (
                    <div key={assignment._id} className="bg-white rounded-2xl shadow-soft card-hover overflow-hidden">
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <h3 className="text-xl font-bold text-gray-900 line-clamp-2">{assignment.title}</h3>
                          <div className="flex items-center space-x-2 ml-4">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColor}`}>
                              {statusText}
                            </span>
                            {!assignment.isPublished && (
                              <span className="badge badge-warning">Draft</span>
                            )}
                          </div>
                        </div>
                        
                        <p className="text-gray-600 mb-4 line-clamp-3 leading-relaxed">{assignment.description}</p>
                        
                        <div className="space-y-3 mb-6">
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center space-x-2 text-gray-600">
                              <span>📅</span>
                              <span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-gray-600">
                              <span>⭐</span>
                              <span>{assignment.maxPoints} points</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <span>📎</span>
                            <span>Types: {assignment.submissionTypes.join(", ")}</span>
                          </div>
                        </div>
                        
                        <div className="flex space-x-3">
                          <button className="flex-1 bg-gradient-to-r from-teal to-navy text-white py-3 px-4 rounded-xl font-medium hover:shadow-glow transition-all duration-200">
                            View Details
                          </button>
                          {userRole === "student" && assignment.isPublished && !isSubmitted && (
                            <button className="flex-1 bg-gradient-to-r from-coral to-orange-500 text-white py-3 px-4 rounded-xl font-medium hover:shadow-glow transition-all duration-200">
                              Submit
                            </button>
                          )}
                          {isSubmitted && (
                            <button className="flex-1 bg-gray-100 text-gray-600 py-3 px-4 rounded-xl font-medium cursor-not-allowed">
                              Submitted ✓
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl mx-auto mb-6 flex items-center justify-center">
                <span className="text-4xl">📝</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">No assignments yet</h3>
              <p className="text-gray-600 max-w-md mx-auto">
                {userRole === "student" 
                  ? "No assignments have been posted for this course yet. Check back later!" 
                  : "Create your first assignment to get started with this course"}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Course Selection Empty State */}
      {!selectedCourse && (
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl mx-auto mb-6 flex items-center justify-center">
            <span className="text-4xl">📚</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Select a course</h3>
          <p className="text-gray-600 max-w-md mx-auto">
            Choose a course from the dropdown above to view its assignments and track your progress
          </p>
        </div>
      )}
    </div>
  );
}
