// In-memory store for one-time app login tokens
// Token expires after 2 minutes
const tokenStore = new Map<string, { userData: object; expiresAt: number }>();

export function storeAppToken(token: string, userData: object) {
  tokenStore.set(token, {
    userData,
    expiresAt: Date.now() + 2 * 60 * 1000, // 2 minutes
  });
}

export function consumeAppToken(token: string): object | null {
  const entry = tokenStore.get(token);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    tokenStore.delete(token);
    return null;
  }
  tokenStore.delete(token); // one-time use
  return entry.userData;
}
