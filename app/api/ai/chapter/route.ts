import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'

export const maxDuration = 60

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// Each chapter is split into two parts. Each part is generated in its own
// API call (~3000 tokens, ~45s) — total chapter ~6000 tokens, ~3500-4000 words,
// 14-16 pages double-spaced. Total project ~70-80 pages.

type ChapterKey = `${number}-${1 | 2}`

const CHAPTER_PROMPTS: Record<string, string> = {
  // ─── Chapter 1 — Introduction ───────────────────
  '1-1': `Write the FIRST HALF of Chapter One (Introduction). Include only:
- 1.1 Background to the Study (4 substantial paragraphs)
- 1.2 Statement of the Problem (2 paragraphs identifying specific gaps)
- 1.3 Objectives of the Study (1 main + 5 specific objectives)
- 1.4 Research Questions (5 questions matching the objectives)
Target ~1,800-2,000 words. Start with "CHAPTER ONE: INTRODUCTION" then "1.1 Background to the Study". Stop after section 1.4 — do NOT write further sections.`,

  '1-2': `Continue Chapter One (Introduction). Write ONLY these remaining sections (do not repeat earlier sections):
- 1.5 Research Hypotheses (4 hypotheses, both null and alternative)
- 1.6 Significance of the Study (2 paragraphs — academic + practical)
- 1.7 Scope and Limitations of the Study (1 paragraph each)
- 1.8 Definition of Terms (8 key terms with concise definitions)
Target ~1,500-1,800 words. Start directly with "1.5 Research Hypotheses". Do NOT include preamble or chapter heading again.`,

  // ─── Chapter 2 — Literature Review ──────────────
  '2-1': `Write the FIRST HALF of Chapter Two (Literature Review). Include only:
- 2.1 Introduction (1 paragraph framing the review)
- 2.2 Conceptual Framework (define 4-5 key concepts thoroughly, ~150-200 words each, with citations)
- 2.3 Theoretical Framework (2 relevant theories with original authors and dates, ~250-300 words each)
Target ~1,800-2,200 words. Start with "CHAPTER TWO: LITERATURE REVIEW" then "2.1 Introduction". Use proper (Author, Year) in-text citations. Stop after section 2.3.`,

  '2-2': `Continue Chapter Two (Literature Review). Write ONLY these remaining sections (do not repeat earlier sections):
- 2.4 Empirical Review (review 10-12 relevant studies from 2018-2025, ~120-150 words each, with proper (Author, Year) citations and findings)
- 2.5 Research Gaps (1-2 paragraphs identifying what previous studies missed)
- 2.6 Summary of Reviewed Literature (1 paragraph synthesis)
Target ~1,800-2,200 words. Start directly with "2.4 Empirical Review". Do NOT include preamble or chapter heading again.`,

  // ─── Chapter 3 — Methodology ────────────────────
  '3-1': `Write the FIRST HALF of Chapter Three (Research Methodology). Include only:
- 3.1 Introduction (1 short paragraph)
- 3.2 Research Design (justify the chosen design — descriptive survey, case study, etc., 1-2 paragraphs)
- 3.3 Study Area / Population of the Study (describe with realistic numbers)
- 3.4 Sample Size and Sampling Technique (include Taro Yamane formula calculation if applicable)
- 3.5 Sources of Data (primary + secondary)
Target ~1,500-1,800 words. Start with "CHAPTER THREE: RESEARCH METHODOLOGY" then "3.1 Introduction". Stop after section 3.5.`,

  '3-2': `Continue Chapter Three (Research Methodology). Write ONLY these remaining sections (do not repeat earlier sections):
- 3.6 Research Instrument (questionnaire/interview structure, sections, scale used like 5-point Likert)
- 3.7 Validity and Reliability of Instrument (face/content validity, Cronbach's alpha threshold)
- 3.8 Method of Data Analysis (descriptive statistics: frequency, mean; inferential: chi-square, regression, t-test as appropriate)
- 3.9 Ethical Considerations (informed consent, confidentiality, voluntary participation)
Target ~1,400-1,700 words. Start directly with "3.6 Research Instrument". Do NOT include preamble or chapter heading again.`,

  // ─── Chapter 4 — Data Analysis ──────────────────
  '4-1': `Write the FIRST HALF of Chapter Four (Data Presentation and Analysis). Include only:
- 4.1 Introduction (1 paragraph stating response rate)
- 4.2 Demographic Data Presentation (Age, Gender, Educational Level, Years of Experience — present each in markdown tables with realistic frequencies and percentages, with brief interpretation)
- 4.3 Presentation of Research Findings (per objective — 3-4 objectives, each with a markdown frequency table showing simulated Likert-scale responses, plus 1-2 sentences of interpretation)
Target ~1,800-2,200 words. Start with "CHAPTER FOUR: DATA PRESENTATION AND ANALYSIS" then "4.1 Introduction". Use markdown tables. Stop after section 4.3.`,

  '4-2': `Continue Chapter Four (Data Presentation and Analysis). Write ONLY these remaining sections (do not repeat earlier sections):
- 4.4 Analysis and Interpretation of Data (analyze the findings from section 4.3 in depth)
- 4.5 Discussion of Findings (link findings to literature reviewed in Chapter Two — agree/disagree with prior studies, with citations)
- 4.6 Hypotheses Testing (present chi-square or regression results in markdown tables, accept/reject each hypothesis with reasoning)
- 4.7 Summary of Findings (numbered list, 6-8 key findings)
Target ~1,800-2,200 words. Start directly with "4.4 Analysis and Interpretation of Data". Do NOT include chapter heading again.`,

  // ─── Chapter 5 — Summary, Conclusion ────────────
  '5-1': `Write the FIRST HALF of Chapter Five (Summary, Conclusion and Recommendations). Include only:
- 5.1 Summary of the Study (2 paragraphs — recap aim, methodology, key findings)
- 5.2 Summary of Findings (numbered list, 8 specific findings)
- 5.3 Conclusion (2-3 paragraphs synthesizing the study's contribution)
- 5.4 Recommendations (10 specific, actionable recommendations as a numbered list, each addressed to a stakeholder group)
Target ~1,500-1,800 words. Start with "CHAPTER FIVE: SUMMARY, CONCLUSION AND RECOMMENDATIONS" then "5.1 Summary of the Study". Stop after section 5.4.`,

  '5-2': `Continue Chapter Five (Summary, Conclusion and Recommendations). Write ONLY these remaining sections (do not repeat earlier sections):
- 5.5 Contributions to Knowledge (4 specific bullet points)
- 5.6 Limitations of the Study (4 honest limitations, bullet points)
- 5.7 Suggestions for Further Studies (4 specific research directions, bullet points)
- 5.8 References (20-25 references in APA 7th edition format, properly formatted with hanging indents in plain text — mix of journal articles, books, and reports from 2018-2025)
Target ~1,500-1,800 words. Start directly with "5.5 Contributions to Knowledge". Do NOT include chapter heading again.`,
}

