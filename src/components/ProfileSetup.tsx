import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

export function ProfileSetup() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [role, setRole] = useState<"student" | "instructor" | "admin">("student");
  const [department, setDepartment] = useState("");
  const [bio, setBio] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createProfile = useMutation(api.users.createProfile);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      await createProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        role,
        department: department.trim() || undefined,
        bio: bio.trim() || undefined,
      });
      toast.success("Profile created successfully!");
    } catch (error) {
      toast.error("Failed to create profile");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRoleIcon = (roleValue: string) => {
    switch (roleValue) {
      case "student": return "🎓";
      case "instructor": return "👨‍🏫";
      case "admin": return "⚙️";
      default: return "👤";
    }
  };

  const getRoleDescription = (roleValue: string) => {
    switch (roleValue) {
      case "student": return "Access courses, assignments, and learning materials";
      case "instructor": return "Create and manage courses, assignments, and student progress";
      case "admin": return "Full system access with user and content management";
      default: return "";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy via-teal to-navy relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute top-40 right-32 w-24 h-24 bg-coral/20 rounded-full blur-lg"></div>
        <div className="absolute bottom-32 left-1/3 w-40 h-40 bg-teal/10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-20 right-20 w-28 h-28 bg-white/5 rounded-full blur-xl"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 glass-effect border-b border-white/10 h-16 flex justify-between items-center px-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-coral to-teal rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">O</span>
          </div>
          <h2 className="text-xl font-bold text-white">OneHope LMS</h2>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 flex items-center justify-center min-h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-2xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-8 animate-fade-in">
            <div className="w-20 h-20 bg-gradient-to-br from-coral to-teal rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-glow">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">Complete Your Profile</h1>
            <p className="text-xl text-white/80 mb-2">Welcome to OneHope!</p>
            <p className="text-white/60">Tell us a bit about yourself to personalize your learning experience</p>
          </div>

          {/* Form Card */}
          <div className="glass-effect rounded-2xl p-8 shadow-large animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Fields Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="profile-form-group">
                  <label htmlFor="firstName" className="profile-form-label">
                    <span className="text-lg mr-2">👤</span>
                    First Name *
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="profile-form-input"
                    placeholder="Enter your first name"
                  />
                </div>

                <div className="profile-form-group">
                  <label htmlFor="lastName" className="profile-form-label">
                    <span className="text-lg mr-2">👤</span>
                    Last Name *
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="profile-form-input"
                    placeholder="Enter your last name"
                  />
                </div>
              </div>

              {/* Role Selection */}
              <div className="profile-form-group">
                <label htmlFor="role" className="profile-form-label">
                  <span className="text-lg mr-2">{getRoleIcon(role)}</span>
                  Select Your Role *
                </label>
                <select
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value as "student" | "instructor" | "admin")}
                  className="profile-form-input"
                >
                  <option value="student">🎓 Student</option>
                  <option value="instructor">👨‍🏫 Instructor</option>
                  <option value="admin">⚙️ Administrator</option>
                </select>
                <p className="mt-2 text-sm text-charcoal bg-white p-3 rounded-lg border border-gray-200">
                  {getRoleDescription(role)}
                </p>
              </div>

              {/* Department Field */}
              <div className="profile-form-group">
                <label htmlFor="department" className="profile-form-label">
                  <span className="text-lg mr-2">🏢</span>
                  Department
                  <span className="text-gray-600 text-sm ml-1">(Optional)</span>
                </label>
                <input
                  id="department"
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="profile-form-input"
                  placeholder="e.g., Computer Science, Mathematics, Business"
                />
              </div>

              {/* Bio Field */}
              <div className="profile-form-group">
                <label htmlFor="bio" className="profile-form-label">
                  <span className="text-lg mr-2">📝</span>
                  Bio
                  <span className="text-gray-600 text-sm ml-1">(Optional)</span>
                </label>
                <textarea
                  id="bio"
                  rows={4}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="profile-form-input resize-none"
                  placeholder="Tell us about yourself, your interests, or your goals..."
                />
                <div className="mt-1 text-right text-sm text-gray-600">
                  {bio.length}/500 characters
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-6">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="profile-submit-btn group"
                >
                  <span className="flex items-center justify-center space-x-2">
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Creating Profile...</span>
                      </>
                    ) : (
                      <>
                        <span>🚀</span>
                        <span>Complete Setup & Get Started</span>
                      </>
                    )}
                  </span>
                </button>
              </div>
            </form>
          </div>

          {/* Footer */}
          <div className="text-center mt-8 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <p className="text-white/60 text-sm">
              By completing your profile, you agree to our terms of service and privacy policy
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
