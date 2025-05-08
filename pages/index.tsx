import { useState } from 'react'

export default function Home() {
  const [data, setData] = useState<any[]>([])
  const [file, setFile] = useState<File| null>(null)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return alert('Selecione um arquivo antes!')

    const form = new FormData()
    form.append('file', file)

    const res = await fetch('/api/upload', {
      method: 'POST',
      body: form
    })
    const json = await res.json()
    console.log(json)
    if (json.data) setData(json.data)
  }

  return (
    <div style={{ padding: 20, color: 'white', background: '#111' }}>
      <h1>Teste de Upload</h1>
      <form onSubmit={onSubmit}>
        <input
          type="file"
          accept=".xlsx"
          onChange={e => setFile(e.target.files?.[0] ?? null)}
        />
        <button type="submit">Enviar</button>
      </form>

      <pre style={{ marginTop: 20, whiteSpace: 'pre-wrap' }}>
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  )
}
