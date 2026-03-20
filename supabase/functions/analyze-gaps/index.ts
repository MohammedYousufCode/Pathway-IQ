import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

async function callGroq(
  groqApiKey: string,
  systemPrompt: string,
  userMessage: string,
  temperature: number
): Promise<Record<string, unknown>> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 50000)

  let groqRes: Response
  try {
    groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3-70b-8192',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        temperature,
        max_tokens: 4096,
        response_format: { type: 'json_object' },
      }),
    })
  } finally {
    clearTimeout(timeout)
  }

  if (!groqRes.ok) {
    const errText = await groqRes.text()
    throw new Error(`Groq API error ${groqRes.status}: ${errText.slice(0, 400)}`)
  }

  const groqData = await groqRes.json()
  const rawContent: string = groqData.choices?.[0]?.message?.content ?? ''

  if (!rawContent) throw new Error('Groq returned an empty response')

  const cleaned = rawContent
    .replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim()

  try {
    return JSON.parse(cleaned)
  } catch {
    throw new Error(`Could not parse AI response as JSON. Raw (first 300 chars): ${cleaned.slice(0, 300)}`)
  }
}

function validateAndNormalize(parsed: Record<string, unknown>): Record<string, unknown> {
  const required = ['job_title', 'readiness_score', 'candidate_skills', 'required_skills', 'skill_gaps', 'learning_pathway']
  for (const field of required) {
    if (!(field in parsed)) throw new Error(`AI response is missing required field: "${field}"`)
  }

  // Always overwrite LLM node IDs with stable sequential ones
  const pathway = parsed.learning_pathway as Array<Record<string, unknown>>
  if (Array.isArray(pathway)) {
    parsed.learning_pathway = pathway.map((node, i) => ({ ...node, id: `node_${i + 1}` }))
  }

  const score = Number(parsed.readiness_score)
  parsed.readiness_score = Math.min(100, Math.max(0, isNaN(score) ? 50 : score))

  return parsed
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const body = await req.json().catch(() => { throw new Error('Invalid JSON in request body') })
    const { resumeText, jdText } = body as { resumeText?: string; jdText?: string }

    if (!resumeText?.trim()) {
      return new Response(
        JSON.stringify({ error: 'Resume text is empty. The PDF may be a scanned image — please use a text-based PDF.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    if (!jdText?.trim() || jdText.trim().length < 50) {
      return new Response(
        JSON.stringify({ error: 'Job description is too short or empty. Please paste the full job description.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const groqApiKey = Deno.env.get('GROQ_API_KEY')
    if (!groqApiKey) throw new Error('GROQ_API_KEY environment variable is not set.')

    const systemPrompt = `You are an expert career coach and skill gap analyzer.
Analyze the candidate's resume against the job description and return ONLY valid JSON.

Return this exact JSON structure:
{
  "job_title": "string",
  "readiness_score": number 0-100,
  "candidate_skills": [{"skill": "string", "level": "Beginner|Intermediate|Advanced|Expert"}],
  "required_skills": [{"skill": "string", "level": "Beginner|Intermediate|Advanced|Expert"}],
  "skill_gaps": [{"skill": "string", "priority": "High|Medium|Low", "reason": "string"}],
  "learning_pathway": [
    {
      "id": "node_1",
      "topic": "string",
      "estimatedTime": "string like '2 weeks'",
      "resources": [{"title": "string", "url": "https://..."}],
      "reason": "string"
    }
  ],
  "reasoning_trace": "string"
}

Rules:
- readiness_score: honest 0-100 integer
- candidate_skills: ALL skills from resume
- required_skills: ALL skills from JD
- skill_gaps: sorted High to Low priority
- learning_pathway: 5-10 nodes, IDs must be node_1 through node_N
- resources: real free URLs (YouTube, MDN, official docs, freeCodeCamp, Coursera)
- Return ONLY the JSON object, nothing else.`

    const userMessage = `RESUME:\n${resumeText.trim().slice(0, 5000)}\n\nJOB DESCRIPTION:\n${jdText.trim().slice(0, 2500)}`

    let parsed: Record<string, unknown>
    try {
      parsed = await callGroq(groqApiKey, systemPrompt, userMessage, 0.2)
    } catch (firstErr) {
      console.warn('First attempt failed, retrying:', firstErr)
      parsed = await callGroq(groqApiKey, systemPrompt, userMessage, 0.1)
    }

    const result = validateAndNormalize(parsed)

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    console.error('analyze-gaps error:', message)
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})