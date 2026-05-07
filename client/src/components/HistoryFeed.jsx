import { useEffect, useState } from "react";
import { apiClient } from "../api/axios";
import StandupCard from "./StandupCard";

function HistoryFeed({ refreshToken }) {
  const [standups, setStandups] = useState([]);

  useEffect(() => {
    const fetchStandups = async () => {
      const response = await apiClient.get("/api/standup");
      setStandups(response.data);
    };

    fetchStandups();
  }, [refreshToken]);

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-black">History</h2>
        <span className="rounded-full border border-black bg-white px-3 py-1 text-xs font-medium text-black">
          {standups.length} entries
        </span>
      </div>
      {standups.length === 0 ? (
        <p className="rounded-2xl border border-black bg-white p-4 text-gray-700">No standups yet</p>
      ) : (
        standups.map((standup) => (
          <StandupCard key={standup._id} standup={standup} />
        ))
      )}
    </section>
  );
}

export default HistoryFeed;
