import { useState, useRef, useEffect, useCallback } from 'react'

/* ─── Font injection ─────────────────────────────────────────────────────── */
{
  const l = document.createElement('link')
  l.rel = 'stylesheet'
  l.href = 'https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Crimson+Pro:ital,wght@0,300;0,400;0,600;1,300;1,400&family=IBM+Plex+Mono:wght@400;500&display=swap'
  document.head.appendChild(l)
}

/* ─── Global styles ──────────────────────────────────────────────────────── */
const STYLES = `
:root {
  --ink: #0a0f1e;
  --ink2: #0f1729;
  --ink3: #162040;
  --glass: rgba(255,255,255,0.035);
  --glass2: rgba(255,255,255,0.06);
  --rim: rgba(255,255,255,0.08);
  --rim2: rgba(255,255,255,0.13);
  --snow: #f0f6ff;
  --mist: #8899bb;
  --fog: #4a5878;
  --teal: #00d4aa;
  --teal2: #00f0c2;
  --sky: #3b8bff;
  --rose: #ff4d6d;
  --amber: #ffb347;
  --violet: #a78bfa;
  --glow-t: rgba(0,212,170,0.18);
  --glow-s: rgba(59,139,255,0.18);
  --ff-head: 'Outfit', sans-serif;
  --ff-body: 'Crimson Pro', serif;
  --ff-mono: 'IBM Plex Mono', monospace;
}
.ha-root {
  font-family: var(--ff-head);
  background: var(--ink);
  min-height: 100vh;
  color: var(--snow);
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
}
/* animated bg */
.ha-bg {
  position: fixed; inset: 0; z-index: 0; pointer-events: none;
  background:
    radial-gradient(ellipse 70% 55% at 15% 10%, rgba(0,212,170,0.10) 0%, transparent 65%),
    radial-gradient(ellipse 60% 50% at 85% 85%, rgba(59,139,255,0.10) 0%, transparent 60%),
    radial-gradient(ellipse 40% 35% at 50% 50%, rgba(167,139,250,0.04) 0%, transparent 70%);
}
.ha-grid {
  position: fixed; inset: 0; z-index: 0; pointer-events: none; opacity: 0.025;
  background-image: linear-gradient(var(--rim) 1px, transparent 1px), linear-gradient(90deg, var(--rim) 1px, transparent 1px);
  background-size: 48px 48px;
}

/* ── Layout ── */
.ha-shell {
  position: relative; z-index: 1;
  display: flex; flex-direction: column; min-height: 100vh;
  max-width: 1100px; margin: 0 auto; width: 100%;
  padding: 0 20px 48px;
}

/* ── Header ── */
.ha-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 22px 0 20px; border-bottom: 1px solid var(--rim);
  margin-bottom: 32px; animation: haSlideDown .55s ease both;
}
.ha-logo { display: flex; align-items: center; gap: 12px; }
.ha-logo-orb {
  width: 40px; height: 40px; border-radius: 12px;
  background: linear-gradient(135deg, var(--teal), var(--sky));
  display: flex; align-items: center; justify-content: center;
  font-size: 20px; box-shadow: 0 0 20px rgba(0,212,170,0.35);
  animation: haPulseOrb 3s ease-in-out infinite;
}
.ha-logo-text { font-size: 17px; font-weight: 800; letter-spacing: -0.02em; }
.ha-logo-sub { font-size: 10px; color: var(--mist); font-family: var(--ff-mono); letter-spacing: .08em; margin-top: 1px; }
.ha-status-pill {
  display: flex; align-items: center; gap: 7px; padding: 6px 14px;
  background: var(--glass); border: 1px solid var(--rim2); border-radius: 100px;
  font-size: 11px; font-family: var(--ff-mono); color: var(--teal);
}
.ha-status-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--teal); animation: haBlink 2s infinite; }

/* ── Hero ── */
.ha-hero {
  text-align: center; margin-bottom: 36px;
  animation: haFadeUp .65s ease both; animation-delay: .1s;
}
.ha-hero-tag {
  display: inline-flex; align-items: center; gap: 6px; margin-bottom: 14px;
  padding: 5px 16px; border-radius: 100px;
  background: rgba(0,212,170,0.08); border: 1px solid rgba(0,212,170,0.2);
  font-size: 11px; font-family: var(--ff-mono); color: var(--teal2); letter-spacing: .06em;
}
.ha-hero h1 {
  font-size: clamp(28px, 5.5vw, 52px); font-weight: 900; line-height: 1.1;
  letter-spacing: -0.03em; margin-bottom: 14px;
  background: linear-gradient(135deg, var(--snow) 30%, var(--teal) 100%);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
}
.ha-hero-desc {
  font-family: var(--ff-body); font-size: 17px; color: var(--mist);
  max-width: 520px; margin: 0 auto; line-height: 1.7;
}

/* ── Topic cards ── */
.ha-topics { margin-bottom: 32px; animation: haFadeUp .65s ease both; animation-delay: .18s; }
.ha-topics-title {
  font-size: 11px; font-family: var(--ff-mono); color: var(--fog);
  letter-spacing: .1em; text-transform: uppercase; margin-bottom: 14px;
}
.ha-topics-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(155px, 1fr)); gap: 10px; }
.ha-topic-card {
  background: var(--glass); border: 1px solid var(--rim);
  border-radius: 16px; padding: 14px 14px 12px; cursor: pointer;
  transition: all .22s; display: flex; flex-direction: column; gap: 8px;
}
.ha-topic-card:hover, .ha-topic-card.active {
  background: var(--glass2); border-color: var(--rim2);
  transform: translateY(-2px);
}
.ha-topic-card.active { border-color: var(--teal); box-shadow: 0 0 16px rgba(0,212,170,0.12); }
.ha-topic-icon { font-size: 22px; }
.ha-topic-name { font-size: 12px; font-weight: 700; color: var(--snow); }
.ha-topic-desc { font-size: 11px; color: var(--mist); font-family: var(--ff-body); font-style: italic; line-height: 1.4; }

/* ── Vitals quick-input ── */
.ha-vitals-bar {
  display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 24px;
  padding: 16px 18px; background: var(--glass); border: 1px solid var(--rim);
  border-radius: 16px; animation: haFadeUp .65s ease both; animation-delay: .24s;
}
.ha-vital-item { display: flex; flex-direction: column; gap: 4px; flex: 1; min-width: 100px; }
.ha-vital-label { font-size: 10px; font-family: var(--ff-mono); color: var(--fog); letter-spacing: .06em; }
.ha-vital-input {
  background: var(--ink3); border: 1px solid var(--rim); border-radius: 8px;
  padding: 7px 10px; color: var(--snow); font-family: var(--ff-mono); font-size: 13px;
  outline: none; width: 100%; transition: border-color .2s;
}
.ha-vital-input:focus { border-color: var(--teal); }
.ha-vital-input::placeholder { color: var(--fog); }
.ha-vital-btn {
  align-self: flex-end; padding: 8px 18px; border-radius: 9px;
  background: linear-gradient(135deg, var(--teal), var(--sky));
  border: none; color: #fff; font-family: var(--ff-head); font-size: 12px;
  font-weight: 700; cursor: pointer; white-space: nowrap; transition: all .2s;
  box-shadow: 0 2px 12px rgba(0,212,170,0.25);
}
.ha-vital-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 20px rgba(0,212,170,0.35); }

/* ── Chat area ── */
.ha-chat-wrap {
  flex: 1; display: flex; flex-direction: column; gap: 0;
  background: var(--glass); border: 1px solid var(--rim);
  border-radius: 22px; overflow: hidden;
  animation: haFadeUp .65s ease both; animation-delay: .3s;
  box-shadow: 0 8px 40px rgba(0,0,0,0.3);
}
.ha-chat-topbar {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 20px; border-bottom: 1px solid var(--rim);
  background: var(--glass2);
}
.ha-chat-topbar-left { display: flex; align-items: center; gap: 10px; }
.ha-chat-avatar {
  width: 34px; height: 34px; border-radius: 10px;
  background: linear-gradient(135deg, var(--teal), var(--sky));
  display: flex; align-items: center; justify-content: center; font-size: 16px;
  box-shadow: 0 0 12px rgba(0,212,170,0.3);
}
.ha-chat-name { font-size: 13px; font-weight: 700; }
.ha-chat-role { font-size: 10px; color: var(--mist); font-family: var(--ff-mono); }
.ha-chat-actions { display: flex; gap: 8px; }
.ha-action-btn {
  padding: 5px 12px; border-radius: 8px; border: 1px solid var(--rim);
  background: transparent; color: var(--mist); font-size: 11px;
  font-family: var(--ff-head); cursor: pointer; transition: all .2s;
}
.ha-action-btn:hover { border-color: var(--rim2); color: var(--snow); }

/* messages */
.ha-messages {
  flex: 1; overflow-y: auto; padding: 20px;
  display: flex; flex-direction: column; gap: 16px;
  min-height: 360px; max-height: 460px;
}
.ha-messages::-webkit-scrollbar { width: 4px; }
.ha-messages::-webkit-scrollbar-thumb { background: var(--rim2); border-radius: 4px; }

.ha-msg { display: flex; gap: 10px; animation: haFadeUp .3s ease; }
.ha-msg.user { flex-direction: row-reverse; }

.ha-msg-ava {
  width: 32px; height: 32px; border-radius: 9px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center; font-size: 15px;
}
.ha-msg-ava.ai { background: linear-gradient(135deg, var(--teal), var(--sky)); }
.ha-msg-ava.user { background: rgba(167,139,250,0.2); border: 1px solid rgba(167,139,250,0.3); }

.ha-bubble {
  max-width: 78%; padding: 12px 15px; border-radius: 16px;
  font-size: 14px; line-height: 1.68;
}
.ha-bubble.ai {
  background: var(--ink3); border: 1px solid var(--rim);
  color: var(--snow); font-family: var(--ff-body); font-size: 15px;
  border-top-left-radius: 4px;
}
.ha-bubble.user {
  background: rgba(59,139,255,0.15); border: 1px solid rgba(59,139,255,0.22);
  color: #c7dcff; border-top-right-radius: 4px; font-family: var(--ff-head);
}
.ha-bubble.ai strong { color: var(--teal2); }
.ha-bubble.ai em { color: var(--mist); font-style: italic; }
.ha-bubble.ai code {
  background: rgba(0,212,170,0.1); border: 1px solid rgba(0,212,170,0.15);
  border-radius: 4px; padding: 1px 6px; font-family: var(--ff-mono);
  font-size: 12px; color: var(--teal2);
}
.ha-bubble-meta { font-size: 10px; color: var(--fog); font-family: var(--ff-mono); margin-top: 6px; }

/* typing */
.ha-typing { display: flex; gap: 5px; align-items: center; padding: 6px 2px; }
.ha-dot {
  width: 7px; height: 7px; border-radius: 50%; background: var(--teal);
  animation: haBounce 1.3s infinite;
}
.ha-dot:nth-child(2) { animation-delay: .18s; background: var(--sky); }
.ha-dot:nth-child(3) { animation-delay: .36s; background: var(--violet); }

/* quick suggestions */
.ha-suggestions {
  padding: 12px 20px 0;
  display: flex; gap: 8px; flex-wrap: wrap; border-top: 1px solid var(--rim);
  background: var(--glass);
}
.ha-sug-btn {
  padding: 6px 13px; border-radius: 100px;
  border: 1px solid var(--rim2); background: transparent;
  color: var(--mist); font-size: 12px; font-family: var(--ff-head);
  cursor: pointer; transition: all .2s; white-space: nowrap;
}
.ha-sug-btn:hover { border-color: var(--teal); color: var(--teal); }
.ha-sug-btn:disabled { opacity: .4; cursor: not-allowed; }

/* input bar */
.ha-input-bar {
  display: flex; gap: 10px; padding: 14px 16px;
  border-top: 1px solid var(--rim); background: var(--glass2);
  align-items: flex-end;
}
.ha-textarea {
  flex: 1; background: var(--ink3); border: 1px solid var(--rim);
  border-radius: 14px; padding: 11px 15px; color: var(--snow);
  font-family: var(--ff-head); font-size: 14px; outline: none;
  resize: none; min-height: 46px; max-height: 130px;
  transition: border-color .2s; line-height: 1.5;
}
.ha-textarea:focus { border-color: var(--teal); }
.ha-textarea::placeholder { color: var(--fog); }
.ha-send-btn {
  width: 46px; height: 46px; border-radius: 13px; border: none; flex-shrink: 0;
  background: linear-gradient(135deg, var(--teal), var(--sky));
  color: #fff; font-size: 18px; cursor: pointer; transition: all .22s;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 2px 14px rgba(0,212,170,0.3);
}
.ha-send-btn:hover:not(:disabled) { transform: scale(1.07); box-shadow: 0 4px 22px rgba(0,212,170,0.45); }
.ha-send-btn:disabled { opacity: .4; cursor: not-allowed; }

/* ── Health cards row ── */
.ha-cards-row {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px; margin-bottom: 24px;
  animation: haFadeUp .65s ease both; animation-delay: .12s;
}
.ha-stat-card {
  background: var(--glass); border: 1px solid var(--rim);
  border-radius: 16px; padding: 16px; display: flex; flex-direction: column; gap: 10px;
}
.ha-stat-top { display: flex; align-items: center; justify-content: space-between; }
.ha-stat-icon { font-size: 20px; }
.ha-stat-badge {
  font-size: 10px; font-family: var(--ff-mono); padding: 3px 8px;
  border-radius: 100px; letter-spacing: .04em;
}
.badge-ok   { background: rgba(0,212,170,0.12); color: var(--teal); }
.badge-warn { background: rgba(255,179,71,0.12); color: var(--amber); }
.badge-risk { background: rgba(255,77,109,0.12); color: var(--rose); }
.ha-stat-val { font-size: 22px; font-weight: 800; color: var(--snow); letter-spacing: -0.02em; }
.ha-stat-unit { font-size: 11px; font-family: var(--ff-mono); color: var(--fog); }
.ha-stat-label { font-size: 12px; color: var(--mist); }
.ha-stat-bar { height: 3px; border-radius: 100px; background: var(--ink3); overflow: hidden; }
.ha-stat-fill { height: 100%; border-radius: 100px; transition: width .8s ease; }

/* disclaimer */
.ha-disclaimer {
  margin-top: 20px; padding: 12px 16px;
  background: rgba(255,179,71,0.06); border: 1px solid rgba(255,179,71,0.15);
  border-radius: 12px; font-size: 12px; color: rgba(255,179,71,0.8);
  font-family: var(--ff-body); font-style: italic; text-align: center;
  line-height: 1.6;
}

/* ── Animations ── */
@keyframes haSlideDown { from { opacity:0; transform:translateY(-16px); } to { opacity:1; transform:none; } }
@keyframes haFadeUp    { from { opacity:0; transform:translateY(14px);  } to { opacity:1; transform:none; } }
@keyframes haBlink     { 0%,100%{opacity:1} 50%{opacity:.3} }
@keyframes haBounce    { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-7px)} }
@keyframes haPulseOrb  { 0%,100%{box-shadow:0 0 20px rgba(0,212,170,.35)} 50%{box-shadow:0 0 30px rgba(0,212,170,.55)} }
@keyframes haSpin      { to{transform:rotate(360deg)} }

@media(max-width:640px){
  .ha-hero h1 { font-size:26px; }
  .ha-topics-grid { grid-template-columns:repeat(2,1fr); }
  .ha-cards-row { grid-template-columns:repeat(2,1fr); }
  .ha-vitals-bar { gap:8px; }
}
`

