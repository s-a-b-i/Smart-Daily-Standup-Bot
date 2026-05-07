function StandupCard({ standup }) {
  const formattedDate = new Date(standup.date).toLocaleString();

  return (
    <article className="space-y-3 rounded-2xl border border-black bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-gray-700">{formattedDate}</p>
        <span className="rounded-full border border-black bg-gray-100 px-3 py-1 text-xs text-black">
          AI summary
        </span>
      </div>
      <pre className="whitespace-pre-wrap rounded-xl border border-gray-300 bg-gray-100 p-3 font-mono text-sm text-black">
        {standup.summary}
      </pre>
      <div className="flex flex-wrap gap-2">
        {standup.tags?.map((tag) => (
          <span
            key={`${standup._id}-${tag}`}
            className="rounded-full border border-black bg-black px-3 py-1 text-xs text-white"
          >
            {tag}
          </span>
        ))}
      </div>
    </article>
  );
}

export default StandupCard;
