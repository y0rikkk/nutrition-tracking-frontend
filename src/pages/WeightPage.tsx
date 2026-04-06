import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function WeightPage() {
  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-semibold mb-4">Вес</h1>
      <Card>
        <CardHeader>
          <CardTitle>Отслеживание веса</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Здесь будет график веса и форма добавления замеров.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