/* ─── System Prompt ──────────────────────────────────────────────────────── */
const SYSTEM = `You are Dr. Aiden — an advanced AI Health Assistant integrated into a personal health dashboard. You are warm, empathetic, evidence-based, and highly knowledgeable.

Your specialties:
1. **Blood Pressure Management** — DASH diet, sodium limits (<2300mg/day), potassium-rich foods, exercise protocols (150 min moderate/week), stress reduction (meditation, yoga), medication side effects, home monitoring tips. BP targets: Normal <120/80, Stage 1 HT 130-139/80-89, Stage 2 ≥140/90, Crisis >180/120.
2. **Blood Sugar / Diabetes** — glycemic index education, carb counting, meal timing, fasting glucose interpretation (Normal 70-100, Pre-diabetes 100-125, Diabetes ≥126 mg/dL), HbA1c interpretation, hypoglycemia recognition (<70 mg/dL: shakiness, sweating, confusion → eat 15g fast carbs immediately), Type 1 vs Type 2 differences, insulin basics.
3. **Heart Health** — cholesterol management, cardiac risk factors, warning signs (chest pain + shortness of breath + left arm pain = call emergency immediately), ECG basics, heart rate zones for exercise.
4. **General Wellness** — sleep hygiene, hydration (8-10 glasses/day), mental health, immunity, weight management, vitamins & supplements.
5. **Medication Guidance** — common drug interactions, when to take medications, side effect management (always recommend consulting pharmacist/doctor for specific prescriptions).
6. **Symptom Analysis** — triage severity, red flags that need emergency care vs. routine care.

Response formatting rules:
- Use **bold** for key terms, numbers, and important warnings
- Use bullet points (• ) for lists
- Use section headers like "## What This Means" when answering complex questions
- Keep responses warm and human, not robotic
- For emergencies (BP >180/120, blood sugar <50 or >400, chest pain, stroke signs): respond with ⚠️ URGENT prefix and clear emergency instructions FIRST
- End responses with a follow-up question to keep the conversation going
- If vitals are shared, interpret them specifically and give personalized advice
- Always remind users to consult their doctor for medication changes or diagnosis

Tone: Like a brilliant, caring doctor friend who speaks plainly, gives real actionable advice, and never dismisses concerns.`

