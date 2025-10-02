import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { SiweMessage } from 'siwe';

console.log('Iniciando auth.ts...');

const router = express.Router();
const messages = new Map<string, MessageData>(); // Almacén temporal de mensajes SIWE para cada usuario tipo diccionario 
// con clave: nonce y valor: MessageData

// Interfaces para tipado
interface MessageData {
  siwe: SiweMessage;
  timestamp: number;
  address: string;
}

interface MessageRequestBody {
  address: string;
}

interface SignInRequestBody {
  signature: string;
  nonce: string;
  message: string;
}

// Almacén temporal de mensajes SIWE, guardamos para las validaciones por cada usuario
// mensaje es Es un texto especial que el backend crea y envía al frontend. Se genera, se guarda temporalmente, y se valida para asegurar que el login sea seguro y único.
//  El usuario debe firmar ese mensaje con su wallet (MetaMask).
// La firma prueba que el usuario realmente controla esa dirección de wallet.

//   Generar mensaje SIWE, osea el mensaje que el usuario debe firmar con su wallet 
// req tiene los datos que envió el frontend (por ejemplo, la dirección)
  // res envía la respuesta al frontend (por ejemplo, el mensaje SIWE)
router.post('/message', async (req: Request<{}, {}, MessageRequestBody>, res: Response) => {
  try {
    const { address } = req.body;
    
    if (!address) {
      return res.status(400).json({ error: 'Dirección requerida' });
    }

    // Generar nonce único numero random para desafiar la firma
    const nonce: string = Math.random().toString(36).substring(2, 15);
    
    // Crear mensaje SIWE estándar
    const siweMessage = new SiweMessage({
      domain: 'localhost:5173',
      address: address,
      statement: 'Iniciar sesión en Faucet dApp',
      uri: 'http://localhost:5173',
      version: '1',
      chainId: 11155111, // Sepolia
      nonce: nonce,
      issuedAt: new Date().toISOString(),
    });

    // Guardar el objeto SIWE
    messages.set(nonce, {
      siwe: siweMessage,
      timestamp: Date.now(),
      address: address
    });

    // Responder con el mensaje para firmar
    res.json({
      message: siweMessage.prepareMessage(),
      nonce: nonce
    });

  } catch (error) {
    console.error('Error generando mensaje SIWE:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ✅ POST /auth/signin - Validar firma y generar JWT
router.post('/signin', async (req: Request<{}, {}, SignInRequestBody>, res: Response) => {
  try {
    const { signature, nonce } = req.body;

    if (!signature || !nonce) {
      return res.status(400).json({ error: 'Firma y nonce requeridos' });
    }

    // 1) Buscar el mensaje guardado por nonce
    const stored = messages.get(nonce);
    if (!stored) {
      return res.status(400).json({ error: 'Mensaje no encontrado o expirado' });
    }

    // 2) Verificar expiración (5 min)
    const fiveMinutes = 5 * 60 * 1000;
    if (Date.now() - stored.timestamp > fiveMinutes) {
      messages.delete(nonce);
      return res.status(400).json({ error: 'Mensaje expirado' });
    }

    // 3) Usar el objeto SIWE original guardado (¡no reconstruir desde string!)
    const siwe = stored.siwe;

    // (Opcional pero recomendado) reforzar campos esperados
    // por ejemplo, dominio del frontend:
    // const verificationFields = { domain: 'localhost:5173', nonce };
    // const { success } = await siwe.verify({ signature, verificationFields });

    const { success } = await siwe.verify({ signature });
    if (!success) {
      return res.status(400).json({ error: 'Firma inválida' });
    }

    // 4) Anti-replay: chequear que el nonce coincida
    if (siwe.nonce !== nonce) {
      return res.status(400).json({ error: 'Nonce inválido' });
    }

    // 5) Limpiar el nonce usado
    messages.delete(nonce);

    // 6) Generar JWT
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET no configurado');
    }
    const token = jwt.sign(
      {
        address: stored.address,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 60 * 60, // 1 hora
      },
      process.env.JWT_SECRET
    );

    // 7) Respuesta
    res.json({
      token,
      address: stored.address,
      message: 'Autenticación exitosa',
    });
  } catch (error) {
    console.error('Error en signin:', error);
    res.status(500).json({ error: 'Error validando firma' });
  }
});

// Cleanup de mensajes expirados
setInterval(() => {
  const tenMinutes = 10 * 60 * 1000;
  const now = Date.now();
  
  for (const [nonce, data] of messages.entries()) {
    if (now - data.timestamp > tenMinutes) {
      messages.delete(nonce);
    }
  }
}, 10 * 60 * 1000);

export default router;