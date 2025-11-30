import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { ethers } from 'ethers';
import dotenv from 'dotenv';

console.log('Iniciando faucet.ts...');

dotenv.config();

const router = express.Router();

// Middleware para validar JWT
function authenticateJWT(req: Request, res: Response, next: () => void) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Token requerido' });

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    (req as any).address = (decoded as any).address;
    next();
  } catch {
    return res.status(403).json({ error: 'Token inválido o expirado' });
  }
}

// Instancia de ethers para interactuar con el contrato, conectamos con la blockchain de ETH 
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);
const contractAbi = [
  // Solo las funciones necesarias
  "function claimTokens() public",
  "function hasAddressClaimed(address) public view returns (bool)",
  "function getFaucetUsers() public view returns (address[])",
  "function getFaucetAmount() public view returns (uint256)",
  "function balanceOf(address) public view returns (uint256)"
];
const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS!, contractAbi, wallet);

// reclamamos los tokens
router.post('/claim', authenticateJWT, async (req: Request, res: Response) => {
  try {
    const address = (req as any).address;
    // Verifica si ya reclamó
    const hasClaimed = await contract.hasAddressClaimed(address);
    if (hasClaimed) {
      return res.status(400).json({ error: 'Ya reclamaste tokens.' });
    }
    // Ejecuta claimTokens
    const tx = await contract.claimTokens();
    await tx.wait();
    res.json({ txHash: tx.hash, success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al reclamar tokens.' });
  }
});

// consulta el estado del faucet para la dirección autenticada
router.get('/status/:address', authenticateJWT, async (req: Request, res: Response) => {
  try {
    const address = req.params.address;
    const hasClaimed = await contract.hasAddressClaimed(address);
    const balance = await contract.balanceOf(address);
    const users = await contract.getFaucetUsers();
    const faucetAmount = await contract.getFaucetAmount();
    res.json({
      hasClaimed,
      balance: balance.toString(),
      users,
      faucetAmount: faucetAmount.toString()
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al consultar estado.' });
  }
});

export default router;