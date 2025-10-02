

import { useAccount, useSignMessage, useConnect, useDisconnect } from 'wagmi';
import { useEffect, useState } from 'react';

export default function ConnectButton() {
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    // Si no hay window.ethereum o ningún conector está ready, mostrar advertencia
    const hasEthereum = typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';
    const anyReady = connectors.some((c) => c.ready);
    setShowWarning(!hasEthereum || !anyReady);
  }, [connectors]);

  async function handleLogin() {
    if (!address) return;
    try {
      // 1. Pedir mensaje SIWE al backend
      const res = await fetch('http://localhost:3001/auth/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address }),
      });
      if (!res.ok) throw new Error('No se pudo obtener el mensaje SIWE');
      const { message, nonce } = await res.json();

      // 2. Firmar el mensaje con MetaMask
      const signature = await signMessageAsync({ message });

      // 3. Enviar firma, nonce y mensaje SIWE al backend para obtener JWT
      const res2 = await fetch('http://localhost:3001/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ signature, nonce, message }),
      });
      if (!res2.ok) throw new Error('No se pudo autenticar');
      const { token } = await res2.json();

      // 4. Guardar JWT para usar en requests protegidos
      localStorage.setItem('jwt', token);
      alert('¡Autenticación exitosa!');
      window.location.reload(); // Recarga para que los componentes lean el nuevo JWT
    } catch (err) {
      alert('Error autenticando: ' + (err instanceof Error ? err.message : 'Desconocido'));
    }
  }

  return (
    <div>
      {isConnected ? (
        <>
          <button onClick={handleLogin} style={{ marginRight: 8 }}>Autenticar con SIWE</button>
          <button onClick={() => {
            disconnect();
            localStorage.removeItem('jwt');
            window.location.reload();
          }} style={{ background: '#222', color: '#fff' }}>
            Desconectar Wallet
          </button>
        </>
      ) : (
        <>
          {connectors.map((connector: any) => (
            <button
              key={connector.id}
              onClick={() => connect({ connector })}

              style={{ marginRight: 8 }}
            >
              {`Conectar Wallet (${connector.name})`}
            </button>
          ))}
        </>
      )}
    </div>
  );
}
//solo para commits