/* ─── Topics ─────────────────────────────────────────────────────────────── */
const TOPICS = [
  { id: 'bp', icon: '❤️', name: 'Blood Pressure', desc: 'Monitor & manage hypertension', color: '#ff4d6d', prompt: 'Tell me everything I need to know to manage my blood pressure effectively — diet, exercise, lifestyle, and monitoring tips.' },
  { id: 'sugar', icon: '🩸', name: 'Blood Sugar', desc: 'Diabetes & glucose control', color: '#ffb347', prompt: 'Give me a comprehensive guide to managing blood sugar levels, including what to eat, what to avoid, and how to interpret my readings.' },
  { id: 'heart', icon: '💓', name: 'Heart Health', desc: 'Cardiac care & prevention', color: '#ff4d6d', prompt: 'What are the most important things I can do for my heart health? Include diet, exercise, warning signs, and risk factors.' },
  { id: 'diet', icon: '🥗', name: 'Nutrition', desc: 'Healing diets & meal plans', color: '#00d4aa', prompt: 'Design me a heart-healthy, BP-friendly, and blood-sugar-stable meal plan with specific food recommendations.' },
  { id: 'sleep', icon: '😴', name: 'Sleep & Stress', desc: 'Recovery & mental wellness', color: '#a78bfa', prompt: 'How does sleep and stress impact blood pressure and blood sugar? Give me a complete plan to improve both.' },
  { id: 'meds', icon: '💊', name: 'Medications', desc: 'Drug info & interactions', color: '#3b8bff', prompt: 'What should I know about common blood pressure and diabetes medications — how they work, side effects, and important interactions?' },
  { id: 'exercise', icon: '🏃', name: 'Exercise', desc: 'Safe workouts for your health', color: '#00d4aa', prompt: 'What is the best exercise plan for someone managing high blood pressure and blood sugar? Include safe intensity levels and weekly schedule.' },
  { id: 'emergency', icon: '🚨', name: 'Emergency Signs', desc: 'Know when to call for help', color: '#ff4d6d', prompt: 'What are the emergency warning signs I should never ignore for blood pressure, blood sugar, heart attack, and stroke? What do I do in each case?' },
]

