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

function CalendarPlusIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="4" width="18" height="17" rx="2" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
      <line x1="12" y1="13" x2="12" y2="19" />
      <line x1="9" y1="16" x2="15" y2="16" />
    </svg>
  )
}

function ThermometerIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14 14.8V5a2 2 0 1 0-4 0v9.8a4 4 0 1 0 4 0z" />
      <line x1="12" y1="11" x2="12" y2="18" />
    </svg>
  )
}

function BrainIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 3a3 3 0 0 0-3 3v1a2 2 0 0 0-2 2v2a2 2 0 0 0 1 1.7V14a3 3 0 0 0 3 3h1" />
      <path d="M15 3a3 3 0 0 1 3 3v1a2 2 0 0 1 2 2v2a2 2 0 0 1-1 1.7V14a3 3 0 0 1-3 3h-1" />
      <path d="M9 6v12" />
      <path d="M15 6v12" />
      <path d="M9 9h6" />
      <path d="M9 15h6" />
    </svg>
  )
}

function HeartIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 21s-7-4.4-9-8.9C1.2 8.1 3.5 5 7 5c2 0 3.5 1.2 5 3 1.5-1.8 3-3 5-3 3.5 0 5.8 3.1 4 7.1-2 4.5-9 8.9-9 8.9z" />
    </svg>
  )
}

function ZapIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polygon points="13 2 3 14 11 14 9 22 21 9 13 9" />
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
  text: "Hello Jane. I'm your AI health assistant. Describe your symptoms and I'll help you understand next steps.",
  timestamp: 'Just now',
  chips: ['I have a headache', 'I have a fever', 'I feel fatigued', 'I have chest pain'],
}

