import React from 'react'
import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

import AiMessageContent from '../../../components/shared/AiMessageContent.jsx'

describe('AiMessageContent', () => {
  it('renders appointment options as structured rows instead of one collapsed paragraph', () => {
    render(
      <AiMessageContent
        text={`[Q] I found 2 options for 2026-05-14:
(1) Dr. Tran Thi Bich — 07:30 ← recommended
(2) Dr. Vo Thanh Tung — 08:00
I'd recommend option (1). Which would you prefer, or shall I go with (1)?`}
      />
    )

    expect(screen.getByText('I found 2 options for 2026-05-14:')).toBeInTheDocument()
    expect(screen.getByLabelText('Available appointment options')).toBeInTheDocument()
    expect(screen.getByText('Dr. Tran Thi Bich')).toBeInTheDocument()
    expect(screen.getByText('07:30')).toBeInTheDocument()
    expect(screen.getByText('Dr. Vo Thanh Tung')).toBeInTheDocument()
    expect(screen.getByText('08:00')).toBeInTheDocument()
    expect(screen.getByText('Recommended')).toBeInTheDocument()
    expect(screen.getByText(/Which would you prefer/)).toBeInTheDocument()
  })
})