/* ─── Quick suggestions ──────────────────────────────────────────────────── */
const QUICK = [
  'What should my BP target be?',
  'Foods to avoid with high BP',
  'Is my blood sugar reading normal?',
  'DASH diet explained',
  'Signs of a hypertensive crisis',
  'How to check BP at home correctly',
  'Best time to take BP medication',
  'Low blood sugar emergency steps',
]

/* ─── Markdown-ish renderer ──────────────────────────────────────────────── */
function renderMarkdown(text) {
  const lines = text.split('\n')
  const result = []
  let key = 0

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (!line.trim()) { result.push(<br key={key++} />); continue }

    const formatted = line
      .replace(/\*\*(.*?)\*\*/g, (_, t) => `<strong>${t}</strong>`)
      .replace(/\*(.*?)\*/g, (_, t) => `<em>${t}</em>`)
      .replace(/`(.*?)`/g, (_, t) => `<code>${t}</code>`)

    if (line.startsWith('## ')) {
      result.push(
        <div key={key++} style={{ fontFamily: 'var(--ff-head)', fontWeight: 700, fontSize: 13, color: 'var(--teal2)', letterSpacing: '.04em', textTransform: 'uppercase', marginTop: 14, marginBottom: 4 }}>
          {line.replace('## ', '')}
        </div>
      )
    } else if (line.startsWith('• ') || line.startsWith('- ')) {
      result.push(
        <div key={key++} style={{ display: 'flex', gap: 8, marginBottom: 3 }}>
          <span style={{ color: 'var(--teal)', flexShrink: 0, marginTop: 2 }}>•</span>
          <span dangerouslySetInnerHTML={{ __html: formatted.replace(/^[•\-]\s/, '') }} />
        </div>
      )
    } else if (line.startsWith('⚠️')) {
      result.push(
        <div key={key++} style={{ background: 'rgba(255,77,109,0.12)', border: '1px solid rgba(255,77,109,0.25)', borderRadius: 10, padding: '10px 13px', marginBottom: 6 }}>
          <span dangerouslySetInnerHTML={{ __html: formatted }} />
        </div>
      )
    } else {
      result.push(<span key={key++} dangerouslySetInnerHTML={{ __html: formatted + ' ' }} />)
    }
  }

  return result
}

