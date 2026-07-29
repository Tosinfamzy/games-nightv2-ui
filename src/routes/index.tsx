import { Link, createFileRoute } from '@tanstack/react-router'
import { SignInButton, SignedIn, SignedOut } from '@clerk/clerk-react'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero: the two things a visitor can actually do */}
      <section className="bg-slate-900 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="max-w-2xl">
            <p className="text-indigo-300 font-semibold tracking-wide uppercase text-sm mb-3">
              Games Night
            </p>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-balance">
              Run a game night everyone can follow live.
            </h1>
            <p className="mt-4 text-lg text-slate-300 max-w-xl">
              Teams, rounds, turns and scoring — controlled by the host and
              updated on every player's screen in real time. No app to install.
            </p>
          </div>

          {/* Two audiences, two clear paths */}
          <div className="mt-10 grid gap-4 sm:grid-cols-2 max-w-3xl">
            {/* Players — no account needed */}
            <div className="rounded-xl bg-white/5 ring-1 ring-white/10 p-6">
              <h2 className="text-lg font-semibold text-white">
                Playing tonight?
              </h2>
              <p className="mt-1 text-sm text-slate-300">
                Enter the join code your host shared. No account needed.
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <Link
                  to="/join"
                  className="inline-flex items-center rounded-lg bg-emerald-500 px-5 py-2.5 font-semibold text-white hover:bg-emerald-400 transition-colors"
                >
                  Join with a code
                </Link>
                <Link
                  to="/rejoin"
                  className="text-sm font-medium text-slate-300 hover:text-white"
                >
                  Rejoin a session
                </Link>
              </div>
            </div>

            {/* Hosts — Clerk sign-in */}
            <div className="rounded-xl bg-white/5 ring-1 ring-white/10 p-6">
              <h2 className="text-lg font-semibold text-white">
                Hosting the night?
              </h2>
              <SignedOut>
                <p className="mt-1 text-sm text-slate-300">
                  Sign in to create a session, invite players and run the games.
                </p>
                <div className="mt-4">
                  <SignInButton mode="modal">
                    <button className="inline-flex items-center rounded-lg bg-indigo-500 px-5 py-2.5 font-semibold text-white hover:bg-indigo-400 transition-colors">
                      Sign in to host
                    </button>
                  </SignInButton>
                </div>
              </SignedOut>
              <SignedIn>
                <p className="mt-1 text-sm text-slate-300">
                  Welcome back — pick up where you left off.
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <Link
                    to="/sessions/new"
                    className="inline-flex items-center rounded-lg bg-indigo-500 px-5 py-2.5 font-semibold text-white hover:bg-indigo-400 transition-colors"
                  >
                    New session
                  </Link>
                  <Link
                    to="/sessions"
                    className="text-sm font-medium text-slate-300 hover:text-white"
                  >
                    Your sessions
                  </Link>
                </div>
              </SignedIn>
            </div>
          </div>
        </div>
      </section>

      {/* How hosting works — a real, ordered sequence */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-2xl font-bold text-slate-900">How hosting works</h2>
        <p className="mt-2 text-slate-600">
          From an empty session to a live leaderboard in four steps.
        </p>

        <ol className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              n: 1,
              title: 'Create a session',
              body: 'Sign in, name the night and add the games you want to play.',
            },
            {
              n: 2,
              title: 'Share the code',
              body: 'Players open the join link on their own phones — no install.',
            },
            {
              n: 3,
              title: 'Form teams',
              body: 'Auto-balance teams or assign players yourself before you start.',
            },
            {
              n: 4,
              title: 'Play & score',
              body: 'Run rounds and turns; scores update live on every screen.',
            },
          ].map((step) => (
            <li
              key={step.n}
              className="rounded-xl border border-slate-200 bg-white p-6"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-600 font-semibold text-white tabular-nums">
                {step.n}
              </div>
              <h3 className="mt-4 font-semibold text-slate-900">
                {step.title}
              </h3>
              <p className="mt-1 text-sm text-slate-600">{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* What you get — descriptive, not links into host-only tools */}
      <section className="bg-white border-y border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="text-2xl font-bold text-slate-900">
            Built for the person running the room
          </h2>
          <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: 'Live game control',
                body: 'Start rounds, pause, advance turns and complete games — the control panel always reflects the real game state.',
              },
              {
                title: 'Real-time scoring',
                body: 'Enter points per round (including penalties). Totals and the leaderboard update instantly for everyone.',
              },
              {
                title: 'Team formation',
                body: 'Balance teams automatically or arrange them by hand, then lock them in when you kick off.',
              },
              {
                title: 'Everyone stays in sync',
                body: 'Players get a live, read-only view of the score and whose turn it is — great cast to a TV.',
              },
              {
                title: 'Session chat',
                body: 'A per-session chat keeps the banter in one place while you play.',
              },
              {
                title: 'No accounts for players',
                body: 'Guests join with a code and a name. Only the host signs in.',
              },
            ].map((f) => (
              <div key={f.title}>
                <h3 className="font-semibold text-slate-900">{f.title}</h3>
                <p className="mt-1 text-sm text-slate-600">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Closing CTA — same two honest paths */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="rounded-2xl bg-slate-900 px-6 py-10 sm:px-10 text-center">
          <h2 className="text-2xl font-bold text-white">
            Ready for the next game night?
          </h2>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              to="/join"
              className="inline-flex items-center rounded-lg bg-emerald-500 px-6 py-3 font-semibold text-white hover:bg-emerald-400 transition-colors"
            >
              Join with a code
            </Link>
            <SignedOut>
              <SignInButton mode="modal">
                <button className="inline-flex items-center rounded-lg bg-indigo-500 px-6 py-3 font-semibold text-white hover:bg-indigo-400 transition-colors">
                  Sign in to host
                </button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <Link
                to="/sessions/new"
                className="inline-flex items-center rounded-lg bg-indigo-500 px-6 py-3 font-semibold text-white hover:bg-indigo-400 transition-colors"
              >
                Create a session
              </Link>
            </SignedIn>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-slate-500">
          Games Night — real-time game-night scoring and control.
        </div>
      </footer>
    </div>
  )
}
