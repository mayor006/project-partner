import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'

export const maxDuration = 60

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

/**
 * Two-stage topic generation:
 *  1. Perplexity (sonar) — gathers current, citation-backed research context
 *     for the student's department/field/interests (2024–2026 sources)
 *  2. Claude — turns that research into 5 well-formed final-year project
 *     topics with proper academic framing
 */

interface PerplexityResult {
  context: string
  citations: { title?: string; url: string }[]
}

async function fetchPerplexityContext(
  department: string,
  field: string,
  level: string,
  interests: string,
): Promise<PerplexityResult | null> {
  const key = process.env.PERPLEXITY_API_KEY
  if (!key) return null

  const query = `Recent (2024-2026) research trends, gaps, and emerging issues in ${field || department}${
    interests ? `, particularly around ${interests}` : ''
  }, with a focus on the Nigerian/West African context where applicable. List 5-7 specific research directions with their key issues and any data sources or recent studies (e.g. CBN, NBS, NDIC, WHO, journals).`

  try {
    const res = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar',
        messages: [
          {
            role: 'system',
            content: 'You are a research assistant for African university students. Provide concise, citation-backed research direction summaries. Focus on Nigerian context. Be specific about gaps and recent developments.',
          },
          { role: 'user', content: query },
        ],
        max_tokens: 1200,
        temperature: 0.3,
      }),
    })

    if (!res.ok) return null
    const data = await res.json()
    const context = data.choices?.[0]?.message?.content ?? ''
    const citations: { title?: string; url: string }[] = (data.citations ?? data.search_results ?? [])
      .map((c: unknown) => {
        if (typeof c === 'string') return { url: c }
        if (typeof c === 'object' && c !== null && 'url' in c) {
          return { url: (c as { url: string }).url, title: (c as { title?: string }).title }
        }
        return null
      })
      .filter(Boolean) as { url: string; title?: string }[]

    return { context, citations }
  } catch (err) {
    console.error('Perplexity fetch failed:', err)
    return null
  }
}

export async function POST(request: Request) {
  try {
    const { department, field, level, interests } = await request.json()

    // 1. Get up-to-date research context from Perplexity
    const research = await fetchPerplexityContext(department, field || '', level, interests || '')

    // 2. Generate topics with Claude, grounded in that research
    const groundingBlock = research?.context
      ? `\n\nRECENT RESEARCH CONTEXT (use these emerging issues as inspiration; do not copy verbatim):\n${research.context}\n`
      : ''

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1800,
      messages: [{
        role: 'user',
        content: `You are an academic research advisor for Nigerian university students. Generate 5 unique, research-worthy final year project topics.

Student details:
- Department: ${department}
- Field/Concentration: ${field || 'General'}
- Academic Level: ${level}
- Research Interests: ${interests || 'Not specified'}
${groundingBlock}
Requirements:
- Topics must be specific, researchable, and academically appropriate
- Suitable for a Nigerian university context (use local examples, CBN/NBS/NDIC/WHO data where relevant)
- Modern and relevant (2024-2026 — reflect emerging issues from the research context above)
- Each topic should be distinct in scope
- Each topic should be approval-ready: the student could show this to a supervisor without changes

Return ONLY a valid JSON array with this exact structure (no surrounding text):
[
  {
    "title": "Full project title (capital case, around 12-20 words)",
    "description": "Two sentences describing what the research investigates and the population/scope",
    "rationale": "One sentence on why this topic is important/timely in the current Nigerian context",
    "keywords": ["keyword1", "keyword2", "keyword3", "keyword4"]
  }
]`,
      }],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : ''
    const jsonMatch = text.match(/\[[\s\S]*\]/)
    if (!jsonMatch) throw new Error('Invalid AI response format')

    const topics = JSON.parse(jsonMatch[0])

    return NextResponse.json({
      topics,
      // Pass citations through so the front-end can show source links and store them on save
      citations: research?.citations ?? [],
      grounded: !!research,
    })
  } catch (error) {
    console.error('Topics API error:', error)
    return NextResponse.json({ error: 'Failed to generate topics' }, { status: 500 })
  }
}
