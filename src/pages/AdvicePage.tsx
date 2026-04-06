import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function AdvicePage() {
  return (
    <div className="max-w-[700px] mx-auto">
      <h1 className="text-2xl font-semibold mb-4">AI Советник</h1>
      <Card>
        <CardHeader>
          <CardTitle>Советы по питанию</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Здесь можно будет задать вопрос AI-советнику по питанию.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
