import { useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'

function ChevronLeftIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  )
}

function SparklesIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3l1.9 5.6L19.5 10l-5.6 1.4L12 17l-1.9-5.6L4.5 10l5.6-1.4L12 3z" />
      <path d="M18.5 3.5l.8 2.1 2.2.8-2.2.8-.8 2.1-.8-2.1-2.2-.8 2.2-.8.8-2.1z" />
      <path d="M5.5 14.5l.8 2.1 2.2.8-2.2.8-.8 2.1-.8-2.1-2.2-.8 2.2-.8.8-2.1z" />
    </svg>
  )
}

function RotateCcwIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 2v6h6" />
      <path d="M3 8a9 9 0 1 0 3-6.7L3 4" />
    </svg>
  )
}

function FileTextIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  )
}

function FileSearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <circle cx="11" cy="15" r="3" />
      <line x1="16" y1="20" x2="13.8" y2="17.8" />
    </svg>
  )
}

function PillIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M10.5 20.5l-7-7a4.95 4.95 0 0 1 0-7l2-2a4.95 4.95 0 0 1 7 0l7 7a4.95 4.95 0 0 1 0 7l-2 2a4.95 4.95 0 0 1-7 0z" />
      <line x1="8" y1="8" x2="16" y2="16" />
    </svg>
  )
}

function FlaskConicalIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M10 3h4" />
      <path d="M10 3v6l-5.8 9.5a2 2 0 0 0 1.7 3h12.2a2 2 0 0 0 1.7-3L14 9V3" />
      <path d="M8.5 13h7" />
    </svg>
  )
}

function BookOpenIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2 4.5A2.5 2.5 0 0 1 4.5 2H20" />
      <path d="M2 19.5A2.5 2.5 0 0 0 4.5 22H20" />
      <path d="M2 4.5v15" />
      <path d="M20 2v20" />
      <path d="M8 7h7" />
      <path d="M8 11h7" />
    </svg>
  )
}

function ClipboardListIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="6" y="4" width="12" height="18" rx="2" />
      <path d="M9 4.5h6" />
      <path d="M9 9h6" />
      <path d="M9 13h6" />
      <path d="M9 17h4" />
    </svg>
  )
}

function CopyIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

function ThumbsUpIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14 9V5a3 3 0 0 0-3-3l-1 7" />
      <path d="M5 9h12l-1 10H7L5 9z" />
      <path d="M2 9h3v10H2z" />
    </svg>
  )
}

function ThumbsDownIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M10 15v4a3 3 0 0 0 3 3l1-7" />
      <path d="M19 15H7l1-10h9l2 10z" />
      <path d="M22 5h-3v10h3z" />
    </svg>
  )
}

function RefreshCwIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="23 4 23 10 17 10" />
      <polyline points="1 20 1 14 7 14" />
      <path d="M3.5 9a9 9 0 0 1 14.7-3.4L23 10" />
      <path d="M20.5 15a9 9 0 0 1-14.7 3.4L1 14" />
    </svg>
  )
}

function StethoscopeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 3v6a4 4 0 0 0 8 0V3" />
      <path d="M8 15v1a6 6 0 0 0 12 0v-2" />
      <circle cx="19" cy="12" r="2" />
    </svg>
  )
}

function ArrowUpIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="12" y1="19" x2="12" y2="5" />
      <polyline points="5 12 12 5 19 12" />
    </svg>
  )
}

const INITIAL_MESSAGE = {
  id: 1,
  role: 'ai',
  text: 'Clinical assistant online. Ask for summaries, interactions, lab interpretation, ICD-10 support, or guideline references.',
  timestamp: 'Just now',
  chips: ['Summarize Jane Doe history', 'Check drug interactions', 'Interpret CBC results', 'Find ICD-10 codes'],
}

