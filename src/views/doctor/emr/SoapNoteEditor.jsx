import PropTypes from 'prop-types'
import { SparklesIcon, SaveIcon, SearchIcon, XIcon, CheckIcon } from './EmrIcons'
import { SOAP_SECTIONS_CONFIG } from './EmrData'

export default function SoapNoteEditor({
  soapSections,
  setSoapSections,
  activeSoapSection,
  setActiveSoapSection,
  noteTemplate,
  handleTemplateChange,
  noteText,
  setNoteText,
  icdSearch,
  setIcdSearch,
  icdResults,
  showIcdDropdown,
  setShowIcdDropdown,
  icdCodes,
  addIcdCode,
  removeIcdCode,
  filterIcdResults,
  handleSaveNote,
  lastSaved,
  clinicianName,
  onAiAssist,
  isAiGenerating = false,
}) {
  return (
    <aside className="w-[400px] xl:w-[440px] 2xl:w-[480px] flex shrink-0 flex-col border-l border-slate-200/80 bg-white/40 backdrop-blur-3xl dark:border-[#252530]/80 dark:bg-[#0e0e15]/60 z-20 overflow-hidden">
      <div className="flex h-14 items-center justify-between border-b border-slate-200/80 px-5 dark:border-[#252530]/80">
        <h3 className="text-sm font-bold text-slate-900 dark:text-[#eeeef5]">Clinical Note</h3>
        <div className="flex items-center gap-2">
          <select
            value={noteTemplate}
            onChange={(e) => handleTemplateChange(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-medium text-slate-600 outline-none dark:border-[#252530] dark:bg-[#1c1c25] dark:text-[#9898b0]"
          >
            <option value="soap">SOAP</option>
            <option value="free">Free Text</option>
            <option value="followup">Follow-up</option>
          </select>
          <button
            type="button"
            onClick={handleSaveNote}
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-[11px] font-bold text-white transition-all hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500"
          >
            <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center">
              <SaveIcon />
            </span>
            <span>Save</span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 scrollbar-hide">
        {noteTemplate === 'soap' ? (
          <div className="space-y-4">
            {/* Completion indicator */}
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white/50 px-4 py-3 dark:border-[#252530] dark:bg-[#111118]/50">
               <div className="flex flex-1 gap-1">
                  {SOAP_SECTIONS_CONFIG.map((sec) => {
                    const filled = !!soapSections[sec.key].trim()
                    return (
                      <div key={sec.key} className={`h-1.5 flex-1 rounded-full ${filled ? `bg-${sec.color}-500` : 'bg-slate-200 dark:bg-[#252530]'}`} />
                    )
                  })}
               </div>
               <button
                  type="button"
                  onClick={onAiAssist}
                  disabled={isAiGenerating}
                  className="group relative inline-flex items-center gap-1.5 overflow-hidden rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-3 py-1.5 text-[11px] font-bold text-white shadow-md transition-all hover:-translate-y-0.5 hover:from-violet-500 hover:to-indigo-500 hover:shadow-indigo-500/30 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
               >
                  <span className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.2)_50%,transparent_75%)] bg-[length:250%_250%] bg-[-100%_0] transition-all duration-700 group-hover:bg-[100%_0]" />
                  <span className="relative z-10 flex h-3.5 w-3.5 shrink-0 items-center justify-center text-indigo-100">
                    {isAiGenerating ? (
                      <svg className="animate-spin h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    ) : (
                      <SparklesIcon />
                    )}
                  </span>
                  <span className="relative z-10">{isAiGenerating ? 'Generating…' : 'AI Draft'}</span>
               </button>
            </div>

            {/* Interactive Sections */}
            <div className="space-y-3">
              {SOAP_SECTIONS_CONFIG.map((sec) => {
                const isActive = activeSoapSection === sec.key
                const hasContent = !!soapSections[sec.key].trim()
                return (
                  <div
                    key={sec.key}
                    className={`group rounded-2xl border transition-all duration-200 ${
                      isActive ? 'border-indigo-400/50 bg-white shadow-md dark:border-indigo-500/30 dark:bg-[#111118]' : 'border-slate-200/60 bg-white/30 dark:border-[#252530]/60 dark:bg-[#111118]/30'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setActiveSoapSection(isActive ? null : sec.key)}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left"
                    >
                      <span className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-black transition-colors ${
                        hasContent ? `bg-${sec.color}-500 text-white` : 'bg-slate-100 text-slate-400 dark:bg-[#1c1c25]'
                      }`}>
                        {sec.letter}
                      </span>
                      <span className={`flex-1 text-sm font-bold ${isActive ? 'text-slate-900 dark:text-[#eeeef5]' : 'text-slate-500 dark:text-[#70708a]'}`}>
                        {sec.label}
                      </span>
                      {hasContent && !isActive && (
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center text-emerald-500">
                          <CheckIcon />
                        </span>
                      )}
                    </button>

                    {isActive && (
                      <div className="px-4 pb-4">
                        <textarea
                          autoFocus
                          value={soapSections[sec.key]}
                          onChange={(e) => setSoapSections({ ...soapSections, [sec.key]: e.target.value })}
                          placeholder={sec.placeholder}
                          className="min-h-[120px] w-full resize-none bg-transparent text-sm leading-relaxed text-slate-800 outline-none placeholder:text-slate-400 dark:text-[#c8c8e0] dark:placeholder:text-[#505060]"
                        />
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {sec.chips.map((chip) => (
                            <button
                              key={chip}
                              type="button"
                              onClick={() => setSoapSections({ ...soapSections, [sec.key]: soapSections[sec.key] ? `${soapSections[sec.key].trim()} ${chip}.` : `${chip}.` })}
                              className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-semibold text-slate-600 transition-colors hover:bg-indigo-50 hover:text-indigo-600 dark:border-[#252530] dark:bg-[#1c1c25] dark:text-[#8a8aa0] dark:hover:bg-indigo-950/40 dark:hover:text-indigo-400"
                            >
                              + {chip}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          <textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Start typing your note..."
            className="min-h-[400px] w-full resize-none rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm leading-relaxed text-slate-800 outline-none placeholder:text-slate-400 focus:border-indigo-400 dark:border-[#252530] dark:bg-[#111118] dark:text-[#c8c8e0]"
          />
        )}

        {/* Diagnoses Section */}
        <div className="mt-8">
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-[#505060]">ICD-10 Diagnoses</p>
          <div className="relative mt-3">
             <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <SearchIcon />
             </span>
             <input
                type="text"
                value={icdSearch}
                onChange={(e) => {
                  setIcdSearch(e.target.value)
                  setShowIcdDropdown(e.target.value.length > 1)
                  filterIcdResults(e.target.value)
                }}
                onBlur={() => setTimeout(() => setShowIcdDropdown(false), 200)}
                placeholder="Search codes..."
                className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-10 pr-4 text-sm outline-none focus:border-indigo-400 dark:border-[#252530] dark:bg-[#111118] dark:text-[#eeeef5]"
             />
             {showIcdDropdown && (
               <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-48 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-xl dark:border-[#252530] dark:bg-[#18181f]">
                  {icdResults.map((r) => (
                    <button
                      key={r.code}
                      type="button"
                      onClick={() => addIcdCode(r)}
                      className="flex w-full items-center gap-3 border-b border-slate-50 px-4 py-3 text-left last:border-0 hover:bg-slate-50 dark:border-[#1c1c25] dark:hover:bg-[#16161e]"
                    >
                      <span className="shrink-0 rounded-md bg-indigo-50 px-2 py-0.5 font-mono text-[10px] font-bold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">{r.code}</span>
                      <span className="truncate text-xs text-slate-700 dark:text-[#c8c8e0]">{r.desc}</span>
                    </button>
                  ))}
               </div>
             )}
          </div>
          
          <div className="mt-3 flex flex-wrap gap-2">
            {icdCodes.map((c) => (
              <span key={c.code} className="flex items-center gap-2 rounded-lg bg-indigo-50 px-3 py-1.5 dark:bg-indigo-950/40">
                <span className="font-mono text-[10px] font-bold text-indigo-700 dark:text-indigo-300">{c.code}</span>
                <span className="text-[10px] text-slate-600 dark:text-[#9898b0]">{c.desc}</span>
                <button type="button" onClick={() => removeIcdCode(c.code)} className="text-indigo-400 hover:text-indigo-600">
                  <XIcon />
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-slate-200/80 px-5 py-3 dark:border-[#252530]/80">
         <div className="flex items-center justify-between text-[10px] text-slate-400">
            <span>Author: {clinicianName}</span>
            <span>Last saved: {lastSaved}</span>
         </div>
      </div>
    </aside>
  )
}

SoapNoteEditor.propTypes = {
  soapSections: PropTypes.object.isRequired,
  setSoapSections: PropTypes.func.isRequired,
  activeSoapSection: PropTypes.string,
  setActiveSoapSection: PropTypes.func.isRequired,
  noteTemplate: PropTypes.string.isRequired,
  setNoteTemplate: PropTypes.func,
  handleTemplateChange: PropTypes.func.isRequired,
  noteText: PropTypes.string.isRequired,
  setNoteText: PropTypes.func.isRequired,
  icdSearch: PropTypes.string.isRequired,
  setIcdSearch: PropTypes.func.isRequired,
  icdResults: PropTypes.array.isRequired,
  showIcdDropdown: PropTypes.bool.isRequired,
  setShowIcdDropdown: PropTypes.func.isRequired,
  icdCodes: PropTypes.array.isRequired,
  addIcdCode: PropTypes.func.isRequired,
  removeIcdCode: PropTypes.func.isRequired,
  filterIcdResults: PropTypes.func.isRequired,
  handleSaveNote: PropTypes.func.isRequired,
  lastSaved: PropTypes.string.isRequired,
  clinicianName: PropTypes.string.isRequired,
  clinicianSpecialty: PropTypes.string.isRequired,
  onAiAssist: PropTypes.func.isRequired,
  isAiGenerating: PropTypes.bool,
}
