import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'

export const maxDuration = 60

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// Tight prompts targeting ~1800-2200 words per chapter
// 3000 tokens at ~75 tok/s = ~40s + 5s TTFB = ~45s, safe under 60s timeout
const CHAPTER_PROMPTS: Record<number, string> = {
  1: `Write Chapter One (Introduction). Include:
- 1.1 Background (3 paragraphs)
- 1.2 Statement of the Problem (1-2 paragraphs)
- 1.3 Objectives (1 main + 4 specific)
- 1.4 Research Questions (4 questions)
- 1.5 Research Hypotheses (3 hypotheses)
- 1.6 Significance of the Study (1-2 paragraphs)
- 1.7 Scope and Limitations (brief)
- 1.8 Definition of Terms (6 key terms, one sentence each)
Target ~1,800-2,200 words. Start with "CHAPTER ONE: INTRODUCTION".`,

  2: `Write Chapter Two (Literature Review). Include:
- 2.1 Introduction (1 short paragraph)
- 2.2 Conceptual Framework (3-4 key concepts, ~100 words each)
- 2.3 Theoretical Framework (2 theories with author + year, ~150 words each)
- 2.4 Empirical Review (6-8 studies from 2018-2025, ~80 words each, with citations)
- 2.5 Research Gaps (1 paragraph)
- 2.6 Summary (1 paragraph)
Target ~2,000-2,300 words. Use (Author, Year) citations. Start with "CHAPTER TWO: LITERATURE REVIEW".`,

  3: `Write Chapter Three (Research Methodology). Include:
- 3.1 Introduction (1 short paragraph)
- 3.2 Research Design (1 paragraph)
- 3.3 Study Area / Population (1 paragraph)
- 3.4 Sample Size and Sampling Technique (with Taro Yamane formula)
- 3.5 Sources of Data
- 3.6 Research Instrument
- 3.7 Validity and Reliability
- 3.8 Method of Data Analysis
- 3.9 Ethical Considerations
Target ~1,700-2,100 words. Start with "CHAPTER THREE: RESEARCH METHODOLOGY".`,

  4: `Write Chapter Four (Data Presentation and Analysis). Include:
- 4.1 Introduction (1 short paragraph)
- 4.2 Demographic data (Age, Gender, Education — small simulated tables)
- 4.3 Findings per objective (3 objectives, each with a small simulated frequency table)
- 4.4 Analysis and interpretation
- 4.5 Discussion (linking to literature)
- 4.6 Hypotheses testing (simulated chi-square / t-test result)
- 4.7 Summary of findings (numbered list)
Target ~1,900-2,300 words. Use markdown tables. Start with "CHAPTER FOUR: DATA PRESENTATION AND ANALYSIS".`,

  5: `Write Chapter Five (Summary, Conclusion, Recommendations). Include:
- 5.1 Summary of the Study (1-2 paragraphs)
- 5.2 Summary of Findings (numbered list, 6 findings)
- 5.3 Conclusion (2 paragraphs)
- 5.4 Recommendations (8 actionable items, numbered)
- 5.5 Contributions to Knowledge (3 bullets)
- 5.6 Limitations (3 bullets)
- 5.7 Suggestions for Further Studies (3 bullets)
- 5.8 References (12-15 references in APA 7)
Target ~1,800-2,200 words. Start with "CHAPTER FIVE: SUMMARY, CONCLUSION AND RECOMMENDATIONS".`,
}

export async function POST(request: Request) {
  try {
    const { title, department, field, level, chapterNumber, chapterTitle } = await request.json()

    const chapterPrompt = CHAPTER_PROMPTS[chapterNumber as number] ?? ''

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 3000,
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
