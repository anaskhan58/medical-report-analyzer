import { NextRequest, NextResponse } from 'next/server'
import { PDFParse } from 'pdf-parse'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file')

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ success: false, error: 'No PDF file provided.' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const parser = new PDFParse({ data: buffer })
    const parsed = await parser.getText()
    const extractedText = parsed.text.trim()

    if (!extractedText) {
      return NextResponse.json({ success: false, error: 'Could not extract text from PDF.' }, { status: 422 })
    }

    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        temperature: 0.3,
        max_tokens: 2048,
        messages: [
          {
            role: 'system',
            content:
              'You are a careful medical assistant. Analyze reports in simple language. Always remind users to consult a real doctor. Respond in paragraphs without markdown.',
          },
          {
            role: 'user',
            content:
              'Please analyze this medical report and provide: 1) Simple summary, 2) Key findings (normal vs abnormal), 3) Red flags, 4) Suggested next steps. MEDICAL REPORT TEXT: ' +
              extractedText,
          },
        ],
      }),
    })

    if (!groqRes.ok) {
      const errText = await groqRes.text()
      console.error('Groq API error:', errText)
      return NextResponse.json({ success: false, error: 'Groq API request failed.' }, { status: 502 })
    }

    const groqData = await groqRes.json()
    const analysis = groqData.choices?.[0]?.message?.content ?? ''

    return NextResponse.json({ success: true, analysis })
  } catch (err) {
    console.error('Analyze route error:', err)
    return NextResponse.json({ success: false, error: 'Internal server error.' }, { status: 500 })
  }
}
