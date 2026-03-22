import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function getScoreColor(score: number): string {
  if (score >= 70) return '#22c55e'
  if (score >= 40) return '#f59e0b'
  return '#ef4444'
}

function getScoreLabel(score: number): string {
  if (score >= 70) return 'Role Ready'
  if (score >= 40) return 'Developing'
  return 'Needs Work'
}

function buildEmailHtml(params: {
  userName: string
  jobTitle: string
  readinessScore: number
  topGaps: string[]
  roadmapUrl: string
}): string {
  const { userName, jobTitle, readinessScore, topGaps, roadmapUrl } = params
  const scoreColor = getScoreColor(readinessScore)
  const scoreLabel = getScoreLabel(readinessScore)
  const firstName = userName.split(' ')[0] || 'there'

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Your PathwayIQ Analysis Results</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', Arial, sans-serif; background: #0a0f1e; color: #e2e8f0; }
    .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
    .card { background: #1a2744; border-radius: 16px; border: 1px solid rgba(124,58,237,0.2); overflow: hidden; }
    .header { background: linear-gradient(135deg, #0F172A 0%, #1e1060 100%); padding: 36px 36px 28px; text-align: center; }
    .logo { display: inline-flex; align-items: center; gap: 8px; margin-bottom: 20px; }
    .logo-icon { width: 36px; height: 36px; background: #7C3AED; border-radius: 10px; display: flex; align-items: center; justify-content: center; }
    .logo-text { font-size: 20px; font-weight: 800; color: white; }
    .header h1 { font-size: 22px; font-weight: 700; color: white; margin-bottom: 6px; }
    .header p { color: rgba(255,255,255,0.5); font-size: 14px; }
    .body { padding: 32px 36px; }
    .greeting { font-size: 16px; color: #e2e8f0; margin-bottom: 8px; }
    .intro { font-size: 14px; color: rgba(255,255,255,0.55); line-height: 1.6; margin-bottom: 28px; }
    .score-block { background: rgba(124,58,237,0.08); border: 1px solid rgba(124,58,237,0.2); border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px; }
    .score-label { font-size: 12px; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 10px; }
    .score-value { font-size: 52px; font-weight: 900; line-height: 1; margin-bottom: 8px; }
    .score-badge { display: inline-block; font-size: 12px; font-weight: 600; padding: 4px 14px; border-radius: 20px; }
    .gaps-block { margin-bottom: 28px; }
    .gaps-title { font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.5); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 12px; }
    .gap-item { display: flex; align-items: center; gap: 10px; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.05); }
    .gap-item:last-child { border-bottom: none; }
    .gap-dot { width: 8px; height: 8px; border-radius: 50%; background: #7C3AED; flex-shrink: 0; }
    .gap-text { font-size: 14px; color: #cbd5e1; }
    .cta-block { text-align: center; margin-bottom: 24px; }
    .cta-btn { display: inline-block; background: #7C3AED; color: white; font-weight: 700; font-size: 15px; padding: 14px 32px; border-radius: 10px; text-decoration: none; }
    .footer { padding: 20px 36px; border-top: 1px solid rgba(255,255,255,0.06); text-align: center; }
    .footer p { font-size: 12px; color: rgba(255,255,255,0.25); line-height: 1.6; }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="header">
        <div class="logo">
          <div class="logo-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M6 18 L12 6 L18 18" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <span class="logo-text">PathwayIQ</span>
        </div>
        <h1>Your Analysis is Ready</h1>
        <p>From Resume to Ready — In Minutes</p>
      </div>

      <div class="body">
        <p class="greeting">Hey ${firstName} 👋</p>
        <p class="intro">
          Your AI skill gap analysis for <strong style="color:#a78bfa">${jobTitle}</strong> is complete. 
          Here's what we found — and what to do next.
        </p>

        <div class="score-block">
          <div class="score-label">Overall Readiness Score</div>
          <div class="score-value" style="color: ${scoreColor}">${readinessScore}%</div>
          <span class="score-badge" style="color: ${scoreColor}; background: ${scoreColor}22; border: 1px solid ${scoreColor}44">
            ${scoreLabel}
          </span>
        </div>

        ${topGaps.length > 0 ? `
        <div class="gaps-block">
          <div class="gaps-title">Top Skill Gaps to Address</div>
          ${topGaps.map(gap => `
            <div class="gap-item">
              <div class="gap-dot"></div>
              <span class="gap-text">${gap}</span>
            </div>
          `).join('')}
        </div>
        ` : ''}

        <div class="cta-block">
          <a href="${roadmapUrl}" class="cta-btn">View Your Learning Roadmap →</a>
        </div>

        <p style="font-size:13px; color: rgba(255,255,255,0.4); text-align:center; line-height:1.6;">
          Your personalized roadmap contains step-by-step modules with curated resources to close every gap identified above.
        </p>
      </div>

      <div class="footer">
        <p>©️ ${new Date().getFullYear()} PathwayIQ · AI-powered onboarding that learns you, not the other way around.</p>
        <p style="margin-top:6px;">You received this email because you completed an analysis on PathwayIQ.</p>
      </div>
    </div>
  </div>
</body>
</html>`
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { userEmail, userName, jobTitle, readinessScore, topGaps, roadmapUrl } = await req.json()

    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    if (!resendApiKey) throw new Error('RESEND_API_KEY not configured')

    const html = buildEmailHtml({ userName, jobTitle, readinessScore, topGaps: topGaps || [], roadmapUrl })

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'PathwayIQ <onboarding@resend.dev>',
        to: [userEmail],
        subject: `Your PathwayIQ results: ${readinessScore}% ready for ${jobTitle}`,
        html,
      }),
    })

    if (!res.ok) {
      const errText = await res.text()
      throw new Error(`Resend API error: ${errText}`)
    }

    const data = await res.json()
    return new Response(JSON.stringify({ success: true, id: data.id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('send-result-email error:', err)
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Failed to send email' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
