import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function GoalsPage() {
  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-semibold mb-4">Цели по КБЖУ</h1>
      <Card>
        <CardHeader>
          <CardTitle>Ваши цели</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Здесь будет текущая цель и история прошлых целей.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
