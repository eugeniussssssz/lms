import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { Toaster } from "sonner";
import { Dashboard } from "./components/Dashboard";
import { ProfileSetup } from "./components/ProfileSetup";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Authenticated>
        <AuthenticatedApp />
      </Authenticated>
      <Unauthenticated>
        <UnauthenticatedApp />
      </Unauthenticated>
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: 'white',
            border: '1px solid #E2E8F0',
            borderRadius: '12px',
            fontFamily: 'Inter, sans-serif',
          }
        }}
      />
    </div>
  );
}

function AuthenticatedApp() {
  const currentUser = useQuery(api.users.getCurrentUser);

  if (currentUser === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-navy via-teal to-navy">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-coral rounded-full animate-spin mx-auto" style={{ animationDelay: '0.5s' }}></div>
          </div>
          <p className="text-white font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!currentUser?.profile) {
    return <ProfileSetup />;
  }

  return <Dashboard user={currentUser} />;
}

function UnauthenticatedApp() {
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
        <div className="flex items-center space-x-4">
          <span className="text-white/80 text-sm hidden md:block">Transform your learning experience</span>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md mx-auto">
          <div className="text-center mb-12 animate-fade-in">
            <div className="mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-coral to-teal rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-glow">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
            </div>
            <h1 className="text-5xl font-bold text-white mb-4 leading-tight">
              Welcome to <span className="gradient-text bg-gradient-to-r from-coral to-white bg-clip-text text-transparent">OneHope</span>
            </h1>
            <p className="text-xl text-white/80 mb-2">Your comprehensive learning management system</p>
            <p className="text-white/60">Engage, learn, and achieve your educational goals</p>
          </div>
          
          <div className="glass-effect rounded-2xl p-8 shadow-large animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <SignInForm />
          </div>

          {/* Features */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <div className="text-center">
              <div className="w-12 h-12 bg-white/10 rounded-xl mx-auto mb-3 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-white font-semibold mb-1">Interactive Learning</h3>
              <p className="text-white/60 text-sm">Engage with dynamic content and real-time collaboration</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-white/10 rounded-xl mx-auto mb-3 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-white font-semibold mb-1">Progress Tracking</h3>
              <p className="text-white/60 text-sm">Monitor your achievements and learning milestones</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-white/10 rounded-xl mx-auto mb-3 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-white font-semibold mb-1">Community</h3>
              <p className="text-white/60 text-sm">Connect with peers and instructors worldwide</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
