interface ScoreBadgeProps {
  score: number;
}

/**
 * Render score as stars with color tiers from low to high.
 */
export default function ScoreBadge({ score }: ScoreBadgeProps) {
  const safeScore = Math.max(0, Math.min(5, score));
  const stars = '★'.repeat(safeScore) + '☆'.repeat(5 - safeScore);

  const tone =
    safeScore <= 1
      ? 'text-red-600 bg-red-50'
      : safeScore <= 3
      ? 'text-orange-600 bg-orange-50'
      : 'text-green-600 bg-green-50';

  return (
    <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold ${tone}`}>
      <span>{stars}</span>
      <span>{safeScore}/5</span>
    </div>
  );
}
