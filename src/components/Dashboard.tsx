import { useState } from "react";
import { SignOutButton } from "../SignOutButton";
import { CourseList } from "./CourseList";
import { AssignmentList } from "./AssignmentList";
import { MessageList } from "./MessageList";
import { DiscussionList } from "./DiscussionList";
import { NotificationList } from "./NotificationList";
import { AdminPanel } from "./AdminPanel";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

interface DashboardProps {
  user: any;
}

export function Dashboard({ user }: DashboardProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const notifications = useQuery(api.notifications.getNotifications) || [];
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const tabs = [
    { id: "overview", label: "Overview", icon: "🏠" },
    { id: "courses", label: "Courses", icon: "📚" },
    { id: "assignments", label: "Assignments", icon: "📝" },
    { id: "discussions", label: "Discussions", icon: "💬" },
    { id: "messages", label: "Messages", icon: "✉️" },
    { id: "notifications", label: "Notifications", icon: "🔔", badge: unreadCount },
    ...(user.profile?.role === "admin" ? [{ id: "admin", label: "Admin", icon: "⚙️" }] : []),
  ];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const getProgressData = () => {
    // Mock progress data - in real app, this would come from API
    return {
      coursesCompleted: 3,
      totalCourses: 5,
      assignmentsCompleted: 12,
      totalAssignments: 15,
      streak: 7,
      points: 1250,
      level: 5,
    };
  };

  const progress = getProgressData();

  return (
    <div className="min-h-screen bg-ivory">
      {/* Header */}
      <header className="bg-white border-b border-gray-300 sticky top-0 z-40 shadow-soft">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-coral to-teal rounded-xl flex items-center justify-center shadow-medium">
                <span className="text-white font-bold">O</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">OneHope LMS</h1>
                <p className="text-sm text-gray-500 hidden sm:block">Learning Management System</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {user.profile?.firstName} {user.profile?.lastName}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">{user.profile?.role}</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-navy to-teal rounded-full flex items-center justify-center text-white font-semibold shadow-medium">
                  {user.profile?.firstName?.[0]}{user.profile?.lastName?.[0]}
                </div>
              </div>
              <SignOutButton />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        {activeTab === "overview" && (
          <div className="mb-8 animate-fade-in">
            <div className="bg-gradient-to-r from-navy to-teal rounded-2xl p-8 text-white shadow-large">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                <div className="mb-6 md:mb-0">
                  <h2 className="text-3xl font-bold mb-2">
                    {getGreeting()}, {user.profile?.firstName}! 👋
                  </h2>
                  <p className="text-white/80 text-lg">Ready to continue your learning journey?</p>
                </div>
                <div className="flex items-center space-x-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{progress.streak}</div>
                    <div className="text-white/80 text-sm">Day Streak</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{progress.points}</div>
                    <div className="text-white/80 text-sm">Points</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">Level {progress.level}</div>
                    <div className="text-white/80 text-sm">Current</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-soft p-2">
            <nav className="flex space-x-2 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex items-center space-x-2 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 whitespace-nowrap ${
                    activeTab === tab.id
                      ? "bg-gradient-to-r from-navy to-teal text-white shadow-medium"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  <span className="text-lg">{tab.icon}</span>
                  <span>{tab.label}</span>
                  {tab.badge && tab.badge > 0 && (
                    <span className="absolute -top-1 -right-1 bg-coral text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                      {tab.badge}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content Area */}
        <div className="animate-fade-in">
          {activeTab === "overview" && <OverviewContent user={user} progress={progress} />}
          {activeTab === "courses" && <CourseList userRole={user.profile?.role} />}
          {activeTab === "assignments" && <AssignmentList userRole={user.profile?.role} />}
          {activeTab === "discussions" && <DiscussionList userRole={user.profile?.role} />}
          {activeTab === "messages" && <MessageList />}
          {activeTab === "notifications" && <NotificationList />}
          {activeTab === "admin" && user.profile?.role === "admin" && <AdminPanel />}
        </div>
      </div>
    </div>
  );
}

function OverviewContent({ user, progress }: { user: any; progress: any }) {
  return (
    <div className="space-y-8">
      {/* Progress Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-soft card-hover">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-teal/20 to-teal/10 rounded-xl flex items-center justify-center">
              <span className="text-2xl">📚</span>
            </div>
            <span className="text-teal font-semibold text-sm">Courses</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-2xl font-bold text-gray-900">{progress.coursesCompleted}</span>
              <span className="text-gray-500 text-sm">of {progress.totalCourses}</span>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${(progress.coursesCompleted / progress.totalCourses) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-soft card-hover">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-coral/20 to-coral/10 rounded-xl flex items-center justify-center">
              <span className="text-2xl">📝</span>
            </div>
            <span className="text-coral font-semibold text-sm">Assignments</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-2xl font-bold text-gray-900">{progress.assignmentsCompleted}</span>
              <span className="text-gray-500 text-sm">of {progress.totalAssignments}</span>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${(progress.assignmentsCompleted / progress.totalAssignments) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-soft card-hover">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-navy/20 to-navy/10 rounded-xl flex items-center justify-center">
              <span className="text-2xl">🔥</span>
            </div>
            <span className="text-navy font-semibold text-sm">Streak</span>
          </div>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-gray-900">{progress.streak}</span>
              <span className="text-gray-500 text-sm">days</span>
            </div>
            <p className="text-gray-600 text-sm">Keep it up! 🎉</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-soft card-hover">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-400/20 to-yellow-400/10 rounded-xl flex items-center justify-center">
              <span className="text-2xl">⭐</span>
            </div>
            <span className="text-yellow-600 font-semibold text-sm">Level</span>
          </div>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-gray-900">{progress.level}</span>
              <span className="text-gray-500 text-sm">{progress.points} pts</span>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${(progress.points % 500) / 5}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl p-8 shadow-soft">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="flex items-center space-x-3 p-4 rounded-xl border-2 border-gray-200 hover:border-teal hover:bg-teal/5 transition-all duration-200">
            <div className="w-10 h-10 bg-teal/10 rounded-lg flex items-center justify-center">
              <span className="text-lg">📖</span>
            </div>
            <span className="font-medium text-gray-700">Browse Courses</span>
          </button>
          
          <button className="flex items-center space-x-3 p-4 rounded-xl border-2 border-gray-200 hover:border-coral hover:bg-coral/5 transition-all duration-200">
            <div className="w-10 h-10 bg-coral/10 rounded-lg flex items-center justify-center">
              <span className="text-lg">✍️</span>
            </div>
            <span className="font-medium text-gray-700">Submit Assignment</span>
          </button>
          
          <button className="flex items-center space-x-3 p-4 rounded-xl border-2 border-gray-200 hover:border-navy hover:bg-navy/5 transition-all duration-200">
            <div className="w-10 h-10 bg-navy/10 rounded-lg flex items-center justify-center">
              <span className="text-lg">💬</span>
            </div>
            <span className="font-medium text-gray-700">Join Discussion</span>
          </button>
          
          <button className="flex items-center space-x-3 p-4 rounded-xl border-2 border-gray-200 hover:border-purple-500 hover:bg-purple-50 transition-all duration-200">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-lg">📊</span>
            </div>
            <span className="font-medium text-gray-700">View Progress</span>
          </button>
        </div>
      </div>

      {/* Achievements */}
      <div className="bg-white rounded-2xl p-8 shadow-soft">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Recent Achievements</h3>
        <div className="space-y-4">
          <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-teal/10 to-teal/5 rounded-xl">
            <div className="w-12 h-12 bg-teal rounded-full flex items-center justify-center">
              <span className="text-white text-xl">🏆</span>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Course Completion Master</h4>
              <p className="text-gray-600 text-sm">Completed 3 courses this semester</p>
            </div>
            <div className="ml-auto">
              <span className="badge badge-success">+100 pts</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-coral/10 to-coral/5 rounded-xl">
            <div className="w-12 h-12 bg-coral rounded-full flex items-center justify-center">
              <span className="text-white text-xl">🔥</span>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Week Warrior</h4>
              <p className="text-gray-600 text-sm">Maintained a 7-day learning streak</p>
            </div>
            <div className="ml-auto">
              <span className="badge badge-warning">+50 pts</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
