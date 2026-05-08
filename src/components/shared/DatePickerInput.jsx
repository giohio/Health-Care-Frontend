import { useState, useRef, useEffect } from 'react'
import PropTypes from 'prop-types'

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const DAY_HEADERS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']

function getDaysInMonth(year, month) { return new Date(year, month + 1, 0).getDate() }
// Monday-first offset: Mon=0 … Sun=6
function getFirstDayOffset(year, month) { const d = new Date(year, month, 1).getDay(); return d === 0 ? 6 : d - 1 }

function toISO(year, month, day) {
  if (year === null || month === null || day === null) return null
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function parseISO(iso) {
  if (!iso || typeof iso !== 'string') return null
  const [y, m, d] = iso.split('-').map(Number)
  if (!y || !m || !d) return null
  return { y, m: m - 1, d }
}

export default function DatePickerInput({
  value,
  onChange,
  isAllTime = false,
  onActivate,
  placeholder = 'Select date range',
}) {
  const isRangeMode = typeof value === 'object' && value !== null
  const initStart = isRangeMode ? value.start : value
  const initEnd   = isRangeMode ? value.end : value

  const parsedStart = parseISO(initStart)
  const parsedEnd   = parseISO(initEnd)
  
  const today = new Date()
  
  const [open, setOpen] = useState(false)
  const [viewYear, setViewYear]   = useState(parsedStart?.y ?? today.getFullYear())
  const [viewMonth, setViewMonth] = useState(parsedStart?.m ?? today.getMonth())
  
  const containerRef = useRef(null)

  const [tempStart, setTempStart] = useState(parsedStart)
  const [tempEnd, setTempEnd]     = useState(parsedEnd)
  const [hoverDate, setHoverDate] = useState(null)

  useEffect(() => {
    if (open) {
      setTempStart(parsedStart)
      setTempEnd(parsedEnd)
      setViewYear(parsedStart?.y ?? today.getFullYear())
      setViewMonth(parsedStart?.m ?? today.getMonth())
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initStart, initEnd])

  useEffect(() => {
    if (!open) return undefined
    function handler(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1) }
    else setViewMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1) }
    else setViewMonth(m => m + 1)
  }

  const handleDayClick = (y, m, d) => {
    // Single date mode: apply and close immediately
    if (!isRangeMode) {
      onChange(toISO(y, m, d))
      setOpen(false)
      return
    }
    const clicked = { y, m, d }
    if (!tempStart || (tempStart && tempEnd)) {
      setTempStart(clicked)
      setTempEnd(null)
    } else {
      const d1 = new Date(tempStart.y, tempStart.m, tempStart.d)
      const d2 = new Date(y, m, d)
      if (d2 < d1) {
        setTempStart(clicked)
        setTempEnd(tempStart)
      } else {
        setTempEnd(clicked)
      }
    }
  }

  const handleApply = () => {
    const s = tempStart ? toISO(tempStart.y, tempStart.m, tempStart.d) : ''
    let e = s
    if (tempEnd) e = toISO(tempEnd.y, tempEnd.m, tempEnd.d)
    
    if (isRangeMode) onChange({ start: s, end: e })
    else onChange(s)
    
    setOpen(false)
  }

  const handleCancel = () => setOpen(false)

  const handleTriggerClick = () => {
    onActivate?.()
    setOpen(o => !o)
  }

  let displayLabel = placeholder
  if (parsedStart && parsedEnd) {
    const ds = new Date(parsedStart.y, parsedStart.m, parsedStart.d).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })
    const de = new Date(parsedEnd.y, parsedEnd.m, parsedEnd.d).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year:'numeric' })
    displayLabel = `${ds} - ${de}`
  } else if (parsedStart) {
    displayLabel = new Date(parsedStart.y, parsedStart.m, parsedStart.d).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year:'numeric' })
  }

  const renderCalendar = (y, m, showLeft = false, showRight = false) => {
    const totalDays   = getDaysInMonth(y, m)
    const firstOffset = getFirstDayOffset(y, m)
    const prevTotal   = getDaysInMonth(m === 0 ? y - 1 : y, m === 0 ? 11 : m - 1)

    // Build cell list with overflow days from prev/next month
    const cells = []
    for (let i = 0; i < firstOffset; i++) {
      cells.push({ day: prevTotal - firstOffset + i + 1, m: m === 0 ? 11 : m - 1, y: m === 0 ? y - 1 : y, other: true })
    }
    for (let i = 1; i <= totalDays; i++) {
      cells.push({ day: i, m, y, other: false })
    }
    let nextDay = 1
    while (cells.length < 42) {
      cells.push({ day: nextDay++, m: m === 11 ? 0 : m + 1, y: m === 11 ? y + 1 : y, other: true })
    }

    const toDt = (yy, mm, dd) => new Date(yy, mm, dd).getTime()
    const stTime  = tempStart ? toDt(tempStart.y, tempStart.m, tempStart.d) : null
    const ndTime  = tempEnd   ? toDt(tempEnd.y,   tempEnd.m,   tempEnd.d)   : null
    const hovTime = hoverDate ? toDt(hoverDate.y, hoverDate.m, hoverDate.d) : null

    return (
      <div className="flex flex-col w-64">
        {/* Header row with optional nav arrows */}
        <div className="relative flex items-center justify-center mb-4 h-7">
          {showLeft && (
            <button onClick={prevMonth} className="absolute left-0 h-7 w-7 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
          )}
          <span className="font-bold text-[15px] text-slate-800 dark:text-slate-200">{MONTHS[m]} {y}</span>
          {showRight && (
            <button onClick={nextMonth} className="absolute right-0 h-7 w-7 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          )}
        </div>

        <div className="grid grid-cols-7 mb-2">
          {DAY_HEADERS.map(d => <span key={d} className="text-center text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">{d}</span>)}
        </div>

        <div className="grid grid-cols-7 gap-y-1">
          {cells.map((cell, i) => {
            const cellTime = toDt(cell.y, cell.m, cell.day)
            const isStart = stTime === cellTime
            const isEnd   = ndTime === cellTime

            let isMid = false
            if (stTime && ndTime) isMid = cellTime > stTime && cellTime < ndTime
            else if (stTime && hovTime && isRangeMode) {
              isMid = (cellTime > stTime && cellTime <= hovTime) || (cellTime < stTime && cellTime >= hovTime)
            }

            let wrapperClass = 'h-8 w-full flex items-center justify-center relative'
            if (isMid) wrapperClass += ' bg-[#E7E9FD] dark:bg-indigo-900/30'
            if (isStart && (ndTime || hovTime) && ((ndTime ?? hovTime) > stTime)) wrapperClass += ' bg-gradient-to-r from-transparent via-[#E7E9FD] to-[#E7E9FD] dark:via-indigo-900/30 dark:to-indigo-900/30'
            if (isEnd && stTime && ndTime > stTime) wrapperClass += ' bg-gradient-to-l from-transparent via-[#E7E9FD] to-[#E7E9FD] dark:via-indigo-900/30 dark:to-indigo-900/30'

            let btnClass = 'h-8 w-8 rounded-full flex items-center justify-center text-[13px] z-10 transition-colors'
            if (isStart || isEnd) {
              btnClass += ' bg-indigo-600 text-white font-semibold shadow-sm'
            } else if (isMid) {
              btnClass += ' text-indigo-900 dark:text-indigo-200 font-medium'
            } else if (cell.other) {
              btnClass += ' text-slate-300 dark:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800'
            } else {
              btnClass += ' text-slate-700 dark:text-slate-200 font-medium hover:bg-slate-100 dark:hover:bg-slate-800'
            }

            return (
              <div key={i} className={wrapperClass}>
                <button
                  type="button"
                  onClick={() => handleDayClick(cell.y, cell.m, cell.day)}
                  onMouseEnter={() => { if (isRangeMode && tempStart && !tempEnd) setHoverDate(cell) }}
                  onMouseLeave={() => { if (isRangeMode) setHoverDate(null) }}
                  className={btnClass}
                >
                  {cell.day}
                </button>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  const rightY = viewMonth === 11 ? viewYear + 1 : viewYear
  const rightM = viewMonth === 11 ? 0 : viewMonth + 1

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={handleTriggerClick}
        className={`flex h-10 items-center gap-2 rounded-xl border border-transparent bg-white px-4 transition-all duration-300 dark:bg-[#111118]
          ${isAllTime
            ? 'opacity-60 grayscale hover:opacity-100 hover:grayscale-0'
            : 'border-indigo-100 ring-4 ring-indigo-50 hover:border-indigo-300 dark:border-indigo-900/50 dark:ring-indigo-900/20'
          }`}
      >
        <svg
          className={`h-4 w-4 shrink-0 transition-colors ${isAllTime ? 'text-slate-400' : 'text-indigo-500'}`}
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        >
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
        <span className={`text-[13px] font-medium whitespace-nowrap ${isAllTime ? 'text-slate-500' : 'text-indigo-950 dark:text-indigo-100'}`}>
          {displayLabel}
        </span>
      </button>

      {open && (
        <div className="absolute left-0 top-12 z-50 rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-[#252530] dark:bg-[#111118]">
          {isRangeMode ? (
            // Range mode: two calendars side-by-side, Cancel/Apply buttons
            <>
              <div className="flex items-start gap-8">
                {renderCalendar(viewYear, viewMonth, true, false)}
                <div className="border-l border-slate-200/60 dark:border-slate-700/50 self-stretch" />
                {renderCalendar(rightY, rightM, false, true)}
              </div>
              <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-slate-100 dark:border-[#1c1c25]">
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 text-sm font-semibold rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApply}
                  className="px-6 py-2 text-sm font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 shadow flex items-center justify-center transition-colors"
                >
                  Apply
                </button>
              </div>
            </>
          ) : (
            // Single date mode: one calendar, click closes immediately
            renderCalendar(viewYear, viewMonth, true, true)
          )}
        </div>
      )}
    </div>
  )
}

DatePickerInput.propTypes = {
  value:       PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  onChange:    PropTypes.func.isRequired,
  isAllTime:   PropTypes.bool,
  onActivate:  PropTypes.func,
  placeholder: PropTypes.string,
}
