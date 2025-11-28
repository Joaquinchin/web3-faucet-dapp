# Web3 Faucet dApp

Proyecto de faucet dApp con autenticación SIWE (Sign-In with Ethereum).

## Descripción

Este proyecto implementará un faucet token en la red Sepolia que permite a los usuarios:
- Conectar su wallet (MetaMask)
- Autenticarse usando SIWE
- Reclamar tokens desde el smart contract
- Ver información del faucet y usuarios que han interactuado

## Stack Tecnológico

### Frontend
- React + TypeScript
- Vite
- Wagmi (para integración Web3)
- Viem (cliente Ethereum)

### Backend
- Node.js + Express
- TypeScript
- ethers.js
- SIWE (Sign-In with Ethereum)
- JWT para sesiones

## Estructura del Proyecto

```
web3-faucet/
├── src/                    # Frontend React
│   ├── components/        # Componentes de la UI
│   ├── App.tsx           # Componente principal
│   └── ...
├── backend/               # Backend Node.js
│   └── src/
│       ├── server.ts     # Servidor Express
│       └── routes/       # Endpoints API
└── ...
```

## Requisitos

- Node.js 18+
- MetaMask o wallet compatible
- Cuenta con SepoliaETH para testing
