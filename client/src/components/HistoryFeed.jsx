import { useEffect, useState } from "react";
import { apiClient } from "../api/axios";
import StandupCard from "./StandupCard";

function HistoryFeed({ refreshToken }) {
  const [standups, setStandups] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 3;

  useEffect(() => {
    const fetchStandups = async () => {
      const response = await apiClient.get("/api/standup");
      setStandups(response.data);
      setCurrentPage(1);
    };

    fetchStandups();
  }, [refreshToken]);

  const normalizePrompt = (prompt) => (typeof prompt === "string" ? prompt.trim().toLowerCase() : "");
  const promptCounts = standups.reduce((counts, item) => {
    const key = normalizePrompt(item.raw);
    if (!key) {
      return counts;
    }
    counts[key] = (counts[key] || 0) + 1;
    return counts;
  }, {});
  const uniquePromptCount = Object.keys(promptCounts).length;

  const totalPages = Math.max(1, Math.ceil(standups.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const paginatedStandups = standups.slice(startIndex, startIndex + pageSize);

  return (
    <section className="flex h-full flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-black">History</h2>
        <div className="flex items-center gap-2">
          <span className="rounded-full border border-black bg-white px-3 py-1 text-xs font-medium text-black">
            {standups.length} summaries
          </span>
          <span className="rounded-full border border-black bg-white px-3 py-1 text-xs font-medium text-black">
            {uniquePromptCount} prompts
          </span>
        </div>
      </div>
      {standups.length === 0 ? (
        <p className="rounded-2xl border border-black bg-gray-100 p-4 text-gray-700">No standups yet</p>
      ) : (
        <>
          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
            {paginatedStandups.map((standup) => (
              <StandupCard
                key={standup._id}
                standup={standup}
                promptUsageCount={promptCounts[normalizePrompt(standup.raw)] || 1}
              />
            ))}
          </div>
          <div className="flex items-center justify-between border-t border-gray-300 pt-3">
            <button
              type="button"
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              disabled={safePage === 1}
              className="rounded-full border border-black bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:bg-gray-100"
            >
              Previous
            </button>
            <p className="text-sm text-gray-700">
              Page {safePage} of {totalPages}
            </p>
            <button
              type="button"
              onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
              disabled={safePage === totalPages}
              className="rounded-full border border-black bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:bg-gray-100"
            >
              Next
            </button>
          </div>
        </>
      )}
    </section>
  );
}

export default HistoryFeed;
