import { describe, expect, it } from 'vitest'
import { detectPriority } from './labResultUtils'

describe('detectPriority', () => {
  it('parses the canonical AI lab priority labels', () => {
    expect(detectPriority('5. Priority Level: Routine')).toBe('low')
    expect(detectPriority('5. Priority Level: Priority')).toBe('priority')
    expect(detectPriority('5. Priority Level: Urgent')).toBe('urgent')
  })

  it('does not downgrade Priority to low when the heading omits Level', () => {
    expect(detectPriority('Priority: Priority')).toBe('priority')
  })

  it('keeps legacy high/moderate wording readable', () => {
    expect(detectPriority('Priority: HIGH')).toBe('high')
    expect(detectPriority('Priority Level: Moderate')).toBe('moderate')
  })
})
