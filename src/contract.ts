export const FAUCET_ADDRESS = '0x3e2117c19a921507ead57494bbf29032f33c7412' as const

export const FAUCET_ABI = [
  // Faucet
  { type: 'function', name: 'claimTokens', stateMutability: 'nonpayable', inputs: [], outputs: [] },
  { type: 'function', name: 'hasAddressClaimed', stateMutability: 'view', inputs: [{ name: 'addr', type: 'address' }], outputs: [{ type: 'bool' }] },
  { type: 'function', name: 'getFaucetUsers', stateMutability: 'view', inputs: [], outputs: [{ type: 'address[]' }] },
  { type: 'function', name: 'getFaucetAmount', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] },
  // ERC20 básicos
  { type: 'function', name: 'balanceOf', stateMutability: 'view', inputs: [{ name: 'owner', type: 'address' }], outputs: [{ type: 'uint256' }] },
  { type: 'function', name: 'decimals', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint8' }] },
  { type: 'function', name: 'symbol', stateMutability: 'view', inputs: [], outputs: [{ type: 'string' }] },
  { type: 'function', name: 'name', stateMutability: 'view', inputs: [], outputs: [{ type: 'string' }] },
] as const