/* ─── Stat Card ──────────────────────────────────────────────────────────── */
function StatCard({ icon, label, value, unit, badge, badgeCls, fillPct, fillColor }) {
  const barRef = useRef(null)
  useEffect(() => {
    setTimeout(() => { if (barRef.current) barRef.current.style.width = fillPct + '%' }, 300)
  }, [fillPct])

  return (
    <div className="ha-stat-card">
      <div className="ha-stat-top">
        <span className="ha-stat-icon">{icon}</span>
        <span className={`ha-stat-badge ${badgeCls}`}>{badge}</span>
      </div>
      <div>
        <span className="ha-stat-val">{value}</span>
        <span className="ha-stat-unit"> {unit}</span>
      </div>
      <div className="ha-stat-label">{label}</div>
      <div className="ha-stat-bar">
        <div className="ha-stat-fill" ref={barRef} style={{ width: 0, background: fillColor }} />
      </div>
    </div>
  )
}

/* ─── Main Component ─────────────────────────────────────────────────────── */
export default function AIHealthAssistant() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hello! I'm **Dr. Aiden**, your AI Health Assistant. 🌿

I'm here to help you understand and manage your health — specializing in **blood pressure**, **blood sugar**, **heart health**, and overall wellness.

Here's what I can do for you:
• Interpret your BP and blood sugar readings
• Give personalized diet and lifestyle advice
• Explain medications and their effects
• Identify warning signs that need urgent care
• Create custom wellness plans

