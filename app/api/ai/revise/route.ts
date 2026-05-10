import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'

export const maxDuration = 60
export const runtime = 'nodejs'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

interface ImageAttachment {
  /** Base64 data URL (data:image/png;base64,...) OR pure base64 */
  data: string
  /** image/png, image/jpeg, image/gif, image/webp */
  mediaType?: 'image/png' | 'image/jpeg' | 'image/gif' | 'image/webp'
}

/**
 * Surgically revise a chapter (or any long content) based on a lecturer's
 * feedback. Strict rule: only change what the feedback explicitly mentions.
 * Everything else must be preserved verbatim.
 */
export async function POST(request: Request) {
  try {
    const {
      contentToRevise,         // current chapter text
      kind,                    // 'chapter' | 'structure' | 'section'
      chapterNumber,           // optional context
      chapterTitle,            // optional context
      projectTitle,
      department,
      level,
      feedbackText,            // the lecturer's feedback (text + transcribed audio)
      images,                  // ImageAttachment[]
      audioTranscript,         // optional — already transcribed audio
    } = await request.json()

    if (!contentToRevise || typeof contentToRevise !== 'string') {
      return NextResponse.json({ error: 'No content to revise' }, { status: 400 })
    }
    if (!feedbackText && !audioTranscript && (!images || images.length === 0)) {
      return NextResponse.json({ error: 'No feedback provided' }, { status: 400 })
    }

    const fullFeedback = [
      feedbackText?.trim(),
      audioTranscript ? `Voice note transcript:\n${audioTranscript.trim()}` : '',
    ].filter(Boolean).join('\n\n')

    const contextHeader = kind === 'chapter'
      ? `You are surgically revising Chapter ${chapterNumber} ("${chapterTitle}") of a Nigerian university final year project titled "${projectTitle}".`
      : kind === 'structure'
        ? `You are surgically revising the chapter structure for "${projectTitle}".`
        : `You are surgically revising part of "${projectTitle}".`

    const systemPrompt = `${contextHeader}

You will receive:
1. The CURRENT content
2. The LECTURER'S FEEDBACK (text, possibly transcribed voice note, possibly screenshots)

YOUR JOB:
- Apply ONLY the changes the lecturer explicitly requested.
- Preserve every other paragraph, sentence, and word VERBATIM. Same headings. Same wording. Same structure.
- Do not "improve" anything that wasn't flagged. Do not rephrase passing prose. Do not reorder sections.
- Do not add commentary, prefaces, or change-summaries to the output.
- Output the FULL revised content (revised parts + untouched parts), ready to replace the original.
- Keep the same heading style and section numbering.
- Maintain formal Nigerian academic English. No em dashes (—); use commas, semicolons, or colons.
- If the lecturer asked you to remove something, remove it cleanly. If they asked you to expand, expand. If they asked you to fix a citation, fix only that citation.

Project context:
- Department: ${department}
- Level: ${level}`

    const userBlocks: Anthropic.MessageParam['content'] = []

    // Include any image attachments (screenshots of feedback, marked-up text, etc.)
    if (Array.isArray(images) && images.length > 0) {
      for (const img of images as ImageAttachment[]) {
        const base64 = img.data.includes(',') ? img.data.split(',')[1] : img.data
        userBlocks.push({
          type: 'image',
          source: {
            type: 'base64',
            media_type: img.mediaType ?? 'image/png',
            data: base64,
          },
        })
      }
    }

    userBlocks.push({
      type: 'text',
      text: `LECTURER'S FEEDBACK:
${fullFeedback || '(see attached image)'}

CURRENT CONTENT TO REVISE:
${contentToRevise}

Return ONLY the full revised content, with the lecturer's requested changes applied surgically. Do not include any preamble, summary of changes, or commentary — just the revised content itself, starting from the same heading the original started with.`,
    })

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 6000,
      system: systemPrompt,
      messages: [{ role: 'user', content: userBlocks }],
    })

    const revised = message.content
      .filter(c => c.type === 'text')
      .map(c => (c as Anthropic.TextBlock).text)
      .join('\n')

    if (!revised.trim()) {
      return NextResponse.json({ error: 'AI returned empty revision' }, { status: 500 })
    }

    return NextResponse.json({ revised })
  } catch (err) {
    console.error('Revise error:', err)
    const msg = err instanceof Error ? err.message : 'Revision failed'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