export async function POST(request: Request) {
  try {
    const { title, department, field, level, chapterNumber, chapterTitle, part } = await request.json()

    const partNum = (part === 2 ? 2 : 1) as 1 | 2
    const promptKey = `${chapterNumber}-${partNum}`
    const chapterPrompt = CHAPTER_PROMPTS[promptKey]

    if (!chapterPrompt) {
      return NextResponse.json(
        { error: `Invalid chapter ${chapterNumber} part ${partNum}` },
        { status: 400 }
      )
    }

    const STYLE_RULES = `
WRITING STYLE — STRICT RULES:
1. Format headings as plain numbered text on their own lines, e.g. "1.1 Background to the Study". Do NOT use markdown symbols (no #, ##, ###, **, *). The chapter title at the top is the only exception (e.g. "CHAPTER ONE: INTRODUCTION" on its own line).
2. Avoid em dashes (—). Use commas, semicolons, colons, parentheses, or periods instead.
3. Use plain numbered lists (1. 2. 3.) or bullet hyphens (- ) where lists are needed.
4. Write in formal Nigerian academic English. Use full words, not contractions.
5. Use proper paragraph breaks (one blank line between paragraphs).
6. For tables, use clean markdown tables only where Section 4 specifically calls for them.
7. Do not add meta-commentary, prefaces, or "in this chapter we will..." filler. Get straight to the content.
`.trim()

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 3000,
      messages: [{
        role: 'user',
        content: `You are an expert academic writer for Nigerian university final year projects.

Project: "${title}"
Department: ${department}
Field: ${field || 'General'}
Level: ${level}
Writing: Chapter ${chapterNumber} (${chapterTitle}) — PART ${partNum} of 2

${chapterPrompt}

${STYLE_RULES}`,
      }],
    })

    const content = message.content[0].type === 'text' ? message.content[0].text : ''
    return NextResponse.json({ content, part: partNum })
  } catch (error) {
    console.error('Chapter API error:', error)
    const msg = error instanceof Error ? error.message : 'Failed to write chapter'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
