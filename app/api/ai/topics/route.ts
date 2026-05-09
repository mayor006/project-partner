import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(request: Request) {
  try {
    const { department, field, level, interests } = await request.json()

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1500,
      messages: [{
        role: 'user',
        content: `You are an academic research advisor for Nigerian university students. Generate 5 unique, research-worthy final year project topics.

Student details:
- Department: ${department}
- Field/Concentration: ${field || 'General'}
- Academic Level: ${level}
- Research Interests: ${interests || 'Not specified'}

Requirements:
- Topics must be specific, researchable, and academically appropriate
- Suitable for a Nigerian university context
- Modern and relevant (2020-2025)
- Each topic should be distinct

Return ONLY a valid JSON array with this exact structure:
[
  {
    "title": "Full project title here",
    "description": "One sentence describing what the research investigates",
    "rationale": "One sentence on why this topic is important/timely",
    "keywords": ["keyword1", "keyword2", "keyword3"]
  }
]`,
      }],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : ''
    const jsonMatch = text.match(/\[[\s\S]*\]/)
    if (!jsonMatch) throw new Error('Invalid AI response format')

    const topics = JSON.parse(jsonMatch[0])
    return NextResponse.json({ topics })
  } catch (error) {
    console.error('Topics API error:', error)
    return NextResponse.json({ error: 'Failed to generate topics' }, { status: 500 })
  }
}
