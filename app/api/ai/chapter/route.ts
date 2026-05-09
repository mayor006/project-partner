import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'

export const maxDuration = 60

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// Tighter prompts targeting ~2500-3000 words per chapter
// (4096 tokens at ~75 tokens/sec ≈ 55s, fits comfortably under 60s)
const CHAPTER_PROMPTS: Record<number, string> = {
  1: `Write Chapter One (Introduction) for this final year project. Include these sections:
- 1.1 Background to the Study (3-4 substantial paragraphs)
- 1.2 Statement of the Problem (specific gaps and issues, 2 paragraphs)
- 1.3 Objectives of the Study (1 main + 4-5 specific objectives)
- 1.4 Research Questions (4-5 questions)
- 1.5 Research Hypotheses (if applicable, 3-4 hypotheses)
- 1.6 Significance of the Study (academic + practical, 2 paragraphs)
- 1.7 Scope and Limitations (1 paragraph each)
- 1.8 Definition of Terms (8 key terms with brief definitions)
Target: 2,500-3,000 words. Formal academic English. Start directly with "CHAPTER ONE: INTRODUCTION".`,

  2: `Write Chapter Two (Literature Review) for this final year project. Include:
- 2.1 Introduction (1 paragraph)
- 2.2 Conceptual Framework (define 4-5 key concepts, ~150 words each)
- 2.3 Theoretical Framework (2 relevant theories with authors and dates, ~250 words each)
- 2.4 Empirical Review (review 8-10 relevant studies from 2018-2025, ~120 words each, with proper citations)
- 2.5 Research Gaps (1 paragraph)
- 2.6 Summary of Reviewed Literature (1 paragraph)
Target: 2,800-3,200 words. Use proper in-text citations (Author, Year). Start with "CHAPTER TWO: LITERATURE REVIEW".`,

  3: `Write Chapter Three (Research Methodology) for this final year project. Include:
- 3.1 Introduction (1 short paragraph)
- 3.2 Research Design (justify the chosen design, 1 paragraph)
- 3.3 Study Area / Population of the Study (1-2 paragraphs)
- 3.4 Sample Size and Sampling Technique (with Taro Yamane calculation if applicable)
- 3.5 Sources of Data (primary and secondary)
- 3.6 Research Instrument (questionnaire/interview description)
- 3.7 Validity and Reliability of Instrument (Cronbach's alpha mention)
- 3.8 Method of Data Analysis (descriptive + inferential statistics)
- 3.9 Ethical Considerations
Target: 2,200-2,800 words. Start with "CHAPTER THREE: RESEARCH METHODOLOGY".`,

  4: `Write Chapter Four (Data Presentation and Analysis) for this final year project. Include:
- 4.1 Introduction (1 paragraph)
- 4.2 Demographic data presentation (Age, Gender, Education with simulated tables)
- 4.3 Presentation of research findings per objective (3-4 objectives, each with a small simulated frequency table)
- 4.4 Analysis and interpretation of data
- 4.5 Discussion of findings (link to literature from Ch. 2)
- 4.6 Hypotheses testing (chi-square or t-test results, simulated)
- 4.7 Summary of findings (numbered list)
Target: 2,500-3,000 words. Present realistic simulated data in markdown tables. Start with "CHAPTER FOUR: DATA PRESENTATION AND ANALYSIS".`,

  5: `Write Chapter Five (Summary, Conclusion and Recommendations) for this final year project. Include:
- 5.1 Summary of the Study (1-2 paragraphs)
- 5.2 Summary of Findings (numbered list, 6-8 findings)
- 5.3 Conclusion (2 paragraphs)
- 5.4 Recommendations (8 specific, actionable recommendations as numbered list)
- 5.5 Contributions to Knowledge (3-4 bullet points)
- 5.6 Limitations of the Study (3-4 bullets)
- 5.7 Suggestions for Further Studies (3-4 bullets)
- 5.8 References (15-20 references in APA 7th edition format)
Target: 2,200-2,800 words. Start with "CHAPTER FIVE: SUMMARY, CONCLUSION AND RECOMMENDATIONS".`,
}

export async function POST(request: Request) {
  try {
    const { title, department, field, level, chapterNumber, chapterTitle } = await request.json()

    const chapterPrompt = CHAPTER_PROMPTS[chapterNumber as number] ?? ''

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      messages: [{
        role: 'user',
        content: `You are an expert academic writer specializing in Nigerian university final year projects.

Project: "${title}"
Department: ${department}
Field: ${field || 'General'}
Level: ${level}
Chapter ${chapterNumber}: ${chapterTitle}

${chapterPrompt}

Write the chapter content NOW. Be concise but thorough. Do not add preamble or meta-commentary — start directly with the chapter heading.`,
      }],
    })

    const content = message.content[0].type === 'text' ? message.content[0].text : ''
    return NextResponse.json({ content })
  } catch (error) {
    console.error('Chapter API error:', error)
    const msg = error instanceof Error ? error.message : 'Failed to write chapter'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