const WELCOME_CARDS = [
  {
    title: 'Review Patient Record',
    desc: 'Summarize history for Jane Doe',
    prompt: 'Summarize Jane Doe\'s medical history and flag any concerns',
    icon: FileSearchIcon,
    tone: 'text-indigo-500',
    toneBg: 'bg-indigo-50 dark:bg-indigo-950/50',
  },
  {
    title: 'Drug Interaction Check',
    desc: 'Check medications for interactions',
    prompt: 'Check for drug interactions in Jane Doe\'s current medications: Metformin, Lisinopril, Vitamin D3',
    icon: PillIcon,
    tone: 'text-amber-500',
    toneBg: 'bg-amber-50 dark:bg-amber-950/40',
  },
  {
    title: 'Interpret Lab Results',
    desc: 'Explain recent blood panel values',
    prompt: 'Interpret Jane Doe\'s recent CBC results: Hemoglobin 11.2, WBC 6.8, Platelets 245',
    icon: FlaskConicalIcon,
    tone: 'text-teal-500',
    toneBg: 'bg-teal-50 dark:bg-teal-950/40',
  },
  {
    title: 'ICD-10 Code Lookup',
    desc: 'Find diagnosis codes by symptom',
    prompt: 'What ICD-10 codes apply for a patient with persistent headache and low-grade fever?',
    icon: BookOpenIcon,
    tone: 'text-violet-500',
    toneBg: 'bg-violet-50 dark:bg-violet-950/40',
  },
]

