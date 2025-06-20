import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { toast } from "sonner";
import { CreateCourseModal } from "./CreateCourseModal";

interface CourseListProps {
  userRole: string;
}

export function CourseList({ userRole }: CourseListProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const courses = useQuery(api.courses.getCourses) || [];
  const availableCourses = useQuery(api.courses.getAvailableCourses) || [];
  const enrollInCourse = useMutation(api.courses.enrollInCourse);

  const handleEnroll = async (courseId: Id<"courses">) => {
    try {
      await enrollInCourse({ courseId });
      toast.success("Successfully enrolled in course! 🎉");
    } catch (error) {
      toast.error("Failed to enroll in course");
      console.error(error);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {userRole === "student" ? "My Courses" : "Courses"}
          </h2>
          <p className="text-gray-600">
            {userRole === "student" 
              ? "Continue your learning journey" 
              : "Manage and create courses"}
          </p>
        </div>
        {(userRole === "instructor" || userRole === "admin") && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <span className="text-lg">➕</span>
            <span>Create Course</span>
          </button>
        )}
      </div>

      {/* Enrolled/Teaching Courses */}
      {courses.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <span className="text-2xl mr-2">📚</span>
            {userRole === "student" ? "Enrolled Courses" : "Your Courses"}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div key={course._id} className="bg-white rounded-2xl shadow-soft card-hover overflow-hidden">
                <div className="h-32 bg-gradient-to-br from-navy via-teal to-coral relative">
                  <div className="absolute inset-0 bg-black/20"></div>
                  <div className="absolute top-4 left-4">
                    <span className="badge badge-info">{course.code}</span>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-lg font-bold text-white mb-1 line-clamp-2">{course.title}</h3>
                  </div>
                </div>
                
                <div className="p-6">
                  <p className="text-gray-600 mb-4 line-clamp-3 leading-relaxed">{course.description}</p>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center space-x-1">
                      <span>⭐</span>
                      <span>{course.credits} credits</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span>📅</span>
                      <span>{course.semester} {course.year}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: "65%" }}></div>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Progress: 65%</span>
                      <span className="text-teal font-medium">13/20 lessons</span>
                    </div>
                  </div>
                  
                  <button className="w-full mt-4 bg-gradient-to-r from-teal to-navy text-white py-3 px-4 rounded-xl font-medium hover:shadow-glow transition-all duration-200">
                    Continue Learning
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Available Courses for Students */}
      {userRole === "student" && availableCourses.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <span className="text-2xl mr-2">🌟</span>
            Discover New Courses
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableCourses.map((course) => (
              <div key={course._id} className="bg-white rounded-2xl shadow-soft card-hover overflow-hidden border-2 border-gray-100">
                <div className="h-32 bg-gradient-to-br from-gray-100 to-gray-200 relative">
                  <div className="absolute top-4 left-4">
                    <span className="badge badge-warning">{course.code}</span>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-lg font-bold text-gray-800 mb-1 line-clamp-2">{course.title}</h3>
                  </div>
                </div>
                
                <div className="p-6">
                  <p className="text-gray-600 mb-4 line-clamp-3 leading-relaxed">{course.description}</p>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-6">
                    <div className="flex items-center space-x-1">
                      <span>⭐</span>
                      <span>{course.credits} credits</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span>📅</span>
                      <span>{course.semester} {course.year}</span>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleEnroll(course._id)}
                    className="w-full bg-gradient-to-r from-coral to-orange-500 text-white py-3 px-4 rounded-xl font-medium hover:shadow-glow transition-all duration-200 flex items-center justify-center space-x-2"
                  >
                    <span>🚀</span>
                    <span>Enroll Now</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {courses.length === 0 && (
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl mx-auto mb-6 flex items-center justify-center">
            <span className="text-4xl">📚</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">No courses yet</h3>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            {userRole === "student" 
              ? "Start your learning journey by enrolling in your first course" 
              : "Create your first course to get started with teaching"}
          </p>
          {userRole === "student" && availableCourses.length > 0 && (
            <p className="text-teal font-medium">👆 Check out the available courses above!</p>
          )}
        </div>
      )}

      {showCreateModal && (
        <CreateCourseModal onClose={() => setShowCreateModal(false)} />
      )}
    </div>
  );
}
