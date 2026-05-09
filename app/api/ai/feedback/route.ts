import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(request: Request) {
  try {
    const { projectTitle, feedback, chapterId } = await request.json()

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2000,
      messages: [{
        role: 'user',
        content: `You are an expert academic editor helping a student respond to supervisor feedback.

Project: "${projectTitle}"
${chapterId ? 'Specific chapter feedback' : 'General project feedback'}

Supervisor's Feedback:
"${feedback}"

Provide a detailed, actionable revision plan. Include:
1. A brief summary of what the supervisor wants
2. Specific, numbered actions to take (be very concrete)
3. Example sentences or content to add where helpful
4. Estimated scope of changes needed

Be supportive and practical. Write as if guiding the student step by step.`,
      }],
    })

    const response = message.content[0].type === 'text' ? message.content[0].text : ''
    return NextResponse.json({ response })
  } catch (error) {
    console.error('Feedback API error:', error)
    return NextResponse.json({ error: 'Failed to process feedback' }, { status: 500 })
  }
}