function Tooltip({ label, children }) {
  return (
    <div className="group relative inline-flex">
      {children}
      <div className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 translate-y-1 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1.5 text-[11px] font-medium text-white opacity-0 shadow-lg transition-all duration-150 group-hover:translate-y-0 group-hover:opacity-100 dark:bg-[#eeeef5] dark:text-[#0c0c13]">
        {label}
      </div>
    </div>
  )
}

Tooltip.propTypes = {
  label: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
}

export default function DoctorChatView({ navigateTo, selectedPatient, user }) {
  const [messages, setMessages] = useState([INITIAL_MESSAGE])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(true)
  const [copiedId, setCopiedId] = useState(null)
  const [feedbackById, setFeedbackById] = useState({})
  const messagesEndRef = useRef(null)

  const activePatientName = selectedPatient?.name || 'Jane Doe'
  const clinicianName = user?.name || 'Doctor'

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const getAIResponse = (input) => {
    const lower = input.toLowerCase()

    if (lower.includes('summarize') || lower.includes('history')) {
      return `Based on ${activePatientName}'s records, key points to note: She is a 36-year-old female with a history of iron deficiency (2024) and recurring migraines (neurology referral, Nov 2024). Critical allergy flags: Penicillin (anaphylaxis) and Seafood (hives). Current medications include Metformin and Lisinopril — ensure BP and glucose monitoring at today's visit.`
    }

    if (lower.includes('drug') || lower.includes('interaction')) {
      return 'Reviewing Metformin + Lisinopril + Vitamin D3: No clinically significant interactions found between these three agents. Note: Lisinopril may cause hyperkalemia — monitor potassium if adding any new medications. Vitamin D3 has no interactions in this context. No contraindications with today\'s suspected viral URI diagnosis.'
    }

    if (lower.includes('lab') || lower.includes('cbc') || lower.includes('interpret')) {
      return 'Interpreting the CBC: Hemoglobin at 11.2 g/dL is mildly below normal range (12.0-16.0 g/dL), consistent with mild anemia — likely iron deficiency given history. WBC 6.8 K/uL is within normal range, suggesting no acute bacterial infection. Platelets 245 K/uL normal. Clinical impression: mild iron deficiency anemia, no signs of infection on CBC alone. Recommend CRP to further rule out inflammation.'
    }

    if (lower.includes('icd') || lower.includes('code')) {
      return 'Recommended ICD-10 codes for headache with low-grade fever: R51.9 Headache, unspecified; R50.9 Fever, unspecified; J06.9 Acute upper respiratory infection (if URI suspected). If migraine is confirmed: G43.909 Migraine, unspecified. Would you like me to add these to the current clinical note?'
    }

    return `I can help with patient summaries, drug interaction checks, lab result interpretation, ICD-10 lookups, and clinical guideline references. ${clinicianName}, what would you like to look into?`
  }

  const getFollowUpChips = (input) => {
    const lower = input.toLowerCase()
    if (lower.includes('summarize') || lower.includes('history')) return ['Flag high-risk issues', 'Generate visit summary', 'Extract allergy risks', 'Open EMR notes']
    if (lower.includes('drug') || lower.includes('interaction')) return ['Check with antibiotics', 'Check renal dosing', 'Add safety note', 'Open EMR notes']
    if (lower.includes('lab') || lower.includes('cbc') || lower.includes('interpret')) return ['Order CRP now', 'Assess anemia severity', 'Draft lab interpretation', 'Open EMR notes']
    if (lower.includes('icd') || lower.includes('code')) return ['Use R51.9 + R50.9', 'Add J06.9 context', 'Add to note', 'Open EMR notes']
    return ['Summarize chart', 'Check interactions', 'Interpret labs', 'Find ICD codes']
  }

  const sendMessage = (text) => {
    if (!text.trim()) return
    setShowSuggestions(false)

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        role: 'doctor',
        text,
        timestamp: 'Just now',
      },
    ])

    setInputValue('')
    setIsTyping(true)

    window.setTimeout(() => {
      setIsTyping(false)
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: 'ai',
          text: getAIResponse(text),
          timestamp: 'Just now',
          chips: getFollowUpChips(text),
        },
      ])
    }, 1300)
  }

  const copyMessage = (id, text) => {
    navigator.clipboard.writeText(text).catch(() => {})
    setCopiedId(id)
    window.setTimeout(() => setCopiedId(null), 2000)
  }

  const clearConversation = () => {
    setMessages([INITIAL_MESSAGE])
    setShowSuggestions(true)
    setIsTyping(false)
    setInputValue('')
    setFeedbackById({})
  }

  const toggleFeedback = (id, type) => {
    setFeedbackById((prev) => ({
      ...prev,
      [id]: prev[id] === type ? null : type,
    }))
  }

  const regenerateResponse = () => {
    const lastDoctor = [...messages].reverse().find((m) => m.role === 'doctor')
    if (!lastDoctor) return

    setMessages((prev) => {
      let aiIndex = -1
      for (let i = prev.length - 1; i >= 0; i -= 1) {
        if (prev[i].role === 'ai') {
          aiIndex = i
          break
        }
      }
      if (aiIndex < 0) return prev
      return prev.filter((_, idx) => idx !== aiIndex)
    })

    setIsTyping(true)
    window.setTimeout(() => {
      const variations = [
        'Would you like a concise version for chart documentation?',
        'I can also reframe this in SOAP format for your note.',
        'I can map this directly to suggested ICD-10 codes if needed.',
      ]
      const variation = variations[Math.floor(Math.random() * variations.length)]

      setIsTyping(false)
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: 'ai',
          text: `${getAIResponse(lastDoctor.text)} ${variation}`,
          timestamp: 'Just now',
          chips: getFollowUpChips(lastDoctor.text),
        },
      ])
    }, 1300)
  }

  const aiMessageCount = messages.filter((m) => m.role === 'ai').length

  return (
    <div className="flex h-full min-h-0 w-full min-w-0 flex-col overflow-hidden">
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-slate-200 bg-white/80 px-6 backdrop-blur-xl dark:border-[#252530] dark:bg-[#0c0c13]/80">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-150 hover:bg-slate-100 dark:hover:bg-[#16161e]"
            onClick={() => navigateTo('dashboard')}
            aria-label="Back to dashboard"
          >
            <span className="inline-flex h-4 w-4 text-slate-500 dark:text-[#70708a]"><ChevronLeftIcon /></span>
          </button>

          <span className="h-4 w-px bg-slate-200 dark:bg-[#252530]" aria-hidden="true" />

          <div className="flex items-center gap-2.5">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 to-violet-600 text-white shadow-[0_2px_8px_rgba(99,102,241,0.4)]">
              <span className="inline-flex h-3.5 w-3.5"><SparklesIcon /></span>
            </span>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-semibold text-slate-900 dark:text-[#eeeef5]">HealthAI Clinical Assistant</span>
              <span className="ml-2 rounded-md border border-teal-200 bg-teal-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-teal-600 dark:border-teal-800/50 dark:bg-teal-950/60 dark:text-teal-400">Clinical Mode</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {selectedPatient && (
            <button
              type="button"
              onClick={() => navigateTo('emr')}
              className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-600 transition-colors hover:border-indigo-400 hover:bg-indigo-100 dark:border-indigo-800/50 dark:bg-indigo-950/50 dark:text-indigo-400 dark:hover:border-indigo-600 dark:hover:bg-indigo-950/70"
            >
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-indigo-500 dark:bg-indigo-400" />
              <span>{activePatientName}</span>
            </button>
          )}

          <Tooltip label="Clear conversation">
            <button
              type="button"
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-150 hover:bg-slate-100 dark:hover:bg-[#16161e]"
              onClick={clearConversation}
              aria-label="Clear chat"
            >
              <span className="inline-flex h-4 w-4 text-slate-400 dark:text-[#606070]"><RotateCcwIcon /></span>
            </button>
          </Tooltip>

          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition-all duration-150 hover:border-indigo-300 hover:bg-slate-50 hover:text-indigo-600 dark:border-[#252530] dark:text-[#9898b0] dark:hover:border-indigo-700 dark:hover:bg-[#16161e] dark:hover:text-indigo-400"
            onClick={() => navigateTo('emr')}
          >
            <span className="inline-flex h-3.5 w-3.5"><FileTextIcon /></span>
            <span>Open EMR</span>
          </button>
        </div>
      </div>

      <div className="min-h-0 w-full min-w-0 flex-1 overflow-x-hidden overflow-y-auto bg-[#f8fafc] dark:bg-[#08080f]">
        {showSuggestions ? (
          <div className="flex h-full min-h-0 flex-col items-center justify-center px-4">
            <div className="text-center">
              <div className="mx-auto mb-5 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-400 to-violet-600 text-white shadow-[0_8px_32px_rgba(99,102,241,0.35)] dark:shadow-[0_8px_32px_rgba(99,102,241,0.25)]">
                <span className="inline-flex h-8 w-8"><SparklesIcon /></span>
              </div>
              <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-[#eeeef5]">Clinical AI Assistant</h2>
              <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-slate-500 dark:text-[#70708a]">
                Ask about patients, medications, diagnoses, or clinical guidelines.
              </p>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              {WELCOME_CARDS.map((card) => {
                const Icon = card.icon
                return (
                  <button
                    key={card.title}
                    type="button"
                    className="card-hover rounded-2xl border border-slate-200 bg-white p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-300 hover:bg-indigo-50/50 dark:border-[#252530] dark:bg-[#111118] dark:hover:border-indigo-700 dark:hover:bg-indigo-950/30"
                    onClick={() => sendMessage(card.prompt)}
                  >
                    <span className={`mb-3 inline-flex h-9 w-9 items-center justify-center rounded-xl ${card.toneBg}`}>
                      <span className={`inline-flex h-[18px] w-[18px] ${card.tone}`}><Icon /></span>
                    </span>
                    <p className="text-sm font-semibold text-slate-900 dark:text-[#eeeef5]">{card.title}</p>
                    <p className="mt-0.5 text-xs leading-relaxed text-slate-500 dark:text-[#70708a]">{card.desc}</p>
                  </button>
                )
              })}
            </div>
          </div>
        ) : (
          <div className="mx-auto flex w-full min-w-0 max-w-2xl flex-col gap-4 px-4 py-8">
            {messages.map((message) => {
              if (message.role === 'doctor') {
                return (
                  <div key={message.id} className="flex justify-end">
                    <div className="flex min-w-0 flex-col items-end gap-1">
                      <div className="message-in max-w-[75%] rounded-[20px] rounded-tr-[6px] bg-gradient-to-br from-indigo-500 to-indigo-600 px-5 py-3.5 text-sm leading-relaxed text-white shadow-[0_4px_16px_rgba(99,102,241,0.3)] dark:from-indigo-600 dark:to-indigo-700 dark:shadow-[0_4px_20px_rgba(99,102,241,0.2)]">
                        {message.text}
                      </div>
                      <span className="mt-1 pr-1 text-[11px] text-slate-400 dark:text-[#505060]">{message.timestamp}</span>
                    </div>
                  </div>
                )
              }

              return (
                <div key={message.id} className="flex justify-start">
                  <div className="flex min-w-0 items-start gap-3">
                    <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-400 to-violet-600 text-white shadow-[0_2px_8px_rgba(99,102,241,0.3)]">
                      <span className="inline-flex h-4 w-4"><SparklesIcon /></span>
                    </span>

                    <div className="flex min-w-0 flex-1 flex-col gap-2">
                      <div className="message-in max-w-[85%] rounded-[20px] rounded-tl-[6px] border border-slate-200 bg-white px-5 py-4 shadow-sm dark:border-[#252530] dark:bg-[#111118] dark:shadow-none">
                        <div className="flex flex-col gap-3">
                          <p className="text-sm leading-relaxed text-slate-600 dark:text-[#c8c8e0]">{message.text}</p>

                          {Array.isArray(message.chips) && message.chips.length > 0 && (
                            <div className="mt-1 flex flex-wrap gap-2 border-t border-slate-100 pt-1 dark:border-[#1c1c25]">
                              {message.chips.map((chip) => (
                                <button
                                  key={`${message.id}-${chip}`}
                                  type="button"
                                  className="cursor-pointer rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-medium text-slate-600 transition-all duration-150 hover:-translate-y-px hover:border-indigo-300 hover:bg-indigo-50/60 hover:text-indigo-600 dark:border-[#252530] dark:bg-[#1c1c25] dark:text-[#9898b0] dark:hover:border-indigo-700 dark:hover:bg-indigo-950/40 dark:hover:text-indigo-400"
                                  onClick={() => {
                                    if (chip.toLowerCase().includes('open emr')) {
                                      navigateTo('emr')
                                      return
                                    }
                                    sendMessage(chip)
                                  }}
                                >
                                  {chip}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 pl-1">
                        <Tooltip label="Copy">
                          <button
                            type="button"
                            className="group inline-flex h-7 w-7 items-center justify-center rounded-lg transition-all duration-150 hover:bg-slate-100 dark:hover:bg-[#1c1c25]"
                            onClick={() => copyMessage(message.id, message.text)}
                          >
                            {copiedId === message.id ? (
                              <span className="inline-flex h-3.5 w-3.5 text-emerald-500"><CheckIcon /></span>
                            ) : (
                              <span className="inline-flex h-3.5 w-3.5 text-slate-300 transition-colors group-hover:text-slate-500 dark:text-[#404050]"><CopyIcon /></span>
                            )}
                          </button>
                        </Tooltip>

                        <Tooltip label="Helpful">
                          <button
                            type="button"
                            className="group inline-flex h-7 w-7 items-center justify-center rounded-lg transition-all duration-150 hover:bg-slate-100 dark:hover:bg-[#1c1c25]"
                            onClick={() => toggleFeedback(message.id, 'up')}
                          >
                            <span className={`inline-flex h-3.5 w-3.5 ${feedbackById[message.id] === 'up' ? 'text-indigo-500' : 'text-slate-300 group-hover:text-slate-500 dark:text-[#404050]'}`}><ThumbsUpIcon /></span>
                          </button>
                        </Tooltip>

                        <Tooltip label="Not helpful">
                          <button
                            type="button"
                            className="group inline-flex h-7 w-7 items-center justify-center rounded-lg transition-all duration-150 hover:bg-slate-100 dark:hover:bg-[#1c1c25]"
                            onClick={() => toggleFeedback(message.id, 'down')}
                          >
                            <span className={`inline-flex h-3.5 w-3.5 ${feedbackById[message.id] === 'down' ? 'text-indigo-500' : 'text-slate-300 group-hover:text-slate-500 dark:text-[#404050]'}`}><ThumbsDownIcon /></span>
                          </button>
                        </Tooltip>

                        <Tooltip label="Regenerate">
                          <button
                            type="button"
                            className="group inline-flex h-7 w-7 items-center justify-center rounded-lg transition-all duration-150 hover:bg-slate-100 dark:hover:bg-[#1c1c25]"
                            onClick={regenerateResponse}
                          >
                            <span className="inline-flex h-3.5 w-3.5 text-slate-300 transition-colors group-hover:text-slate-500 dark:text-[#404050]"><RefreshCwIcon /></span>
                          </button>
                        </Tooltip>

                        <span className="ml-auto text-[11px] text-slate-400 dark:text-[#505060]">{message.timestamp}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}

            {aiMessageCount >= 3 && (
              <div className="cta-in mx-auto my-2 w-full max-w-sm rounded-2xl border border-teal-100 bg-gradient-to-br from-teal-50 to-indigo-50/50 px-5 py-4 text-center shadow-sm dark:border-teal-900/40 dark:from-teal-950/40 dark:to-indigo-950/30 dark:shadow-none">
                <span className="mx-auto mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-teal-100 text-teal-600 dark:bg-teal-950/70 dark:text-teal-400">
                  <span className="inline-flex h-5 w-5"><ClipboardListIcon /></span>
                </span>
                <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-[#eeeef5]">Add to Clinical Notes?</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-[#70708a]">
                  You can copy this response directly into {activePatientName}&apos;s EMR notes.
                </p>
                <button
                  type="button"
                  className="mt-4 w-full rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white transition-all duration-150 hover:-translate-y-px hover:bg-teal-700 active:scale-95 dark:bg-teal-600 dark:hover:bg-teal-500"
                  onClick={() => navigateTo('emr')}
                >
                  Open EMR Notes
                </button>
              </div>
            )}

            {isTyping && (
              <div className="flex items-start gap-3">
                <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-400 to-violet-600 text-white shadow-[0_2px_8px_rgba(99,102,241,0.3)]">
                  <span className="inline-flex h-4 w-4"><SparklesIcon /></span>
                </span>

                <div className="message-in rounded-[20px] rounded-tl-[6px] border border-slate-200 bg-white px-5 py-4 shadow-sm dark:border-[#252530] dark:bg-[#111118] dark:shadow-none">
                  <div className="flex items-center gap-1.5">
                    <span className="typing-dot h-2 w-2 rounded-full bg-slate-300 dark:bg-[#404050]" style={{ animationDelay: '0ms' }} />
                    <span className="typing-dot h-2 w-2 rounded-full bg-slate-300 dark:bg-[#404050]" style={{ animationDelay: '150ms' }} />
                    <span className="typing-dot h-2 w-2 rounded-full bg-slate-300 dark:bg-[#404050]" style={{ animationDelay: '300ms' }} />
                    <span className="ml-2 text-xs italic text-slate-400 dark:text-[#606070]">Clinical assistant is thinking...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <div className="shrink-0 bg-[#f8fafc] px-6 pb-6 pt-3 dark:bg-[#08080f]">
        <div className="mx-auto w-full max-w-2xl">
          <div className="flex items-end gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-[0_4px_24px_rgba(0,0,0,0.06)] transition-all duration-200 focus-within:border-indigo-300 focus-within:shadow-[0_4px_24px_rgba(99,102,241,0.12)] dark:border-[#252530] dark:bg-[#111118] dark:shadow-[0_4px_24px_rgba(0,0,0,0.4)] dark:focus-within:border-indigo-700 dark:focus-within:shadow-[0_4px_24px_rgba(99,102,241,0.15)]">
            <span className="mb-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center self-end rounded-xl bg-indigo-50 text-indigo-500 dark:bg-indigo-950/60 dark:text-indigo-400">
              <span className="inline-flex h-4 w-4"><StethoscopeIcon /></span>
            </span>

            <textarea
              rows={1}
              style={{ resize: 'none' }}
              className="max-h-32 flex-1 overflow-y-auto bg-transparent py-1 text-sm leading-relaxed text-slate-900 outline-none placeholder:text-slate-400 dark:text-[#eeeef5] dark:placeholder:text-[#505060]"
              placeholder="Ask about patient, medications, ICD codes, clinical guidelines..."
              value={inputValue}
              maxLength={500}
              onChange={(e) => setInputValue(e.target.value)}
              onInput={(e) => {
                e.target.style.height = 'auto'
                e.target.style.height = `${e.target.scrollHeight}px`
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  sendMessage(inputValue)
                }
              }}
            />

            <div className="flex shrink-0 items-center gap-2 self-end">
              <span className={`text-[11px] text-slate-300 transition-opacity dark:text-[#404050] ${inputValue.length > 0 ? 'opacity-100' : 'opacity-0'}`}>
                {inputValue.length}/500
              </span>

              <button
                type="button"
                className={`inline-flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-150 ${inputValue.trim() === '' || isTyping
                  ? 'cursor-not-allowed bg-slate-100 text-slate-300 dark:bg-[#1c1c25] dark:text-[#404050]'
                  : 'bg-indigo-600 text-white hover:-translate-y-px hover:bg-indigo-700 hover:shadow-[0_4px_12px_rgba(99,102,241,0.4)] active:scale-95 dark:bg-indigo-600 dark:hover:bg-indigo-500'}`}
                onClick={() => sendMessage(inputValue)}
                disabled={inputValue.trim() === '' || isTyping}
                aria-label="Send message"
              >
                <span className="inline-flex h-4 w-4"><ArrowUpIcon /></span>
              </button>
            </div>
          </div>

          <p className="mt-2.5 text-center text-[11px] text-slate-400 dark:text-[#505060]">
            AI-generated clinical suggestions must be verified against current guidelines and clinical judgment.
          </p>
        </div>
      </div>
    </div>
  )
}

DoctorChatView.propTypes = {
  navigateTo: PropTypes.func.isRequired,
  selectedPatient: PropTypes.shape({
    name: PropTypes.string,
  }),
  user: PropTypes.shape({
    name: PropTypes.string,
    initials: PropTypes.string,
    specialty: PropTypes.string,
  }),
}

DoctorChatView.defaultProps = {
  selectedPatient: null,
  user: null,
}
