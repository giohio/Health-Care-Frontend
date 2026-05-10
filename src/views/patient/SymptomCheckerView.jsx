import { useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import { SYMPTOM_SPECIALTY_SUGGESTIONS } from '../../data/aiAnalysis'
import { symptomCheck, streamSSE, transcribeSpeech, getTriageSession, getTriageSessions } from '../../api/ai'
import AiMessageContent from '../../components/shared/AiMessageContent'
import {
  ChevronLeftIcon, SparklesIcon, RotateCcwIcon, CalendarPlusIcon,
  ThermometerIcon, BrainIcon, HeartIcon, ZapIcon, CopyIcon, CheckIcon,
  ThumbsUpIcon, ThumbsDownIcon, RefreshCwIcon, MicIcon, MicOffIcon,
  StethoscopeIcon, ArrowUpIcon,
} from './SymptomCheckerIcons'

const getInitialMessage = (name) => ({
  id: 1,
  role: 'ai',
  text: `Hello ${name}. I'm your AI health assistant. Describe your symptoms and I'll help you understand next steps.`,
  timestamp: 'Just now',
  chips: ['I have a headache', 'I have a fever', 'I feel fatigued', 'I have chest pain'],
})

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

function getSeverityColorKey(n) {
  if (n >= 7) return 'rose'
  if (n >= 4) return 'amber'
  return 'emerald'
}

function getSeverityLabel(level) {
  if (level >= 7) return 'Severe'
  if (level >= 4) return 'Moderate'
  return 'Mild'
}

function getSeverityLabelCls(level) {
  if (level >= 7) return 'text-rose-500'
  if (level >= 4) return 'text-amber-500'
  return 'text-emerald-600 dark:text-emerald-400'
}

const SEVERITY_SELECTED_CLS = {
  rose: 'bg-rose-500 text-white',
  amber: 'bg-amber-500 text-white',
  emerald: 'bg-emerald-500 text-white',
}

const SEVERITY_FILLED_CLS = {
  rose: 'bg-rose-100 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400',
  amber: 'bg-amber-100 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400',
  emerald: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400',
}

// Slot-listing signatures that the AI service uses when presenting booking options
const _SLOT_LISTING_SIGS = [
  'I found',
  'opening with',
  'options for',
  'no available slots',
  'Shall I confirm',
  'would that work',
]

// Signatures for when the AI is asking for explicit confirmation of a pre-selected slot
// (i.e. patient already picked a doctor, AI is asking "shall I confirm?")
const _CONFIRM_REQUEST_SIGS = [
  'Shall I confirm', 'confirm this booking', 'confirm the booking',
]

/**
 * If `text` is a slot-listing AI reply, extract the numbered option lines as
 * quick-reply chip labels, e.g. ["(1) Dr. Huy — 09:00", "(2) Dr. Lan — 10:00"].
 * If it's a single-slot confirmation request (no numbered options), return
 * Yes/No confirmation chips so the patient can tap instead of typing.
 * Returns an empty array otherwise.
 */
function _parseSlotChips(text) {
  if (!text) return []
  if (!_SLOT_LISTING_SIGS.some((sig) => text.includes(sig))) return []

  const chips = []
  // Match lines like "(1) Dr. Name — 09:00  ← recommended"
  const lineRe = /^\s*\((\d)\)\s+(.+)/gm
  let m
  while ((m = lineRe.exec(text)) !== null) {
    // Keep the number prefix so the AI can parse the confirmation correctly
    const label = `(${m[1]}) ${m[2].replace(/\s*←.*$/, '').trim()}`
    chips.push(label)
  }

  // If no numbered options but the AI is asking for explicit confirmation of a
  // pre-selected slot ("Shall I confirm this booking?"), show Yes/No chips.
  if (chips.length === 0 && _CONFIRM_REQUEST_SIGS.some((sig) => text.includes(sig))) {
    return ['Yes, confirm', 'Change time']
  }

  return chips
}

const SEVERITY_CHIP_CLS = {
  rose: 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400',
  amber: 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400',
  emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400',
}

const SYMPTOM_TAGS = [
  'Headache', 'Fever', 'Nausea', 'Fatigue', 'Cough',
  'Chest Pain', 'Dizziness', 'Breathlessness', 'Sore Throat',
  'Back Pain', 'Stomach Pain', 'Vomiting',
]

const THINKING_PHRASES_EN = [
  'Analyzing symptoms…',
  'Checking medical context…',
  'Thinking…',
  'Reviewing clinical data…',
  'Preparing response…',
]


const DURATION_OPTIONS = [
  { label: 'Today', value: 'today' },
  { label: '2–3 days', value: '2–3 days' },
  { label: '~1 week', value: 'about 1 week' },
  { label: '2+ weeks', value: 'more than 2 weeks' },
  { label: '1+ month', value: 'over a month' },
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

export default function SymptomCheckerView({ setCurrentView, currentUser, initialTriageId }) {
  const patientFirstName = currentUser?.full_name?.split(' ')[0] || currentUser?.name?.split(' ')[0] || 'there'

  // sessionStorage key per user — so different patients on the same device don't share state
  const storageKey = currentUser?.id ? `symptom_chat_${currentUser.id}` : null

  const [messages, setMessages] = useState(() => {
    // Don't restore from storage if we're opening a specific triage session
    if (initialTriageId || !storageKey) return [getInitialMessage(patientFirstName)]
    try {
      const saved = sessionStorage.getItem(storageKey)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed.messages) && parsed.messages.length > 0) return parsed.messages
      }
    } catch { /* ignore */ }
    return [getInitialMessage(patientFirstName)]
  })
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [thinkingIdx, setThinkingIdx] = useState(0)
  const [showSuggestions, setShowSuggestions] = useState(!initialTriageId)
  const [copiedId, setCopiedId] = useState(null)
  const [feedbackById, setFeedbackById] = useState({})
  const [severityLevel, setSeverityLevel] = useState(0)
  const [selectedDuration, setSelectedDuration] = useState('')
  const [selectedSymptomTags, setSelectedSymptomTags] = useState([])
  const [hasRecommendation, setHasRecommendation] = useState(false)
  const [aiSpecialties, setAiSpecialties] = useState([])
  const [createdAppointment, setCreatedAppointment] = useState(null)
  const [isRecording, setIsRecording] = useState(false)
  const [transcribing, setTranscribing] = useState(false)
  // Cycle thinking phrase while AI is processing
  useEffect(() => {
    if (!isTyping) { setThinkingIdx(0); return }
    const id = setInterval(() => setThinkingIdx((i) => (i + 1) % THINKING_PHRASES_EN.length), 2000)
    return () => clearInterval(id)
  }, [isTyping])

  // Persist messages + sessionId to sessionStorage whenever messages change
  useEffect(() => {
    if (!storageKey || initialTriageId) return
    try {
      // Only persist if there's actual conversation (more than the welcome message)
      if (messages.length <= 1 && !sessionIdRef.current) return
      sessionStorage.setItem(storageKey, JSON.stringify({
        messages,
        sessionId: sessionIdRef.current,
        nextMessageId: nextMessageIdRef.current,
      }))
    } catch { /* ignore quota errors */ }
  }, [messages, storageKey, initialTriageId])

  const messagesEndRef = useRef(null)
  const abortRef = useRef(null)
  const isSendingRef = useRef(false)   // guard against double-send
  const nextMessageIdRef = useRef(2)
  const sessionIdRef = useRef(null)

  // Restore sessionId and nextMessageId from sessionStorage on first mount
  useEffect(() => {
    if (!storageKey || initialTriageId) return
    try {
      const saved = sessionStorage.getItem(storageKey)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.sessionId) sessionIdRef.current = String(parsed.sessionId).trim()
        if (parsed.nextMessageId) nextMessageIdRef.current = parsed.nextMessageId
      }
    } catch { /* ignore */ }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const mediaRecorderRef = useRef(null)
  const mediaChunksRef = useRef([])
  const [initialSession, setInitialSession] = useState(null)
  // Current triage session context (for booking flow)
  const [currentTriageSession, setCurrentTriageSession] = useState(null)
  const [showEnhancer, setShowEnhancer] = useState(true)

  const navigateTo = setCurrentView

  const nextMessageId = () => {
    const id = nextMessageIdRef.current
    nextMessageIdRef.current += 1
    return id
  }

  const appendAssistantMessage = (text) => {
    setMessages((prev) => [
      ...prev,
      {
        id: nextMessageId(),
        role: 'ai',
        text,
        timestamp: 'Just now',
        chips: [],
      },
    ])
  }

  const hydrateFromSession = (session, { appendSummaryPrompt = false } = {}) => {
    if (!session) return
    setInitialSession(session)
    sessionIdRef.current = session.id
    setCurrentTriageSession({
      id: session.id,
      suggested_department: session.suggested_department,
      urgency_level: session.urgency_level,
      status: session.status,
    })

    setHasRecommendation(Boolean(session.suggested_department))
    if (session.suggested_department) setAiSpecialties([session.suggested_department])

    const msgs = []
    ;(session.messages ?? []).forEach((msg) => {
      if (msg.role === 'user') {
        msgs.push({ id: nextMessageId(), role: 'patient', text: msg.content, timestamp: 'Earlier', chips: [], displayText: msg.content })
      } else {
        const aiText = msg.content ?? 'Analysis complete'
        msgs.push({ id: nextMessageId(), role: 'ai', text: aiText, timestamp: 'AI', chips: _parseSlotChips(aiText) })
      }
    })

    if (appendSummaryPrompt) {
      msgs.push({
        id: nextMessageId(),
        role: 'ai',
        text: 'Here is your previous symptom check summary. Would you like to book an appointment?',
        timestamp: 'AI',
        chips: [session.suggested_department ?? 'Book Appointment'],
      })
    }

    setMessages(msgs.length > 0 ? msgs : [getInitialMessage(patientFirstName)])
    setShowSuggestions(msgs.length === 0)
  }

  const loadLatestServerSession = async ({ skipIfCleared = true } = {}) => {
    if (!storageKey || initialTriageId) return false
    if (skipIfCleared) {
      try {
        const saved = sessionStorage.getItem(storageKey)
        if (saved && JSON.parse(saved)?.cleared) return false
      } catch { /* ignore malformed storage */ }
    }

    const res = await getTriageSessions()
    const sessions = res?.sessions ?? res?.data?.sessions ?? (Array.isArray(res) ? res : [])
    const latest = sessions.find((session) => Array.isArray(session.messages) && session.messages.length > 0)
    if (!latest?.id) return false
    hydrateFromSession(latest)
    return true
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  // Cleanup SSE stream on unmount
  useEffect(() => () => { abortRef.current?.abort() }, [])

  // Load initial triage session if passed in (from appointments view)
  useEffect(() => {
    if (!initialTriageId) return
    getTriageSession(initialTriageId)
      .then((res) => {
        const session = res?.data ?? res
        if (!session) return
        hydrateFromSession(session, { appendSummaryPrompt: true })
        if (session.urgency_level) {
          const level = session.urgency_level
          if (level === 'urgent' || level === 'high') setSeverityLevel(8)
          else if (level === 'medium') setSeverityLevel(5)
          else setSeverityLevel(2)
        }
      })
      .catch(() => {})
  }, [initialTriageId])

  // Restore latest conversation from server when reopening symptom chat
  useEffect(() => {
    if (initialTriageId) return
    const sid = (sessionIdRef.current || '').trim()

    let canceled = false
    const restore = async () => {
      if (!sid) {
        await loadLatestServerSession()
        return
      }

      try {
        const res = await getTriageSession(sid)
        if (canceled) return
        const session = res?.data ?? res
        if (!session?.id) {
          await loadLatestServerSession()
          return
        }
        hydrateFromSession(session)
      } catch {
        if (!canceled) await loadLatestServerSession({ skipIfCleared: false })
      }
    }

    restore().catch(() => {})

    return () => { canceled = true }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialTriageId, storageKey])

  const updateAiMessage = (id, text) => {
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, text } : m)))
  }

  const finalizeAiMessage = (id, text) => {
    const chips = _parseSlotChips(text)
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, text, chips } : m)))
  }

  const appendAiMessage = (id) => {
    setMessages((prev) => [
      ...prev,
      { id, role: 'ai', text: '', timestamp: 'Just now', chips: [] },
    ])
  }

  const sendMessage = async (text, metadata = {}) => {
    const normalizedText = text.trim()
    if (!normalizedText || isTyping) return
    if (isSendingRef.current) return

    isSendingRef.current = true

    if (!currentUser?.id) {
      isSendingRef.current = false
      appendAssistantMessage('I could not identify your patient profile. Please sign in again and try once more.')
      return
    }

    setShowSuggestions(false)
    setShowEnhancer(false)

    const patientMsg = {
      id: nextMessageId(),
      role: 'patient',
      text: normalizedText,
      displayText: 'displayText' in metadata ? metadata.displayText : normalizedText,
      tags: metadata.tags ?? [],
      duration: metadata.duration ?? null,
      severity: metadata.severity ?? null,
      timestamp: 'Just now',
    }

    setMessages((prev) => [...prev, patientMsg])
    setInputValue('')
    setIsTyping(true)

    const aiMsgId = nextMessageId()
    let streamedText = ''

    // Abort any previous stream
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    try {
      const response = await symptomCheck(
        {
          patientId: currentUser.id,
          symptoms: normalizedText,
          duration: metadata.duration ?? undefined,
          severity: metadata.severity ?? undefined,
          sessionId: sessionIdRef.current,
        },
        controller.signal,
      )

      let aiBubbleReady = false

      streamSSE(response, {
        onEvent: (name, data) => {
          if (name === 'session_id') {
            const cleanSessionId = data.trim()
            sessionIdRef.current = cleanSessionId
            setCurrentTriageSession((prev) => ({ ...prev, id: cleanSessionId }))
          } else if (name === 'turn_type' && data === 'recommendation') {
            setHasRecommendation(true)
            setCurrentTriageSession((prev) => ({ ...prev, status: 'ai_suggested' }))
          } else if (name === 'specialties') {
            try {
              const parsed = JSON.parse(data)
              if (Array.isArray(parsed) && parsed.length > 0) setAiSpecialties(parsed)
              if (parsed.length > 0) {
                setCurrentTriageSession((prev) => ({ ...prev, suggested_department: parsed[0] }))
              }
            } catch { /* malformed JSON, ignore */ }
          } else if (name === 'appointment_created') {
            try {
              const appt = JSON.parse(data)
              setCreatedAppointment(appt)
              setHasRecommendation(false)
            } catch { /* malformed JSON, ignore */ }
          }
        },
        onChunk: (chunk) => {
          if (!aiBubbleReady) {
            appendAiMessage(aiMsgId)
            setIsTyping(false)
            aiBubbleReady = true
          }
          streamedText += chunk
          updateAiMessage(aiMsgId, streamedText)
        },
        onDone: () => {
          isSendingRef.current = false
          if (!aiBubbleReady) {
            appendAiMessage(aiMsgId)
            setIsTyping(false)
          }
          finalizeAiMessage(aiMsgId, streamedText || "I've noted your message. Is there anything else you'd like to know, or would you like to book an appointment?")
        },
        onError: () => {
          isSendingRef.current = false
          if (controller.signal.aborted) return
          if (!aiBubbleReady) {
            appendAiMessage(aiMsgId)
            setIsTyping(false)
          }
          updateAiMessage(aiMsgId, streamedText || 'Sorry, I could not process your symptoms. Please try again.')
        },
      })
    } catch (err) {
      isSendingRef.current = false
      if (err.name === 'AbortError') return
      setIsTyping(false)
      setMessages((prev) => [
        ...prev,
        {
          id: aiMsgId,
          role: 'ai',
          text: err?.message || 'Sorry, I could not connect to the AI service. Please try again later.',
          timestamp: 'Just now',
          chips: [],
        },
      ])
    }
  }

  const copyMessage = (id, text) => {
    navigator.clipboard.writeText(text).catch(() => {})
    setCopiedId(id)
    globalThis.setTimeout(() => setCopiedId(null), 2000)
  }

  const clearConversation = () => {
    setMessages([getInitialMessage(patientFirstName)])
    setShowSuggestions(true)
    setIsTyping(false)
    setInputValue('')
    setFeedbackById({})
    setSeverityLevel(0)
    setSelectedDuration('')
    setSelectedSymptomTags([])
    setHasRecommendation(false)
    setAiSpecialties([])
    setCreatedAppointment(null)
    sessionIdRef.current = null
    if (storageKey) {
      sessionStorage.setItem(storageKey, JSON.stringify({
        messages: [getInitialMessage(patientFirstName)],
        sessionId: null,
        nextMessageId: nextMessageIdRef.current,
        cleared: true,
      }))
    }
  }

  const refreshConversation = async () => {
    if (isSendingRef.current) return
    const sid = (sessionIdRef.current || '').trim()
    if (!sid) {
      clearConversation()
      return
    }
    try {
      const res = await getTriageSession(sid)
      const session = res?.data ?? res
      if (session?.id) {
        hydrateFromSession(session)
      }
    } catch {
      appendAssistantMessage('I could not refresh your previous conversation right now. Please try again.')
    }
  }

  const toggleTag = (tag) => {
    setSelectedSymptomTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    )
  }

  const handleMicToggle = async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop()
      return
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      mediaChunksRef.current = []
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) mediaChunksRef.current.push(e.data)
      }
      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop())
        setIsRecording(false)
        setTranscribing(true)
        try {
          const blob = new Blob(mediaChunksRef.current, { type: 'audio/webm' })
          const { text } = await transcribeSpeech(blob)
          if (text) setInputValue((prev) => (prev ? `${prev} ${text}` : text))
        } catch { /* mic or transcription error */ } finally {
          setTranscribing(false)
        }
      }
      recorder.start()
      mediaRecorderRef.current = recorder
      setIsRecording(true)
    } catch { /* microphone access denied */ }
  }

  const handleManualSend = () => {
    if (isSendingRef.current) return
    const baseText = inputValue.trim()
    const hasEnhancerData = selectedSymptomTags.length > 0 || !!selectedDuration || severityLevel > 0
    if (!baseText && !hasEnhancerData) return

    const parts = []
    if (baseText) parts.push(baseText)
    if (selectedSymptomTags.length > 0) parts.push(`I'm experiencing ${selectedSymptomTags.join(', ')}`)
    const composedText = parts.join('. ')

    const metadata = {
      displayText: baseText || null,
      tags: [...selectedSymptomTags],
      duration: selectedDuration || null,
      severity: severityLevel > 0 ? String(severityLevel) : null,
    }

    sendMessage(composedText, metadata)
    setSeverityLevel(0)
    setSelectedDuration('')
    setSelectedSymptomTags([])
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

    // Remove the last AI message
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

    // Re-send the same message through the AI
    sendMessage(lastPatient.text)
  }


  // Prefer AI-provided specialties from BE; fall back to local keyword matching
  const specialtySuggestions = (() => {
    if (aiSpecialties.length > 0) return aiSpecialties

    // Fallback: scan ALL patient messages for keywords
    const allPatientText = messages
      .filter((m) => m.role === 'patient')
      .map((m) => String(m.text || ''))
      .join(' ')
      .toLowerCase()

    if (allPatientText.includes('stomach') || allPatientText.includes('nausea') || allPatientText.includes('vomit') || allPatientText.includes('abdominal')) return SYMPTOM_SPECIALTY_SUGGESTIONS.nausea
    if (allPatientText.includes('diarrhea') || allPatientText.includes('bowel')) return SYMPTOM_SPECIALTY_SUGGESTIONS.diarrhea
    if (allPatientText.includes('head')) return SYMPTOM_SPECIALTY_SUGGESTIONS.headache
    if (allPatientText.includes('fever') || allPatientText.includes('temperature')) return SYMPTOM_SPECIALTY_SUGGESTIONS.fever
    if (allPatientText.includes('chest') || allPatientText.includes('heart')) return SYMPTOM_SPECIALTY_SUGGESTIONS.chest
    if (allPatientText.includes('fatigue') || allPatientText.includes('tired')) return SYMPTOM_SPECIALTY_SUGGESTIONS.fatigue
    if (allPatientText.includes('back pain') || allPatientText.includes('back ache')) return SYMPTOM_SPECIALTY_SUGGESTIONS.back
    if (allPatientText.includes('joint') || allPatientText.includes('arthritis')) return SYMPTOM_SPECIALTY_SUGGESTIONS.joint
    if (allPatientText.includes('skin') || allPatientText.includes('rash') || allPatientText.includes('itch')) return SYMPTOM_SPECIALTY_SUGGESTIONS.skin

    return SYMPTOM_SPECIALTY_SUGGESTIONS.default
  })()

  const trimmedInput = inputValue.trim()

  // Build triage session payload for booking — ensure suggested_department is always filled
  const buildTriagePayload = () => {
    const base = currentTriageSession || initialSession || {}
    return {
      ...base,
      suggested_department: base.suggested_department || specialtySuggestions[0] || null,
    }
  }
  const hasEnhancerData = selectedSymptomTags.length > 0 || !!selectedDuration || severityLevel > 0
  const composedLength = (() => {
    const parts = [trimmedInput]
    if (selectedSymptomTags.length > 0) parts.push(`Also: ${selectedSymptomTags.join(', ')}`)
    if (selectedDuration) parts.push(selectedDuration)
    if (severityLevel > 0) parts.push(`${severityLevel}/10`)
    return parts.filter(Boolean).join('. ').length
  })()
  const hasActiveSession = !!sessionIdRef.current
  const inputTooShort = false   // disabled — always allow any non-empty input
  const canSend = composedLength > 0 && !isTyping && !!currentUser?.id
  const sendButtonClass = canSend
    ? 'bg-indigo-600 text-white hover:-translate-y-px hover:bg-indigo-700 hover:shadow-[0_4px_12px_rgba(99,102,241,0.4)] active:scale-95 dark:bg-indigo-600 dark:hover:bg-indigo-500'
    : 'cursor-not-allowed bg-slate-100 text-slate-300 dark:bg-[#1c1c25] dark:text-[#404050]'

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
          <Tooltip label="New conversation">
            <button
              type="button"
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-150 hover:bg-slate-100 dark:hover:bg-[#16161e]"
              onClick={clearConversation}
              aria-label="New conversation"
            >
              <span className="inline-flex h-4 w-4 text-slate-400 dark:text-[#606070]"><RotateCcwIcon /></span>
            </button>
          </Tooltip>

          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition-all duration-150 hover:border-indigo-300 hover:bg-slate-50 hover:text-indigo-600 dark:border-[#252530] dark:text-[#9898b0] dark:hover:border-indigo-700 dark:hover:bg-[#16161e] dark:hover:text-indigo-400"
            onClick={() => navigateTo('booking-wizard', { triageSession: buildTriagePayload() })}
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
              <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-[#eeeef5]">What&apos;s on your mind, {patientFirstName}?</h2>
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
                    className="card-hover rounded-2xl border border-slate-200 bg-white p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-300 hover:bg-indigo-50/50 dark:border-[#252530] dark:bg-[#111118] dark:hover:border-indigo-700 dark:hover:bg-indigo-950/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none"
                    onClick={() => sendMessage(card.prompt)}
                    disabled={isTyping}
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
          <div className="mx-auto flex max-w-2xl w-full flex-col gap-5 px-4 py-8 min-w-0">
            {messages.map((message) => {
              if (message.role === 'patient') {
                const hasTags = message.tags?.length > 0
                const hasMeta = hasTags || message.duration || (message.severity > 0)
                const displayText = message.displayText === undefined ? message.text : message.displayText
                return (
                  <div key={message.id} className="flex justify-end">
                    <div className="flex max-w-[88%] flex-col items-end gap-1">
                      <div className="message-in rounded-2xl rounded-tr-md bg-indigo-600 px-4 py-3 shadow-[0_1px_3px_rgba(99,102,241,0.25)] dark:bg-indigo-600 dark:shadow-[0_1px_3px_rgba(99,102,241,0.3)]">
                        {displayText && (
                          <p className="text-[0.9375rem] leading-relaxed text-white">{displayText}</p>
                        )}
                        {hasMeta && (
                          <div className={`flex flex-wrap gap-1.5 ${displayText ? 'mt-2.5 border-t border-indigo-500/40 pt-2.5' : ''}`}>
                            {message.tags?.map((tag) => (
                              <span key={tag} className="rounded-full bg-white/20 px-2.5 py-0.5 text-[11px] font-medium text-white">
                                {tag}
                              </span>
                            ))}
                            {message.duration && (
                              <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[11px] font-medium text-white">
                                ⏱ {message.duration}
                              </span>
                            )}
                            {message.severity > 0 && (() => {
                              const key = getSeverityColorKey(message.severity)
                              let sevCls
                              if (key === 'rose') sevCls = 'bg-rose-400/30 text-white'
                              else if (key === 'amber') sevCls = 'bg-amber-400/30 text-white'
                              else sevCls = 'bg-emerald-400/30 text-white'
                              return (
                                <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${sevCls}`}>
                                  Pain {message.severity}/10
                                </span>
                              )
                            })()}
                          </div>
                        )}
                      </div>
                      <span className="mt-0.5 pr-1 text-[11px] text-slate-400 dark:text-[#505060]">{message.timestamp}</span>
                    </div>
                  </div>
                )
              }

              return (
                <div key={message.id} className="group/ai flex justify-start message-in">
                  <div className="flex items-start gap-3 min-w-0 w-full">
                    <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-400 to-violet-600 text-white">
                      <span className="inline-flex h-3 w-3"><SparklesIcon /></span>
                    </span>

                    <div className="flex min-w-0 max-w-[calc(100%-2.25rem)] flex-col gap-1.5 rounded-2xl rounded-tl-md bg-white px-4 py-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)] ring-1 ring-slate-100 dark:bg-[#18182a] dark:shadow-none dark:ring-[#252530]">
                      <AiMessageContent text={message.text} />

                      {Array.isArray(message.chips) && message.chips.length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-2">
                          {message.chips.map((chip) => (
                            <button
                              key={`${message.id}-${chip}`}
                              type="button"
                              disabled={isTyping}
                              className={`cursor-pointer rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition-all duration-150 hover:-translate-y-px hover:border-indigo-300 hover:bg-indigo-50/60 hover:text-indigo-600 dark:border-[#252530] dark:bg-[#111118] dark:text-[#9898b0] dark:hover:border-indigo-700 dark:hover:bg-indigo-950/40 dark:hover:text-indigo-400 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:transform-none`}
                              onClick={() => sendMessage(chip)}
                            >
                              {chip}
                            </button>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center gap-1 opacity-0 transition-opacity duration-150 group-hover/ai:opacity-100 focus-within:opacity-100 has-[button[data-active=true]]:opacity-100 [@media(hover:none)]:opacity-100">
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
                            data-active={feedbackById[message.id] === 'up' || undefined}
                            className="group inline-flex h-7 w-7 items-center justify-center rounded-lg transition-all duration-150 hover:bg-slate-100 dark:hover:bg-[#1c1c25]"
                            onClick={() => toggleFeedback(message.id, 'up')}
                          >
                            <span className={`inline-flex h-3.5 w-3.5 ${feedbackById[message.id] === 'up' ? 'text-indigo-500' : 'text-slate-300 group-hover:text-slate-500 dark:text-[#404050]'}`}><ThumbsUpIcon /></span>
                          </button>
                        </Tooltip>

                        <Tooltip label="Not helpful">
                          <button
                            type="button"
                            data-active={feedbackById[message.id] === 'down' || undefined}
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

                        <span className="ml-2 text-[11px] text-slate-400 dark:text-[#505060]">{message.timestamp}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}

            {hasRecommendation && (
              <div className="message-in ml-9 overflow-hidden rounded-xl border border-indigo-200 dark:border-indigo-800/60">
                {/* Highlighted specialty banner */}
                <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-white/20">
                      <span className="text-sm">🏥</span>
                    </span>
                    <div>
                      <p className="text-xs font-medium text-indigo-100">AI Recommendation</p>
                      <p className="text-sm font-bold text-white">
                        {specialtySuggestions[0] || 'Specialist Consultation'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-4 dark:bg-[#111118]">
                  {specialtySuggestions.length > 1 && (
                    <div className="mb-3">
                      <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400 dark:text-[#606070] mb-2">Also consider</p>
                      <div className="flex flex-wrap gap-2" aria-label="Specialty suggestions">
                        {specialtySuggestions.slice(1).map((specialty) => (
                          <span key={specialty} className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-300">
                            <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
                            {specialty}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <button
                    type="button"
                    className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-all duration-150 hover:bg-indigo-700 active:scale-[0.98] dark:bg-indigo-600 dark:hover:bg-indigo-500"
                    onClick={() => navigateTo('booking-wizard', { triageSession: buildTriagePayload() })}
                  >
                    Book Appointment — {specialtySuggestions[0] || 'Specialist'}
                  </button>
                </div>
              </div>
            )}

            {createdAppointment && (
              createdAppointment.status === 'pending_review' ? (
                /* ── Pending Doctor Review card ── */
                <div className="message-in ml-9 overflow-hidden rounded-xl border border-amber-200 shadow-sm dark:border-amber-800/60">
                  {/* Header */}
                  <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/20">
                        <span className="text-lg">⏳</span>
                      </span>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-amber-100">Awaiting Doctor Review</p>
                        <p className="mt-0.5 text-base font-bold text-white leading-tight">
                          {createdAppointment.specialty || 'Booking Request Submitted'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Info rows */}
                  <div className="divide-y divide-slate-100 bg-white dark:divide-[#1e1e2a] dark:bg-[#111118]">
                    {createdAppointment.doctor_name && (
                      <div className="flex items-center gap-3 px-4 py-2.5">
                        <span className="shrink-0 text-base">👨‍⚕️</span>
                        <div className="min-w-0">
                          <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400 dark:text-[#606070]">Requested Doctor</p>
                          <p className="text-sm font-semibold text-slate-800 dark:text-[#dddde8] truncate">{createdAppointment.doctor_name}</p>
                        </div>
                      </div>
                    )}
                    {createdAppointment.date && (
                      <div className="flex items-center gap-3 px-4 py-2.5">
                        <span className="shrink-0 text-base">📅</span>
                        <div>
                          <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400 dark:text-[#606070]">Requested Date &amp; Time</p>
                          <p className="text-sm font-semibold text-slate-800 dark:text-[#dddde8]">
                            {createdAppointment.date}
                            {createdAppointment.start_time && <span className="font-normal text-slate-500 dark:text-[#80809a]"> at {createdAppointment.start_time}</span>}
                          </p>
                        </div>
                      </div>
                    )}
                    <div className="flex items-start gap-3 px-4 py-2.5">
                      <span className="shrink-0 text-base mt-0.5">🩺</span>
                      <p className="text-xs text-slate-500 dark:text-[#80809a]">
                        The doctor will review your request and confirm the appointment. You will be notified once confirmed.
                      </p>
                    </div>
                  </div>

                  {/* Action */}
                  <div className="bg-white px-4 pb-4 pt-3 dark:bg-[#111118]">
                    <button
                      type="button"
                      className="w-full rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-semibold text-white transition-all duration-150 hover:bg-amber-600 active:scale-[0.98]"
                      onClick={() => navigateTo('appointments')}
                    >
                      View My Appointments →
                    </button>
                  </div>
                </div>
              ) : (
                /* ── Appointment Confirmed card (legacy / direct booking) ── */
                <div className="message-in ml-9 overflow-hidden rounded-xl border border-emerald-200 shadow-sm dark:border-emerald-800/60">
                  {/* Header */}
                  <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/20">
                        <span className="text-lg">✅</span>
                      </span>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-emerald-100">Appointment Confirmed</p>
                        <p className="mt-0.5 text-base font-bold text-white leading-tight">
                          {createdAppointment.specialty || 'Your Appointment'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Info rows */}
                  <div className="divide-y divide-slate-100 bg-white dark:divide-[#1e1e2a] dark:bg-[#111118]">
                    {createdAppointment.doctor_name && (
                      <div className="flex items-center gap-3 px-4 py-2.5">
                        <span className="shrink-0 text-base">👨‍⚕️</span>
                        <div className="min-w-0">
                          <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400 dark:text-[#606070]">Doctor</p>
                          <p className="text-sm font-semibold text-slate-800 dark:text-[#dddde8] truncate">{createdAppointment.doctor_name}</p>
                        </div>
                      </div>
                    )}
                    {createdAppointment.date && (
                      <div className="flex items-center gap-3 px-4 py-2.5">
                        <span className="shrink-0 text-base">📅</span>
                        <div>
                          <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400 dark:text-[#606070]">Date &amp; Time</p>
                          <p className="text-sm font-semibold text-slate-800 dark:text-[#dddde8]">
                            {createdAppointment.date}
                            {createdAppointment.start_time && <span className="font-normal text-slate-500 dark:text-[#80809a]"> at {createdAppointment.start_time}</span>}
                          </p>
                        </div>
                      </div>
                    )}
                    {createdAppointment.appointment_id && (
                      <div className="flex items-center gap-3 px-4 py-2.5">
                        <span className="shrink-0 text-base">🔖</span>
                        <div className="min-w-0">
                          <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400 dark:text-[#606070]">Booking ID</p>
                          <p className="font-mono text-xs text-slate-500 dark:text-[#80809a] truncate">
                            {createdAppointment.appointment_id.slice(0, 8).toUpperCase()}
                            <span className="text-slate-300 dark:text-[#404050]">···</span>
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action */}
                  <div className="bg-white px-4 pb-4 pt-3 dark:bg-[#111118]">
                    <button
                      type="button"
                      className="w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition-all duration-150 hover:bg-emerald-700 active:scale-[0.98]"
                      onClick={() => navigateTo('appointments')}
                    >
                      View My Appointments →
                    </button>
                  </div>
                </div>
              )
            )}


            {isTyping && (() => {
              const phrases = THINKING_PHRASES_EN
              return (
                <div className="flex items-start gap-3 message-in">
                  <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-400 to-violet-600 text-white">
                    <span className="inline-flex h-3 w-3"><SparklesIcon /></span>
                  </span>

                  <div className="flex items-center gap-2 rounded-2xl rounded-tl-md bg-white px-4 py-2.5 ring-1 ring-slate-100 dark:bg-[#18182a] dark:ring-[#252530]">
                    <span className="typing-dot h-1.5 w-1.5 rounded-full bg-indigo-400 dark:bg-indigo-500" style={{ animationDelay: '0ms' }} />
                    <span className="typing-dot h-1.5 w-1.5 rounded-full bg-indigo-400 dark:bg-indigo-500" style={{ animationDelay: '150ms' }} />
                    <span className="typing-dot h-1.5 w-1.5 rounded-full bg-indigo-400 dark:bg-indigo-500" style={{ animationDelay: '300ms' }} />
                    <span
                      key={thinkingIdx}
                      className="ml-1 text-[0.8125rem] text-slate-400 dark:text-[#606070] animate-[fadeIn_0.35s_ease]"
                    >
                      {phrases[thinkingIdx]}
                    </span>
                  </div>
                </div>
              )
            })()}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <div className="shrink-0 bg-[#f8fafc] px-6 pb-6 pt-3 dark:bg-[#08080f]">
        <div className="mx-auto w-full max-w-2xl">
          <div className="rounded-2xl border border-slate-200 bg-white shadow-[0_4px_24px_rgba(0,0,0,0.06)] transition-all duration-200 focus-within:border-indigo-300 focus-within:shadow-[0_4px_24px_rgba(99,102,241,0.12)] dark:border-[#252530] dark:bg-[#111118] dark:shadow-[0_4px_24px_rgba(0,0,0,0.4)] dark:focus-within:border-indigo-700 dark:focus-within:shadow-[0_4px_24px_rgba(99,102,241,0.15)]">

            {/* Textarea row */}
            <div className="flex items-end gap-3 px-4 pb-2 pt-3">
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
                    handleManualSend()
                  }
                }}
              />

              <div className="flex shrink-0 items-center gap-2 self-end">
                <button
                  type="button"
                  onClick={handleMicToggle}
                  disabled={transcribing}
                  aria-label={isRecording ? 'Stop recording' : 'Voice input'}
                  className={`inline-flex h-8 w-8 items-center justify-center rounded-xl transition-all duration-150 ${
                    isRecording
                      ? 'animate-pulse bg-rose-100 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400'
                      : 'text-slate-400 hover:bg-slate-100 dark:text-[#606070] dark:hover:bg-[#1c1c25]'
                  } ${transcribing ? 'cursor-not-allowed opacity-50' : ''}`}
                >
                  <span className="inline-flex h-4 w-4">
                    {isRecording ? <MicOffIcon /> : <MicIcon />}
                  </span>
                </button>

                <span className={`text-[11px] text-slate-300 transition-opacity dark:text-[#404050] ${inputValue.length > 0 ? 'opacity-100' : 'opacity-0'}`}>
                  {inputValue.length}/500
                </span>

                <button
                  type="button"
                  className={`inline-flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-150 ${sendButtonClass}`}
                  onClick={handleManualSend}
                  disabled={!canSend}
                  aria-label="Send message"
                >
                  <span className="inline-flex h-4 w-4"><ArrowUpIcon /></span>
                </button>
              </div>
            </div>

            {/* Enhancer panel */}
            <div className="border-t border-slate-100 dark:border-[#1c1c25]">
              {/* Toggle button */}
              <button
                type="button"
                className="flex w-full items-center justify-center gap-1 py-1.5 text-[11px] font-medium text-slate-400 transition-colors hover:text-slate-600 dark:text-[#505060] dark:hover:text-[#70708a]"
                onClick={() => setShowEnhancer((prev) => !prev)}
              >
                <span>{showEnhancer ? 'Hide' : 'Show'} symptom details</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`h-3 w-3 transition-transform duration-200 ${showEnhancer ? 'rotate-180' : ''}`}><polyline points="6 9 12 15 18 9" /></svg>
              </button>

            {showEnhancer && (
            <div className="px-4 pb-3.5 pt-1">

              {/* Symptom tag pills */}
              <div className="mb-3">
                <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-[#505060]">Quick symptoms</p>
                <div className="flex flex-wrap gap-1.5">
                  {SYMPTOM_TAGS.map((tag) => {
                    const active = selectedSymptomTags.includes(tag)
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleTag(tag)}
                        className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition-all duration-150 ${
                          active
                            ? 'bg-indigo-600 text-white'
                            : 'border border-slate-200 text-slate-500 hover:border-indigo-300 hover:text-indigo-600 dark:border-[#252530] dark:text-[#70708a] dark:hover:border-indigo-700 dark:hover:text-indigo-400'
                        }`}
                      >
                        {active ? '✓ ' : ''}{tag}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Duration + Severity */}
              <div className="flex flex-wrap items-start gap-x-6 gap-y-2.5">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-[#505060]">Duration</span>
                  {DURATION_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setSelectedDuration((prev) => prev === opt.value ? '' : opt.value)}
                      className={`rounded-lg px-2 py-1 text-[11px] font-medium transition-all duration-150 ${
                        selectedDuration === opt.value
                          ? 'bg-indigo-600 text-white'
                          : 'border border-slate-200 text-slate-500 hover:border-indigo-300 hover:text-indigo-600 dark:border-[#252530] dark:text-[#70708a] dark:hover:border-indigo-700'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-[#505060]">Severity</span>
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => {
                      const isSelected = severityLevel === n
                      const isFilled = severityLevel > 0 && n <= severityLevel
                      const colorKey = getSeverityColorKey(n)
                      const selectedCls = SEVERITY_SELECTED_CLS[colorKey]
                      const filledCls = SEVERITY_FILLED_CLS[colorKey]
                      let btnCls
                      if (isSelected) btnCls = selectedCls
                      else if (isFilled) btnCls = filledCls
                      else btnCls = 'text-slate-400 hover:bg-slate-100 dark:text-[#606070] dark:hover:bg-[#1c1c25]'
                      return (
                        <button
                          key={n}
                          type="button"
                          onClick={() => setSeverityLevel((prev) => prev === n ? 0 : n)}
                          className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold transition-all duration-100 ${btnCls}`}
                        >
                          {n}
                        </button>
                      )
                    })}
                  </div>
                  {severityLevel > 0 && (
                    <span className={`text-[11px] font-semibold ${getSeverityLabelCls(severityLevel)}`}>
                      {getSeverityLabel(severityLevel)}
                    </span>
                  )}
                </div>
              </div>

              {/* Active summary row */}
              {(selectedSymptomTags.length > 0 || selectedDuration || severityLevel > 0) && (
                <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-slate-100 pt-3 dark:border-[#1c1c25]">
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-[#505060]">Will include</span>
                  {selectedSymptomTags.map((tag) => (
                    <span key={tag} className="flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-0.5 text-[11px] font-medium text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
                      {tag}
                    </span>
                  ))}
                  {selectedDuration && (
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:bg-[#1c1c25] dark:text-[#9898b0]">
                      ⏱ {selectedDuration}
                    </span>
                  )}
                  {severityLevel > 0 && (
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${SEVERITY_CHIP_CLS[getSeverityColorKey(severityLevel)]}`}>
                      Pain {severityLevel}/10
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => { setSeverityLevel(0); setSelectedDuration(''); setSelectedSymptomTags([]) }}
                    className="ml-auto text-[11px] font-medium text-slate-400 transition-colors hover:text-rose-500 dark:text-[#505060] dark:hover:text-rose-400"
                  >
                    Clear all
                  </button>
                </div>
              )}
            </div>
            )}
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
  currentUser: PropTypes.object,
}
