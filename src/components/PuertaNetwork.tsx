import type { PropsWithChildren } from 'react'
import { useAccount, useChainId, useSwitchChain } from 'wagmi'
import { sepolia } from 'wagmi/chains'

export default function NetworkGate({ children }: PropsWithChildren) {
  const { isConnected } = useAccount()
  const chainId = useChainId()
  const { switchChain, isPending } = useSwitchChain()

  if (!isConnected) return <p>Conectá tu wallet para continuar.</p>

  const onWrongNetwork = chainId !== sepolia.id
  if (onWrongNetwork) {
    return (
      <div style={{ padding: 12, background: '#fff4e5', border: '1px solid #ffd59e', borderRadius: 8 }}>
        <p>Estás en la red equivocada. Cambiá a <strong>Sepolia</strong>.</p>
        <button
          onClick={() => switchChain({ chainId: sepolia.id })}
          disabled={isPending}
          style={{ padding: '8px 12px', borderRadius: 8, cursor: 'pointer' }}
        >
          {isPending ? 'Cambiando…' : 'Cambiar a Sepolia'}
        </button>
      </div>
    )
  }

  return <>{children}</>
}
