import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(request: Request) {
  try {
    const { title, department, level } = await request.json()

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 3000,
      messages: [{
        role: 'user',
        content: `You are a final year project defense examiner at a Nigerian university.

Project: "${title}"
Department: ${department}
Level: ${level}

Generate 12 likely defense questions with suggested answers. Cover methodology, literature, findings, contribution, and general questions.

Return ONLY valid JSON:
[
  {
    "question": "Full question text",
    "suggested_answer": "A comprehensive suggested answer (3-5 sentences)",
    "category": "methodology"
  }
]

Categories to use: "methodology", "literature", "findings", "contribution", "general"
Include 2-3 questions per category. Be realistic — these should be actual examiner questions.`,
      }],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : ''
    const jsonMatch = text.match(/\[[\s\S]*\]/)
    if (!jsonMatch) throw new Error('Invalid AI response format')

    const questions = JSON.parse(jsonMatch[0])
    return NextResponse.json({ questions })
  } catch (error) {
    console.error('Defense API error:', error)
    return NextResponse.json({ error: 'Failed to generate defense questions' }, { status: 500 })
  }
}
