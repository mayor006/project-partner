import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'

export const maxDuration = 60

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

/**
 * Use Anthropic tool_use to force a guaranteed-valid JSON object.
 * No regex parsing, no code-fence handling, no truncation surprises.
 */
const STRUCTURE_TOOL = {
  name: 'submit_project_structure',
  description: 'Submit the 5-chapter structure for this Nigerian final-year project.',
  input_schema: {
    type: 'object' as const,
    required: ['chapters', 'estimated_pages'],
    properties: {
      chapters: {
        type: 'array',
        minItems: 5,
        maxItems: 5,
        items: {
          type: 'object',
          required: ['number', 'title', 'description', 'sections'],
          properties: {
            number: { type: 'integer', minimum: 1, maximum: 5 },
            title: { type: 'string', description: 'Chapter title' },
            description: { type: 'string', description: 'One short paragraph on what this chapter covers' },
            sections: {
              type: 'array',
              minItems: 4,
              items: { type: 'string', description: 'Section heading like "1.1 Background to the Study"' },
            },
          },
        },
      },
      estimated_pages: { type: 'integer', minimum: 40, maximum: 120 },
    },
  },
}

export async function POST(request: Request) {
  try {
    const { title, department, field, level, lecturerToc, lecturerNotes, interests } = await request.json()

    const lecturerBlock = (lecturerToc || lecturerNotes)
      ? `\n\nSUPERVISOR'S INSTRUCTIONS — follow these strictly. Where they specify a structure, use it verbatim instead of inventing one:${lecturerToc ? `\n\nSupervisor's Table of Contents:\n${lecturerToc}` : ''}${lecturerNotes ? `\n\nSupervisor's Notes:\n${lecturerNotes}` : ''}`
      : ''

    const interestsBlock = interests ? `\nStudent's research interests: ${interests}` : ''

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2000,
      tools: [STRUCTURE_TOOL],
      tool_choice: { type: 'tool', name: 'submit_project_structure' },
      messages: [{
        role: 'user',
        content: `You are an academic project supervisor. Create a detailed 5-chapter structure for this Nigerian university final-year project.

Project Title: "${title}"
Department: ${department}
Field: ${field || 'General'}
Level: ${level}${interestsBlock}${lecturerBlock}

Use Nigerian university standards (5 chapters: Introduction, Literature Review, Methodology, Data Analysis, Summary/Conclusion) — unless the supervisor's TOC above specifies different chapters, in which case use theirs.

Each chapter needs:
- a number (1-5)
- a clear title
- a one-paragraph description of what it covers
- 5-8 numbered section headings (like "1.1 Background to the Study")

Submit your answer using the submit_project_structure tool.`,
      }],
    })

    // Find the tool_use block in the response
    const toolUse = message.content.find(c => c.type === 'tool_use')
    if (!toolUse || toolUse.type !== 'tool_use') {
      console.error('No tool_use in response:', JSON.stringify(message.content).slice(0, 500))
      throw new Error('AI did not return structured response')
    }

    const structure = toolUse.input as {
      chapters: Array<{ number: number; title: string; description: string; sections: string[] }>
      estimated_pages: number
    }

    return NextResponse.json({ structure })
  } catch (error) {
    console.error('Structure API error:', error)
    const msg = error instanceof Error ? error.message : 'Failed to generate structure'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
