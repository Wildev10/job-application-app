interface ScoreBadgeProps {
  score: number;
}

/**
 * Render score with a simple color dot and numeric value.
 */
export default function ScoreBadge({ score }: ScoreBadgeProps) {
  const safeScore = Math.max(0, Math.min(5, score));
  const tone = safeScore <= 1 ? 'bg-red-500' : safeScore <= 3 ? 'bg-orange-500' : 'bg-green-500';

  return (
    <span className="inline-flex items-center gap-2 text-sm font-medium text-[#0f0f0f]">
      <span className={`h-2.5 w-2.5 rounded-full ${tone}`} aria-hidden="true" />
      <span>{safeScore}/5</span>
    </span>
  );
}
