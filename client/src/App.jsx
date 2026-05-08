import { useState } from "react";
import StandupForm from "./components/StandupForm";
import HistoryFeed from "./components/HistoryFeed";

function App() {
  const [refreshToken, setRefreshToken] = useState(0);

  return (
    <main className="h-screen overflow-hidden bg-gray-100 px-4 py-6">
      <div className="mx-auto flex h-full w-full max-w-6xl flex-col gap-4">
        <header className="space-y-2">
          <div className="flex items-center gap-3">
            <img
              src="/logo-mark.svg"
              alt="Standup Bot logo"
              className="h-10 w-10 rounded-lg border border-black bg-black p-1"
            />
            <div>
              <p className="inline-flex rounded-full border border-black bg-white px-3 py-1 text-xs font-medium text-black">
                Smart Daily Standup Bot
              </p>
              <h1 className="mt-1 text-3xl font-bold text-black">Daily Standup</h1>
            </div>
          </div>
          <p className="text-sm text-gray-700">
            Turn rough updates into a structured summary with tags.
          </p>
        </header>
        <section className="grid min-h-0 flex-1 gap-4 md:grid-cols-2">
          <div className="min-h-0 overflow-y-auto rounded-2xl border border-black bg-white p-4 shadow-sm">
            <StandupForm onCreated={() => setRefreshToken((value) => value + 1)} />
          </div>
          <div className="min-h-0 rounded-2xl border border-black bg-white p-4 shadow-sm">
            <HistoryFeed refreshToken={refreshToken} />
          </div>
        </section>
      </div>
    </main>
  );
}

export default App;
