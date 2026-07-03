import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'electrohub_super_secret_jwt_key_2025';

export interface AuthenticatedRequest extends Request {
  user?: { id: number; email: string; role: 'ADMIN' | 'USER' };
}

export const authMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { id: number; email: string; role: 'ADMIN' | 'USER' };
    req.user = { id: payload.id, email: payload.email, role: payload.role };
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};
