import client from './client'

export const adviceApi = {
  getAdvice(data: { question?: string; days?: number }): Promise<{ advice: string }> {
    return client.post('/advice/', data, { timeout: 60_000 }).then((r) => r.data)
  },
}
