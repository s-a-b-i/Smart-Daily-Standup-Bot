import { useState } from "react";
import { apiClient } from "../api/axios";

function StandupForm({ onCreated }) {
  const [raw, setRaw] = useState("");
  const [mcpCommitText, setMcpCommitText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingCommits, setIsLoadingCommits] = useState(false);
  const [commitStatus, setCommitStatus] = useState("");

  const handleAutofillCommits = async () => {
    try {
      setCommitStatus("");
      setIsLoadingCommits(true);
      const response = await apiClient.get("/api/standup/commits");
      const commits = Array.isArray(response.data?.commits) ? response.data.commits : [];
      if (commits.length === 0) {
        setCommitStatus("No recent commits found for this GitHub user.");
        return;
      }

      setMcpCommitText(commits.join("\n"));
      setCommitStatus(`Loaded ${commits.length} recent commit message(s).`);
    } catch (_error) {
      setCommitStatus("Failed to load commits. Check server/GitHub settings.");
    } finally {
      setIsLoadingCommits(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!raw.trim()) {
      return;
    }

    try {
      setIsLoading(true);
      const mcpCommits = mcpCommitText
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
        .slice(0, 5);
      const response = await apiClient.post("/api/standup", {
        raw,
        mcpCommits
      });
      setRaw("");
      setMcpCommitText("");
      onCreated(response.data);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4"
    >
      <div className="space-y-1">
        <h2 className="text-lg font-semibold text-black">New update</h2>
        <p className="text-sm text-gray-700">Write your raw standup notes in one message.</p>
      </div>
      <textarea
        name="raw"
        value={raw}
        onChange={(event) => setRaw(event.target.value)}
        placeholder="What did you do? What will you do? Any blockers?"
        required
        rows={6}
        className="w-full rounded-xl border border-black bg-white p-3 text-black placeholder:text-gray-500 focus:border-black focus:outline-none"
      />
      <textarea
        name="mcpCommits"
        value={mcpCommitText}
        onChange={(event) => setMcpCommitText(event.target.value)}
        placeholder="Optional MCP commits context (one commit message per line)"
        rows={3}
        className="w-full rounded-xl border border-black bg-white p-3 text-black placeholder:text-gray-500 focus:border-black focus:outline-none"
      />
      <button
        type="button"
        onClick={handleAutofillCommits}
        disabled={isLoadingCommits}
        className="inline-flex items-center gap-2 rounded-full border border-black bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:bg-gray-100"
      >
        {isLoadingCommits ? "Loading commits..." : "Auto-fill recent commits"}
      </button>
      {commitStatus && <p className="text-sm text-gray-700">{commitStatus}</p>}
      <button
        type="submit"
        disabled={isLoading}
        className="inline-flex items-center gap-2 rounded-full border border-black bg-black px-5 py-2 font-medium text-white transition hover:bg-gray-900 disabled:cursor-not-allowed disabled:bg-gray-900"
      >
        {isLoading && (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-black" />
        )}
        {isLoading ? "Generating..." : "Generate Summary"}
      </button>
    </form>
  );
}

export default StandupForm;
