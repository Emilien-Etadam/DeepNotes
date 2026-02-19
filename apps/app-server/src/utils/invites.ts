import { addDays } from '@stdlib/misc';
import { nanoid } from 'nanoid';
import { getRedis } from 'src/data/redis';

const ADMIN_USER_ID_KEY = 'admin_user_id';
const INVITE_PREFIX = 'invite:';
const INVITE_TTL_DAYS = 7;

export interface StoredInvite {
  email: string;
  createdByUserId: string;
  expiresAt: string;
}

export async function getAdminUserId(): Promise<string | null> {
  const redis = getRedis();
  const id = await redis.get(ADMIN_USER_ID_KEY);
  return id ?? null;
}

export async function setAdminUserId(userId: string): Promise<void> {
  await getRedis().set(ADMIN_USER_ID_KEY, userId);
}

export async function isAdmin(userId: string): Promise<boolean> {
  const adminId = await getAdminUserId();
  return adminId === userId;
}

export async function createInvite(input: {
  email: string;
  createdByUserId: string;
}): Promise<{ token: string; expiresAt: Date }> {
  const token = nanoid();
  const expiresAt = addDays(new Date(), INVITE_TTL_DAYS);
  const stored: StoredInvite = {
    email: input.email,
    createdByUserId: input.createdByUserId,
    expiresAt: expiresAt.toISOString(),
  };
  const key = INVITE_PREFIX + token;
  await getRedis().setex(
    key,
    Math.floor(INVITE_TTL_DAYS * 24 * 60 * 60),
    JSON.stringify(stored),
  );
  return { token, expiresAt };
}

export async function getInvite(token: string): Promise<StoredInvite | null> {
  const key = INVITE_PREFIX + token;
  const raw = await getRedis().get(key);
  if (raw == null) return null;
  try {
    const parsed = JSON.parse(raw) as StoredInvite;
    if (typeof parsed.email !== 'string' || typeof parsed.expiresAt !== 'string') {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export async function consumeInvite(token: string): Promise<StoredInvite | null> {
  const invite = await getInvite(token);
  if (invite == null) return null;
  const expiresAt = new Date(invite.expiresAt);
  if (expiresAt <= new Date()) return null;
  await getRedis().del(INVITE_PREFIX + token);
  return invite;
}
