import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const CHAPTER_PROMPTS: Record<number, string> = {
  1: `Write a comprehensive Chapter One (Introduction) for this final year project. Include:
- Background to the Study (detailed context, 4-5 paragraphs)
- Statement of the Problem (specific gaps and issues)
- Objectives of the Study (main + 4-5 specific objectives)
- Research Questions (4-5 questions)
- Research Hypotheses (if applicable)
- Significance of the Study (academic + practical contributions)
- Scope and Limitations
- Definition of Terms (8-10 key terms)
Target: 3,000-4,000 words. Write in formal academic English.`,

  2: `Write a comprehensive Chapter Two (Literature Review) for this final year project. Include:
- Introduction
- Conceptual Framework (define all key concepts thoroughly)
- Theoretical Framework (relevant theories with authors and dates)
- Empirical Review (review 15-20 relevant studies from 2015-2024)
- Research Gaps (what previous studies missed)
- Summary of Reviewed Literature
Target: 5,000-7,000 words. Use proper in-text citations (Author, Year).`,

  3: `Write a comprehensive Chapter Three (Research Methodology) for this final year project. Include:
- Research Design (justify the chosen design)
- Study Area/Population of the Study
- Sample Size and Sampling Technique (with calculation if survey-based)
- Sources of Data (primary and secondary)
- Research Instrument (questionnaire/interview description)
- Validity and Reliability of Instrument
- Method of Data Analysis
- Ethical Considerations
Target: 2,500-3,500 words.`,

  4: `Write a comprehensive Chapter Four (Data Presentation and Analysis) for this final year project. Include:
- Introduction
- Demographic data presentation (bio-data of respondents)
- Presentation of research findings per objective
- Analysis and interpretation of data
- Discussion of findings (linking to literature)
- Hypotheses testing (if applicable)
- Summary of findings
Target: 4,000-6,000 words. Present realistic simulated data in table form.`,

  5: `Write a comprehensive Chapter Five (Summary, Conclusion and Recommendations) for this final year project. Include:
- Summary of the Study
- Summary of Findings (numbered list)
- Conclusion (2-3 paragraphs)
- Recommendations (8-10 specific, actionable recommendations)
- Contributions to Knowledge
- Limitations of the Study
- Suggestions for Further Studies
- References (25-35 references in APA 7th edition format)
Target: 2,500-3,500 words.`,
}

export async function POST(request: Request) {
  try {
    const { title, department, field, level, chapterNumber, chapterTitle } = await request.json()

    const chapterPrompt = CHAPTER_PROMPTS[chapterNumber as number] ?? ''

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 8000,
      messages: [{
        role: 'user',
        content: `You are an expert academic writer specializing in Nigerian university projects.

Project: "${title}"
Department: ${department}
Field: ${field || 'General'}
Level: ${level}
Chapter: ${chapterNumber} — ${chapterTitle}

${chapterPrompt}

Write the full chapter content now. Start directly with the chapter heading. Use formal academic English. Do not add any preamble or meta-commentary — just the chapter content itself.`,
      }],
    })

    const content = message.content[0].type === 'text' ? message.content[0].text : ''
    return NextResponse.json({ content })
  } catch (error) {
    console.error('Chapter API error:', error)
    return NextResponse.json({ error: 'Failed to write chapter' }, { status: 500 })
  }
}
