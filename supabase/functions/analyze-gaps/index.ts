import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { resumeText, jdText, userEmail, userName } = await req.json()

    if (!resumeText || !jdText) {
      return new Response(
        JSON.stringify({ error: 'resumeText and jdText are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const groqApiKey = Deno.env.get('GROQ_API_KEY')
    if (!groqApiKey) throw new Error('GROQ_API_KEY not configured')

    const systemPrompt = `You are an expert career coach and skill gap analyzer. 
Analyze the candidate's resume against the job description and return ONLY valid JSON — no markdown, no backticks, no extra text.

Return this exact JSON structure:
{
  "job_title": "string - the job title from the JD",
  "readiness_score": number between 0-100,
  "candidate_skills": [{"skill": "string", "level": "Beginner|Intermediate|Advanced|Expert"}],
  "required_skills": [{"skill": "string", "level": "Beginner|Intermediate|Advanced|Expert"}],
  "skill_gaps": [{"skill": "string", "priority": "High|Medium|Low", "reason": "string"}],
  "learning_pathway": [
    {
      "id": "node_1",
      "topic": "string",
      "estimatedTime": "string like '2 weeks'",
      "resources": [{"title": "string", "url": "https://..."}],
      "reason": "string explaining why this is needed"
    }
  ],
  "reasoning_trace": "string explaining your analysis methodology"
}

Rules:
- readiness_score: honest percentage (0=completely unqualified, 100=perfect match)
- candidate_skills: extract ALL skills from the resume (technical and soft)
- required_skills: extract ALL skills mentioned or implied in the JD
- skill_gaps: only gaps that matter for the role, sorted by priority
- learning_pathway: 5-10 ordered learning nodes to close the gaps
- resources: real, working URLs to free resources (MDN, YouTube, official docs, Coursera, etc.)
- reasoning_trace: 2-3 sentences explaining your scoring methodology`

    const userMessage = `RESUME:\n${resumeText.slice(0, 6000)}\n\nJOB DESCRIPTION:\n${jdText.slice(0, 3000)}`

    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        temperature: 0.3,
        max_tokens: 4096,
      }),
    })

    if (!groqRes.ok) {
      const errText = await groqRes.text()
      throw new Error(`Groq API error: ${errText}`)
    }

    const groqData = await groqRes.json()
    const rawContent = groqData.choices?.[0]?.message?.content || ''

    let parsed
    try {
      const cleaned = rawContent
        .replace(/```json\s*/gi, '')
        .replace(/```\s*/g, '')
        .trim()
      parsed = JSON.parse(cleaned)
    } catch {
      throw new Error(`Failed to parse AI response as JSON: ${rawContent.slice(0, 200)}`)
    }

    const required = ['job_title', 'readiness_score', 'candidate_skills', 'required_skills', 'skill_gaps', 'learning_pathway']
    for (const field of required) {
      if (!(field in parsed)) throw new Error(`Missing field in AI response: ${field}`)
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('analyze-gaps error:', err)
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