const WELCOME_CARDS = [
  {
    title: 'Fever or Infection',
    desc: 'High temperature, chills, or body aches',
    prompt: 'I have a fever and chills',
    icon: ThermometerIcon,
    tone: 'text-rose-500',
    toneBg: 'bg-rose-50 dark:bg-rose-950/40',
  },
  {
    title: 'Head & Neurological',
    desc: 'Headaches, dizziness, or migraines',
    prompt: 'I have a persistent headache',
    icon: BrainIcon,
    tone: 'text-indigo-500',
    toneBg: 'bg-indigo-50 dark:bg-indigo-950/50',
  },
  {
    title: 'Chest & Breathing',
    desc: 'Chest pain, palpitations, or breathlessness',
    prompt: 'I have chest pain and shortness of breath',
    icon: HeartIcon,
    tone: 'text-rose-400',
    toneBg: 'bg-rose-50 dark:bg-rose-950/40',
  },
  {
    title: 'Fatigue & Energy',
    desc: 'Persistent tiredness or low energy',
    prompt: 'I have been feeling very fatigued',
    icon: ZapIcon,
    tone: 'text-amber-500',
    toneBg: 'bg-amber-50 dark:bg-amber-950/40',
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

export default function SymptomCheckerView({ setCurrentView }) {
  const [messages, setMessages] = useState([INITIAL_MESSAGE])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(true)
  const [copiedId, setCopiedId] = useState(null)
  const [feedbackById, setFeedbackById] = useState({})
  const messagesEndRef = useRef(null)

  const navigateTo = setCurrentView

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const getAIResponse = (input) => {
    const lower = input.toLowerCase()
    if (lower.includes('headache') || lower.includes('head')) {
      return "I understand you have a headache. This is one of the most common symptoms. Can you tell me more - is it throbbing or a constant pressure? And have you had any fever, stiff neck, or sensitivity to light alongside it?"
    }
    if (lower.includes('fever') || lower.includes('temperature')) {
      return "A fever indicates your body is fighting something. What temperature have you measured, and how long have you had it? Have you also experienced chills, body aches, or a sore throat?"
    }
    if (lower.includes('chest') || lower.includes('heart')) {
      return "Chest pain is something we take seriously. Is the pain sharp or dull? Does it radiate to your arm or jaw? Are you experiencing any shortness of breath? I'd recommend seeing a doctor promptly for chest-related symptoms."
    }
    if (lower.includes('fatigue') || lower.includes('tired')) {
      return "Fatigue can have many causes. How long have you been feeling this way? Is it accompanied by any other symptoms like difficulty sleeping, mood changes, or shortness of breath on exertion?"
    }
    return "Thank you for sharing that. Based on what you've described, I'd recommend discussing this with one of our doctors who can properly evaluate your symptoms. Would you like me to help you book an appointment?"
  }

  const getFollowUpChips = (input) => {
    const lower = input.toLowerCase()
    if (lower.includes('headache')) return ['Yes, I have a fever too', 'No fever', "It's throbbing", "It's constant pressure"]
    if (lower.includes('fever')) return ['Above 38°C', 'Below 38°C', 'I have chills too', 'No other symptoms']
    if (lower.includes('chest')) return ["It's sharp pain", 'It radiates to my arm', "I'm short of breath", 'Book appointment now']
    return ['Tell me more', 'Book an appointment', 'What should I do?', 'Is it serious?']
  }

  const sendMessage = (text) => {
    if (!text.trim()) return
    setShowSuggestions(false)

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        role: 'patient',
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
    }, 1500)
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
    const lastPatient = [...messages].reverse().find((m) => m.role === 'patient')
    if (!lastPatient) return

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
        'I can also provide additional guidance if you want a more detailed triage path.',
        'If symptoms persist or worsen, booking an appointment is the safest next step.',
        'I can help summarize this for your doctor before your visit.',
      ]
      const variation = variations[Math.floor(Math.random() * variations.length)]

      setIsTyping(false)
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: 'ai',
          text: `${getAIResponse(lastPatient.text)} ${variation}`,
          timestamp: 'Just now',
          chips: getFollowUpChips(lastPatient.text),
        },
      ])
    }, 1500)
  }

  const aiMessageCount = messages.filter((m) => m.role === 'ai').length

  return (
    <div className="flex flex-col h-full w-full overflow-hidden min-h-0 min-w-0">
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
              <span className="text-sm font-semibold text-slate-900 dark:text-[#eeeef5]">HealthAI Assistant</span>
              <span className="ml-1 inline-flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                <span className="text-xs text-slate-400 dark:text-[#606070]">Online</span>
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
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
            onClick={() => navigateTo('booking-wizard')}
          >
            <span className="inline-flex h-3.5 w-3.5"><CalendarPlusIcon /></span>
            <span>Book Appointment</span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden bg-[#f8fafc] dark:bg-[#08080f] min-h-0 min-w-0 w-full">
        {showSuggestions ? (
          <div className="flex flex-col h-full min-h-0 items-center justify-center px-4">
            <div className="text-center">
              <div className="mx-auto mb-5 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-400 to-violet-600 text-white shadow-[0_8px_32px_rgba(99,102,241,0.35)] dark:shadow-[0_8px_32px_rgba(99,102,241,0.25)]">
                <span className="inline-flex h-8 w-8"><SparklesIcon /></span>
              </div>
              <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-[#eeeef5]">What&apos;s on your mind, Jane?</h2>
              <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-slate-500 dark:text-[#70708a]">
                Describe your symptoms and I&apos;ll help you understand what might be going on.
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
          <div className="mx-auto flex max-w-2xl w-full flex-col gap-4 px-4 py-8 min-w-0">
            {messages.map((message) => {
              if (message.role === 'patient') {
                return (
                  <div key={message.id} className="flex justify-end">
                    <div className="flex flex-col items-end gap-1 min-w-0">
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
                  <div className="flex items-start gap-3 min-w-0">
                    <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-400 to-violet-600 text-white shadow-[0_2px_8px_rgba(99,102,241,0.3)]">
                      <span className="inline-flex h-4 w-4"><SparklesIcon /></span>
                    </span>

                    <div className="flex flex-1 flex-col gap-2 min-w-0">
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
                                  onClick={() => sendMessage(chip)}
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
              <div className="cta-in mx-auto my-2 w-full max-w-sm rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-violet-50/50 px-5 py-4 text-center shadow-sm dark:border-indigo-900/40 dark:from-indigo-950/40 dark:to-violet-950/30 dark:shadow-none">
                <span className="mx-auto mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-950/70 dark:text-indigo-400">
                  <span className="inline-flex h-5 w-5"><CalendarPlusIcon /></span>
                </span>
                <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-[#eeeef5]">Ready to see a doctor?</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-[#70708a]">
                  Book an appointment and share these symptoms directly with a doctor.
                </p>
                <button
                  type="button"
                  className="mt-4 w-full rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition-all duration-150 hover:-translate-y-px hover:bg-indigo-700 hover:shadow-[0_4px_12px_rgba(99,102,241,0.4)] active:scale-95 dark:bg-indigo-600 dark:hover:bg-indigo-500"
                  onClick={() => navigateTo('booking-wizard')}
                >
                  Book Appointment →
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
                    <span className="ml-2 text-xs italic text-slate-400 dark:text-[#606070]">HealthAI is thinking...</span>
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
              placeholder="Describe your symptoms..."
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
            HealthAI can make mistakes. Always consult a qualified doctor for medical decisions.
          </p>
        </div>
      </div>
    </div>
  )
}

SymptomCheckerView.propTypes = {
  setCurrentView: PropTypes.func.isRequired,
}
