import OpenAI from 'openai'
import { NextResponse } from 'next/server'

export const maxDuration = 60
export const runtime = 'nodejs'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

/**
 * Transcribe audio (lecturer's voice note) to text via OpenAI Whisper.
 * Receives multipart/form-data with `file` field.
 */
export async function POST(request: Request) {
  try {
    const form = await request.formData()
    const file = form.get('file')
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 })
    }

    if (file.size > 25 * 1024 * 1024) {
      return NextResponse.json({ error: 'Audio file too large (max 25MB)' }, { status: 413 })
    }

    const result = await openai.audio.transcriptions.create({
      file,
      model: 'whisper-1',
      response_format: 'text',
      language: 'en',
    })

    const text = typeof result === 'string' ? result : (result as { text?: string }).text ?? ''
    return NextResponse.json({ text })
  } catch (err) {
    console.error('Transcribe error:', err)
    const msg = err instanceof Error ? err.message : 'Transcription failed'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
