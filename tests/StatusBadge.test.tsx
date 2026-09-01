import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StatusBadge } from '../src/components/StatusBadge'

describe('StatusBadge', () => {
  it('renderiza o label recebido', () => {
    render(<StatusBadge label="Em separação" tone="amber" />)
    expect(screen.getByText('Em separação')).toBeInTheDocument()
  })

  it('usa tone="neutral" por padrão quando não informado', () => {
    render(<StatusBadge label="Rascunho" />)
    expect(screen.getByText('Rascunho')).toHaveClass('bg-slate-100')
  })

  it('aplica a classe de cor certa por tone', () => {
    render(<StatusBadge label="Cancelado" tone="red" />)
    expect(screen.getByText('Cancelado')).toHaveClass('bg-red-100')
  })
})
