import { db, usersTable } from '@workspace/db';
import { eq } from 'drizzle-orm';
import { Router, type IRouter, type Request, type Response } from 'express';
import { hashPassword, signToken, verifyPassword } from '../lib/auth';

const router: IRouter = Router();

/* ─── Register ─────────────────────────────────────────────────────────── */
router.post('/auth/register', async (req: Request, res: Response) => {
  const { firstName, lastName, email, password } = req.body as {
    firstName?: string;
    lastName?: string;
    email?: string;
    password?: string;
  };

  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required.' });
    return;
  }
  if (password.length < 6) {
    res.status(400).json({ error: 'Password must be at least 6 characters.' });
    return;
  }

  const existing = await db
    .select({ id: usersTable.id })
    .from(usersTable)
    .where(eq(usersTable.email, email.toLowerCase().trim()))
    .limit(1);

  if (existing.length > 0) {
    res.status(409).json({ error: 'An account with that email already exists.' });
    return;
  }

  const passwordHash = await hashPassword(password);
  const [user] = await db
    .insert(usersTable)
    .values({
      firstName: firstName?.trim() || null,
      lastName: lastName?.trim() || null,
      email: email.toLowerCase().trim(),
      passwordHash,
    })
    .returning();

  const token = signToken({ userId: user.id, email: user.email });

  res.status(201).json({
    token,
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    },
  });
});

/* ─── Login ─────────────────────────────────────────────────────────────── */
router.post('/auth/login', async (req: Request, res: Response) => {
  const { email, password } = req.body as {
    email?: string;
    password?: string;
  };

  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required.' });
    return;
  }

  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email.toLowerCase().trim()))
    .limit(1);

  if (!user) {
    res.status(401).json({ error: 'Invalid email or password.' });
    return;
  }

  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) {
    res.status(401).json({ error: 'Invalid email or password.' });
    return;
  }

  const token = signToken({ userId: user.id, email: user.email });

  res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    },
  });
});

/* ─── Me ────────────────────────────────────────────────────────────────── */
router.get('/auth/me', async (req: Request, res: Response) => {
  if (!req.userId) {
    res.json({ user: null });
    return;
  }

  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, req.userId))
    .limit(1);

  if (!user) {
    res.json({ user: null });
    return;
  }

  res.json({
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    },
  });
});

export default router;
