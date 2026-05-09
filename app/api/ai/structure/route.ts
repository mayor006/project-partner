import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'

export const maxDuration = 30

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

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
      messages: [{
        role: 'user',
        content: `You are an academic project supervisor. Create a detailed chapter structure for this final year project.

Project Title: "${title}"
Department: ${department}
Field: ${field || 'General'}
Level: ${level}${interestsBlock}${lecturerBlock}

Create a 5-chapter structure following Nigerian university academic standards (or the supervisor's structure if provided above).

Return ONLY valid JSON with this exact structure:
{
  "chapters": [
    {
      "number": 1,
      "title": "Introduction",
      "description": "Brief description of what this chapter covers",
      "sections": ["1.1 Background to the Study", "1.2 Statement of Problem", "1.3 Objectives", "1.4 Research Questions", "1.5 Significance", "1.6 Scope and Limitations", "1.7 Definition of Terms"]
    },
    {
      "number": 2,
      "title": "Literature Review",
      "description": "...",
      "sections": ["2.1 ...", "2.2 ...", "2.3 ...", "2.4 Theoretical Framework", "2.5 Empirical Review", "2.6 Summary"]
    },
    {
      "number": 3,
      "title": "Research Methodology",
      "description": "...",
      "sections": ["3.1 Research Design", "3.2 Study Area/Population", "3.3 Sample and Sampling", "3.4 Data Collection", "3.5 Instrument Validity", "3.6 Data Analysis"]
    },
    {
      "number": 4,
      "title": "Data Presentation and Analysis",
      "description": "...",
      "sections": ["4.1 Introduction", "4.2 Data Presentation", "4.3 Discussion of Findings", "4.4 Hypotheses Testing"]
    },
    {
      "number": 5,
      "title": "Summary, Conclusion and Recommendations",
      "description": "...",
      "sections": ["5.1 Summary", "5.2 Conclusion", "5.3 Recommendations", "5.4 Contributions to Knowledge", "5.5 Suggestions for Further Studies"]
    }
  ],
  "estimated_pages": 72
}`,
      }],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : ''
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('Invalid AI response format')

    const structure = JSON.parse(jsonMatch[0])
    return NextResponse.json({ structure })
  } catch (error) {
    console.error('Structure API error:', error)
    return NextResponse.json({ error: 'Failed to generate structure' }, { status: 500 })
  }
}
