function scoreTier(score: number) {
  if (score >= 75) return { text: 'text-good', bg: 'bg-good/10', ring: 'ring-good/25' }
  if (score >= 50) return { text: 'text-warn', bg: 'bg-warn/15', ring: 'ring-warn/30' }
  return { text: 'text-critical', bg: 'bg-critical/10', ring: 'ring-critical/25' }
}

export function ScoreBadge({ score, size = 'md' }: { score: number; size?: 'sm' | 'md' | 'lg' }) {
  const tier = scoreTier(score)
  const sizeClasses = {
    sm: 'h-6 min-w-6 text-[11px] px-1.5',
    md: 'h-8 min-w-8 text-xs px-2',
    lg: 'h-12 min-w-12 text-base px-3',
  }[size]

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full font-mono font-semibold ring-1 ${tier.bg} ${tier.text} ${tier.ring} ${sizeClasses}`}
      title={`Match score: ${score}/100`}
    >
      {score}
    </span>
  )
}