You can **enter your vitals above**, **pick a health topic**, or just **ask me anything**. What's on your mind today?`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [activeTopic, setActiveTopic] = useState(null)
  const [vitals, setVitals] = useState({ bp: '', sugar: '', weight: '', age: '' })
  const chatEndRef = useRef(null)
  const textareaRef = useRef(null)

  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = STYLES
    document.head.appendChild(style)
    return () => document.head.removeChild(style)
  }, [])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const autoResizeTextarea = () => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = Math.min(ta.scrollHeight, 130) + 'px'
  }

  const callAI = useCallback(async (userText) => {
    if (!userText.trim() || loading) return

    const userMsg = {
      role: 'user',
      content: userText.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)
    if (textareaRef.current) textareaRef.current.style.height = 'auto'

    const history = [...messages, userMsg].map(m => ({ role: m.role, content: m.content }))

    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          system: SYSTEM,
          messages: history,
        }),
      })
      const data = await res.json()
      const reply = data?.content?.[0]?.text ?? 'I had trouble responding. Please try again.'
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: reply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }])
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '⚠️ Connection error. Please check your network and try again.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }])
    } finally {
      setLoading(false)
    }
  }, [messages, loading])

  const handleTopicClick = (topic) => {
    setActiveTopic(topic.id)
    callAI(topic.prompt)
  }

  const submitVitals = () => {
    const parts = []
    if (vitals.bp)     parts.push(`Blood Pressure: ${vitals.bp} mmHg`)
    if (vitals.sugar)  parts.push(`Blood Sugar: ${vitals.sugar} mg/dL`)
    if (vitals.weight) parts.push(`Weight: ${vitals.weight} kg`)
    if (vitals.age)    parts.push(`Age: ${vitals.age} years`)
    if (!parts.length) return
    callAI(`Here are my current vitals — please analyze them and give me personalized advice:\n${parts.join('\n')}`)
    setVitals({ bp: '', sugar: '', weight: '', age: '' })
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); callAI(input) }
  }

  // derive display vitals for stat cards (last shared)
  const lastAssistant = messages.filter(m => m.role === 'assistant').slice(-1)[0]

  return (
    <div className="ha-root">
      <div className="ha-bg" />
      <div className="ha-grid" />

      <div className="ha-shell">
        {/* Header */}
        <header className="ha-header">
          <div className="ha-logo">
            <div className="ha-logo-orb">🩺</div>
            <div>
              <div className="ha-logo-text">HealthAI</div>
              <div className="ha-logo-sub">POWERED BY CLAUDE</div>
            </div>
          </div>
          <div className="ha-status-pill">
            <span className="ha-status-dot" />
            AI Online · Ready
          </div>
        </header>

        {/* Hero */}
        <div className="ha-hero">
          <div className="ha-hero-tag">✦ YOUR PERSONAL AI DOCTOR</div>
          <h1>Meet Dr. Aiden,<br />Your AI Health Assistant</h1>
          <p className="ha-hero-desc">
            Expert guidance on blood pressure, blood sugar, heart health, and wellness — 
            personalized to you, available 24/7.
          </p>
        </div>

        {/* Stat cards */}
        <div className="ha-cards-row">
          <StatCard icon="❤️" label="BP Target (Normal)" value="120/80" unit="mmHg" badge="Normal" badgeCls="badge-ok" fillPct={60} fillColor="linear-gradient(90deg,#00d4aa,#3b8bff)" />
          <StatCard icon="🩸" label="Fasting Sugar (Normal)" value="70–100" unit="mg/dL" badge="Healthy" badgeCls="badge-ok" fillPct={50} fillColor="linear-gradient(90deg,#ffb347,#ff4d6d)" />
          <StatCard icon="💓" label="Resting Heart Rate" value="60–100" unit="bpm" badge="Normal" badgeCls="badge-ok" fillPct={55} fillColor="linear-gradient(90deg,#ff4d6d,#a78bfa)" />
          <StatCard icon="🧠" label="Stage 2 HT Threshold" value="≥140/90" unit="mmHg" badge="Know This" badgeCls="badge-warn" fillPct={75} fillColor="linear-gradient(90deg,#ffb347,#ff4d6d)" />
        </div>

        {/* Topic cards */}
        <div className="ha-topics">
          <div className="ha-topics-title">▸ Explore Health Topics</div>
          <div className="ha-topics-grid">
            {TOPICS.map(t => (
              <div
                key={t.id}
                className={`ha-topic-card${activeTopic === t.id ? ' active' : ''}`}
                onClick={() => handleTopicClick(t)}
              >
                <span className="ha-topic-icon">{t.icon}</span>
                <div className="ha-topic-name">{t.name}</div>
                <div className="ha-topic-desc">{t.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Vitals input bar */}
        <div className="ha-vitals-bar">
          {[
            { key: 'bp',     label: 'BP (mmHg)',    placeholder: '120/80' },
            { key: 'sugar',  label: 'Blood Sugar',  placeholder: '95 mg/dL' },
            { key: 'weight', label: 'Weight (kg)',  placeholder: '70' },
            { key: 'age',    label: 'Age (years)',  placeholder: '35' },
          ].map(f => (
            <div className="ha-vital-item" key={f.key}>
              <div className="ha-vital-label">{f.label}</div>
              <input
                className="ha-vital-input"
                placeholder={f.placeholder}
                value={vitals[f.key]}
                onChange={e => setVitals(v => ({ ...v, [f.key]: e.target.value }))}
                onKeyDown={e => { if (e.key === 'Enter') submitVitals() }}
              />
            </div>
          ))}
          <button className="ha-vital-btn" onClick={submitVitals}>
            Analyze Vitals →
          </button>
        </div>

        {/* Chat */}
        <div className="ha-chat-wrap">
          {/* Top bar */}
          <div className="ha-chat-topbar">
            <div className="ha-chat-topbar-left">
              <div className="ha-chat-avatar">🤖</div>
              <div>
                <div className="ha-chat-name">Dr. Aiden</div>
                <div className="ha-chat-role">AI Health Assistant · Claude-Powered</div>
              </div>
            </div>
            <div className="ha-chat-actions">
              <button className="ha-action-btn" onClick={() => setMessages(msgs => msgs.slice(0, 1))}>
                Clear Chat
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="ha-messages">
            {messages.map((m, i) => (
              <div key={i} className={`ha-msg ${m.role === 'user' ? 'user' : ''}`}>
                <div className={`ha-msg-ava ${m.role === 'user' ? 'user' : 'ai'}`}>
                  {m.role === 'user' ? '👤' : '🤖'}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                  <div className={`ha-bubble ${m.role === 'user' ? 'user' : 'ai'}`}>
                    {m.role === 'assistant' ? renderMarkdown(m.content) : m.content}
                  </div>
                  {m.time && <div className="ha-bubble-meta">{m.time}</div>}
                </div>
              </div>
            ))}

            {loading && (
              <div className="ha-msg">
                <div className="ha-msg-ava ai">🤖</div>
                <div className="ha-bubble ai">
                  <div className="ha-typing">
                    <div className="ha-dot" /><div className="ha-dot" /><div className="ha-dot" />
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick suggestions */}
          <div className="ha-suggestions" style={{ paddingBottom: 12 }}>
            {QUICK.map((q, i) => (
              <button key={i} className="ha-sug-btn" onClick={() => callAI(q)} disabled={loading}>
                {q}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="ha-input-bar">
            <textarea
              ref={textareaRef}
              className="ha-textarea"
              placeholder="Ask Dr. Aiden anything — symptoms, diet, BP readings, medications…"
              value={input}
              onChange={e => { setInput(e.target.value); autoResizeTextarea() }}
              onKeyDown={handleKey}
              rows={1}
            />
            <button
              className="ha-send-btn"
              onClick={() => callAI(input)}
              disabled={loading || !input.trim()}
            >
              ➤
            </button>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="ha-disclaimer">
          ⚕️ Dr. Aiden provides AI-generated health information for educational purposes only.
          Always consult a qualified healthcare professional for medical diagnosis, treatment, and medication decisions.
          In an emergency, call 112 / 911 immediately.
        </div>
      </div>
    </div>
  )
}