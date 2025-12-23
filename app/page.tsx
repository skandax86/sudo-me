import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-violet-900 to-indigo-900 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAzMHYySDI0di0yaDEyek0zNiAyNnYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-50"></div>
      
      {/* Gradient Orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-1000"></div>

      <div className="relative max-w-6xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-block mb-6">
            <span className="text-7xl animate-bounce inline-block">🚀</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
            Tracky
          </h1>
          <p className="text-xl md:text-2xl text-violet-200 max-w-2xl mx-auto mb-4">
            Your AI-powered personal transformation system
          </p>
          <p className="text-violet-300/80 max-w-lg mx-auto">
            Stop juggling 10 apps. Get one personalized plan that tracks fitness, finance, learning, and habits — all in one place.
          </p>
        </div>

        {/* Before → After Section */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {/* Before */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl">😩</span>
              <h3 className="text-xl font-bold text-red-300">Before Tracky</h3>
            </div>
            <ul className="space-y-4 text-violet-200/80">
              <li className="flex items-start gap-3">
                <span className="text-red-400 mt-1">✗</span>
                <span>Wake up late, doom-scroll for an hour</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-red-400 mt-1">✗</span>
                <span>&quot;I&apos;ll start next Monday&quot; every week</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-red-400 mt-1">✗</span>
                <span>No idea where your money goes</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-red-400 mt-1">✗</span>
                <span>Goals written down but never tracked</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-red-400 mt-1">✗</span>
                <span>Motivation dies after Day 3</span>
              </li>
            </ul>
          </div>

          {/* After */}
          <div className="bg-gradient-to-br from-emerald-500/20 to-green-500/10 backdrop-blur-sm border border-emerald-400/30 rounded-3xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl">💪</span>
              <h3 className="text-xl font-bold text-emerald-300">Day 23 with Tracky</h3>
            </div>
            <ul className="space-y-4 text-emerald-100">
              <li className="flex items-start gap-3">
                <span className="text-emerald-400 mt-1">✓</span>
                <span>6AM wakeups on autopilot</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-emerald-400 mt-1">✓</span>
                <span>21-day streak (and counting)</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-emerald-400 mt-1">✓</span>
                <span>₹12,000 saved this month</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-emerald-400 mt-1">✓</span>
                <span>50 LeetCode problems solved</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-emerald-400 mt-1">✓</span>
                <span>Actually enjoying the process</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {[
            { icon: '🤖', label: 'AI Creates Your Plan', desc: 'Personalized to YOU' },
            { icon: '📊', label: 'Track Everything', desc: 'One dashboard' },
            { icon: '🔥', label: 'Streaks & XP', desc: 'Stay motivated' },
            { icon: '💰', label: 'Smart Budgeting', desc: 'Control spending' },
          ].map((feature, idx) => (
            <div 
              key={idx}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5 text-center hover:bg-white/10 transition"
            >
              <span className="text-3xl block mb-3">{feature.icon}</span>
              <span className="text-sm font-semibold text-white block">{feature.label}</span>
              <span className="text-xs text-violet-300">{feature.desc}</span>
            </div>
          ))}
        </div>

        {/* Social Proof */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-4 px-6 py-3 bg-white/5 rounded-full border border-white/10">
            <div className="flex -space-x-2">
              {['🧑‍💻', '👨‍💼', '👩‍🎓', '🧑‍🔬'].map((emoji, idx) => (
                <div key={idx} className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center text-sm border-2 border-violet-900">
                  {emoji}
                </div>
              ))}
            </div>
            <span className="text-violet-200 text-sm">
              Join <span className="font-bold text-white">1,200+</span> people transforming their lives
            </span>
          </div>
        </div>

        {/* CTA Section */}
        <div className="max-w-md mx-auto text-center">
          <Link
            href="/auth/signup"
            className="block w-full text-center bg-gradient-to-r from-violet-500 to-indigo-500 text-white py-4 rounded-2xl font-bold text-lg hover:from-violet-600 hover:to-indigo-600 transition shadow-lg shadow-violet-500/30 mb-4"
          >
            Start Your Transformation 🚀
          </Link>
          <p className="text-violet-300/70 text-sm mb-6">
            Takes 2 minutes • No credit card • Cancel anytime
          </p>
          
          <Link
            href="/auth/login"
            className="inline-block text-violet-300 hover:text-white transition"
          >
            Already have an account? <span className="underline">Log in</span>
          </Link>
        </div>

        {/* Trust Badges */}
        <div className="mt-16 text-center">
          <p className="text-violet-400 text-sm flex items-center justify-center gap-4 flex-wrap">
            <span>✨ AI-powered plans</span>
            <span>•</span>
            <span>📱 Works on all devices</span>
            <span>•</span>
            <span>🔒 Your data stays private</span>
          </p>
        </div>

        {/* Developer Link */}
        <div className="mt-8 text-center">
          <Link
            href="/setup"
            className="inline-flex items-center gap-2 text-violet-400/50 hover:text-violet-300 text-xs transition"
          >
            ⚙️ Developer? View Setup Guide
          </Link>
        </div>
      </div>
    </main>
  );
}
