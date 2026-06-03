import { useState } from 'react'
import { Loader2, Info } from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'
import { useGetAdvice } from '@/hooks/useAdvice'

export default function AdvicePage() {
  const [question, setQuestion] = useState('')
  const [days, setDays] = useState(7)
  const adviceMutation = useGetAdvice()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await adviceMutation.mutateAsync({
        question: question || undefined,
        days,
      })
    } catch {
      toast.error('Не удалось получить совет. Попробуйте позже.')
    }
  }

  return (
    <div className="max-w-[700px] mx-auto">
      <h1 className="text-2xl font-semibold mb-4">AI Советник</h1>

      <div className="flex gap-3 p-3 mb-4 rounded-md border border-amber-200 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-950/30">
        <Info className="h-4 w-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-500" />
        <p className="text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
          Рекомендации генерируются ИИ и могут содержать неточности. Они не являются медицинской или диетологической консультацией и не заменяют её. Перед изменением рациона, особенно при наличии заболеваний, аллергий или беременности, проконсультируйтесь с врачом или дипломированным диетологом.
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">Задайте вопрос</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Textarea
                placeholder="Например: стоит ли мне есть углеводы вечером?"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                Можно оставить пустым — AI проанализирует ваше питание и даст общие рекомендации
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <Label>Анализировать за {days} {days === 1 ? 'день' : days < 5 ? 'дня' : 'дней'}</Label>
              <Slider
                value={[days]}
                onValueChange={(v) => setDays(v[0])}
                min={1}
                max={30}
                step={1}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>1 день</span>
                <span>30 дней</span>
              </div>
            </div>

            <Button type="submit" disabled={adviceMutation.isPending}>
              {adviceMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Анализируем ваше питание...
                </>
              ) : (
                'Получить совет'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {adviceMutation.isPending && (
        <Card>
          <CardContent className="py-8 flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Это может занять 10-30 секунд...</p>
          </CardContent>
        </Card>
      )}

      {adviceMutation.data && !adviceMutation.isPending && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Рекомендации</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
              {adviceMutation.data.advice}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
