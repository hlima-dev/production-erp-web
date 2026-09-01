import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { DataTable, type DataTableColumn } from '../src/components/DataTable'

interface Row {
  id: string
  name: string
}

const columns: DataTableColumn<Row>[] = [{ header: 'Nome', cell: (row) => row.name }]

describe('DataTable', () => {
  it('mostra o estado de carregamento', () => {
    render(<DataTable columns={columns} data={undefined} isLoading rowKey={(r) => r.id} />)
    expect(screen.getByText('Carregando...')).toBeInTheDocument()
  })

  it('mostra a mensagem vazia quando não há dados', () => {
    render(<DataTable columns={columns} data={[]} rowKey={(r) => r.id} emptyMessage="Nada por aqui." />)
    expect(screen.getByText('Nada por aqui.')).toBeInTheDocument()
  })

  it('renderiza uma linha por item', () => {
    const data: Row[] = [
      { id: '1', name: 'Frango com molho' },
      { id: '2', name: 'Queijo mussarela' },
    ]
    render(<DataTable columns={columns} data={data} rowKey={(r) => r.id} />)
    expect(screen.getByText('Frango com molho')).toBeInTheDocument()
    expect(screen.getByText('Queijo mussarela')).toBeInTheDocument()
  })
})
