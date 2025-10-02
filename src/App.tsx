// src/App.tsx
import ConnectButton from './components/conectButton'
import NetworkGate from './components/PuertaNetwork'
import FaucetInfo from './components/faucetInfo'
import ReclamarToken from './components/reclamarToken'

export default function App() {
  const isAuthenticated = !!localStorage.getItem('jwt');
  return (
    <div style={{ padding: 20, fontFamily: 'sans-serif', maxWidth: 720, margin: '40px auto' }}>
      <h1>Mi Faucet dApp</h1>
      <ConnectButton />

      <NetworkGate>
        {isAuthenticated ? (
          <>
            <FaucetInfo />
            <ReclamarToken />
          </>
        ) : (
          <p style={{marginTop: 32}}>Primero autentícate con SIWE para ver la información y reclamar tokens.</p>
        )}
      </NetworkGate>
    </div>
  )
}
