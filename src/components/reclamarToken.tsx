import React, { useState } from 'react'
import { useAccount } from 'wagmi'

export default function ReclamarToken() {
  const { address } = useAccount()
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ txHash?: string; error?: string; success?: boolean } | null>(null)
  const [hasClaimed, setHasClaimed] = useState<boolean | null>(null)

  // Consultar si ya reclamó tokens
  async function checkStatus() {
    const token = localStorage.getItem('jwt')
    if (!token || !address) return
    setLoading(true)
    try {
      const res = await fetch(`http://localhost:3001/faucet/status/${address}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await res.json()
      setHasClaimed(data.hasClaimed)
    } catch {
      setHasClaimed(null)
    }
    setLoading(false)
  }

  // Reclamar tokens usando el backend
  async function claim() {
    const token = localStorage.getItem('jwt')
    if (!token) {
      setResult({ error: 'No estás autenticado. Inicia sesión primero.' })
      return
    }
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch('http://localhost:3001/faucet/claim', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await res.json()
      if (data.success) {
        setResult({ txHash: data.txHash, success: true })
        setHasClaimed(true)
      } else {
        setResult({ error: data.error || 'Error al reclamar tokens.' })
      }
    } catch {
      setResult({ error: 'Error de red o backend.' })
    }
    setLoading(false)
  }

  // Consultar estado al montar el componente o cuando cambia la dirección
  // Así sabemos si el usuario ya reclamó
  React.useEffect(() => {
    if (address) checkStatus()
  }, [address])

  return (
    <section style={{ border: '1px solid #eaeaea', borderRadius: 8, padding: 16 }}>
      <h2>Reclamar tokens</h2>
      {/* Mostrar si ya reclamó */}
      {hasClaimed === true ? (
        <p>Esta dirección ya reclamó.</p>
      ) : (
        <button
          onClick={claim}
          disabled={loading || hasClaimed === null}
          style={{ padding: '10px 16px', borderRadius: 8, cursor: loading ? 'not-allowed' : 'pointer' }}
        >
          {loading ? 'Procesando…' : 'Reclamar'}
        </button>
      )}

      {/* Mostrar resultado de la transacción */}
      {result?.txHash && (
        <p style={{ marginTop: 8 }}>
          Tx:{' '}
          <a href={`https://sepolia.etherscan.io/tx/${result.txHash}`} target="_blank" rel="noreferrer">
            {result.txHash.slice(0, 10)}… ver en Etherscan
          </a>
        </p>
      )}
      {result?.error && <p style={{ color: 'crimson' }}>{result.error}</p>}
      {result?.success && <p style={{ color: 'green' }}>Reclamo confirmado.</p>}
    </section>
  )
}