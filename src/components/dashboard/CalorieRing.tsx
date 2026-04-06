import { RadialBarChart, RadialBar, PolarAngleAxis } from 'recharts'
import { Card, CardContent } from '@/components/ui/card'

interface CalorieRingProps {
  consumed: number
  goal: number
}

export function CalorieRing({ consumed, goal }: CalorieRingProps) {
  const hasGoal = goal > 0
  const percent = hasGoal ? Math.min((consumed / goal) * 100, 100) : 0

  const fill = !hasGoal
    ? 'var(--color-muted-foreground)'
    : percent > 100
      ? 'var(--color-destructive)'
      : percent > 85
        ? 'oklch(0.75 0.18 55)'
        : 'oklch(0.65 0.2 145)'

  const data = [{ value: percent }]

  return (
    <Card>
      <CardContent className="flex flex-col items-center py-4">
        <div className="relative w-[180px] h-[180px]">
          <RadialBarChart
            width={180}
            height={180}
            innerRadius="80%"
            outerRadius="100%"
            data={data}
            startAngle={90}
            endAngle={-270}
            barSize={12}
          >
            <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
            <RadialBar
              background={{ fill: 'var(--color-muted)' }}
              dataKey="value"
              cornerRadius={6}
              fill={fill}
              angleAxisId={0}
            />
          </RadialBarChart>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-semibold">{Math.round(consumed)}</span>
            {hasGoal ? (
              <>
                <span className="text-sm text-muted-foreground">/ {Math.round(goal)}</span>
                <span className="text-xs text-muted-foreground">ккал</span>
              </>
            ) : (
              <span className="text-xs text-muted-foreground">ккал</span>
            )}
          </div>
        </div>
        {!hasGoal && (
          <p className="text-sm text-muted-foreground mt-2">Цель не задана</p>
        )}
      </CardContent>
    </Card>
  )
}
