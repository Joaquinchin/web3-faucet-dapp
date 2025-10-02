import React, { useEffect, useState } from 'react'
import { useAccount } from 'wagmi'

export default function FaucetInfo() {
  const { address } = useAccount()
  const [loading, setLoading] = useState(false)
  const [info, setInfo] = useState<{
    hasClaimed?: boolean
    balance?: string
    users?: string[]
    faucetAmount?: string
  }>({})

  useEffect(() => {
    async function fetchInfo() {
      if (!address) return
      setLoading(true)
      const token = localStorage.getItem('jwt')
      try {
        const res = await fetch(`http://localhost:3001/faucet/status/${address}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        const data = await res.json()
        setInfo({
          hasClaimed: data.hasClaimed,
          balance: data.balance,
          users: data.users,
          faucetAmount: data.faucetAmount
        })
      } catch {
        setInfo({})
      }
      setLoading(false)
    }
    fetchInfo()
  }, [address])

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <section style={{ border: '1px solid #eaeaea', borderRadius: 8, padding: 16 }}>
        <h2>Información del token</h2>
        <p><strong>Monto del faucet por reclamo:</strong> {info.faucetAmount ?? '...'}</p>
        <p><strong>Tu balance:</strong> {info.balance ?? '...'}</p>
        <p><strong>Ya reclamaste:</strong> {info.hasClaimed === undefined ? '...' : info.hasClaimed ? 'Sí' : 'No'}</p>
      </section>

      <section style={{ border: '1px solid #eaeaea', borderRadius: 8, padding: 16 }}>
        <h2>Usuarios que interactuaron</h2>
        {Array.isArray(info.users) && info.users.length > 0 ? (
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            {info.users.map((u) => (
              <li key={u}><code>{u}</code></li>
            ))}
          </ul>
        ) : (
          <p>Aún no hay usuarios o cargando…</p>
        )}
      </section>
    </div>
  )
}