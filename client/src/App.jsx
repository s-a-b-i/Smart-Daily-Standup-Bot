import { useState } from "react";
import StandupForm from "./components/StandupForm";
import HistoryFeed from "./components/HistoryFeed";

function App() {
  const [refreshToken, setRefreshToken] = useState(0);

  return (
    <main className="min-h-screen bg-gray-100 px-4 py-10">
      <div className="mx-auto w-full max-w-[720px] space-y-6">
        <header className="space-y-2">
          <p className="inline-flex rounded-full border border-black bg-white px-3 py-1 text-xs font-medium text-black">
            Smart Daily Standup Bot
          </p>
          <h1 className="text-3xl font-bold text-black">Daily Standup</h1>
          <p className="text-sm text-gray-700">
            Turn rough updates into a structured summary with tags.
          </p>
        </header>
        <StandupForm onCreated={() => setRefreshToken((value) => value + 1)} />
        <HistoryFeed refreshToken={refreshToken} />
      </div>
    </main>
  );
}

export default App;
