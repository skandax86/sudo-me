import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-violet-900 to-indigo-900 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAzMHYySDI0di0yaDEyek0zNiAyNnYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-50"></div>
      
      {/* Gradient Orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-1000"></div>

      <div className="relative flex items-center justify-center min-h-screen px-4">
        <div className="max-w-lg w-full">
          {/* Hero */}
          <div className="text-center mb-12">
            <div className="inline-block mb-6">
              <span className="text-7xl animate-bounce inline-block">🚀</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
              Tracky
            </h1>
            <p className="text-xl text-violet-200 max-w-md mx-auto">
              Your personalized journey to becoming the best version of yourself
            </p>
          </div>

          {/* Features */}
          <div className="grid grid-cols-2 gap-4 mb-10">
            {[
              { icon: '🎯', label: 'Custom Goals' },
              { icon: '📊', label: 'Track Progress' },
              { icon: '💪', label: 'Build Habits' },
              { icon: '💰', label: 'Finance' },
            ].map((feature, idx) => (
              <div 
                key={idx}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 text-center"
              >
                <span className="text-2xl block mb-2">{feature.icon}</span>
                <span className="text-sm text-violet-200 font-medium">{feature.label}</span>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="space-y-4">
            <Link
              href="/auth/signup"
              className="block w-full text-center bg-gradient-to-r from-violet-500 to-indigo-500 text-white py-4 rounded-2xl font-bold text-lg hover:from-violet-600 hover:to-indigo-600 transition shadow-lg shadow-violet-500/30"
            >
              Start Your Journey 🚀
            </Link>
            <Link
              href="/auth/login"
              className="block w-full text-center bg-white/10 backdrop-blur-sm border border-white/20 text-white py-4 rounded-2xl font-semibold hover:bg-white/20 transition"
            >
              I Already Have an Account
            </Link>
          </div>

          {/* Setup Link */}
          <div className="mt-8 text-center">
            <Link
              href="/setup"
              className="inline-flex items-center gap-2 text-violet-300 hover:text-white text-sm transition"
            >
              ⚙️ Developer? View Setup Guide
            </Link>
          </div>

          {/* Trust Badge */}
          <div className="mt-12 text-center">
            <p className="text-violet-400 text-sm">
              ✨ AI-powered personalized plans • 📈 Data-driven insights • 🔒 Your data is private
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
