export type UserRole = 'Admin' | 'Member';

const ROLE_VALUES: UserRole[] = ['Admin', 'Member'];

export function normalizeUserRole(role: unknown): UserRole | null {
  if (typeof role !== 'string') {
    return null;
  }

  return ROLE_VALUES.includes(role as UserRole) ? (role as UserRole) : null;
}

export function getStoredUserRole(): UserRole | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const storedRole = normalizeUserRole(localStorage.getItem('role'));
  if (storedRole) {
    return storedRole;
  }

  const token = localStorage.getItem('token');
  if (!token) {
    return null;
  }

  try {
    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) {
      return null;
    }

    const payload = JSON.parse(atob(tokenParts[1]));
    return normalizeUserRole(payload.role);
  } catch {
    return null;
  }
}

export function getStoredUserName(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const storedName = localStorage.getItem('user_name');
  if (storedName && storedName.trim()) {
    return storedName.trim();
  }

  const token = localStorage.getItem('token');
  if (!token) {
    return null;
  }

  try {
    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) {
      return null;
    }

    const payload = JSON.parse(atob(tokenParts[1]));
    if (typeof payload.name === 'string' && payload.name.trim()) {
      return payload.name.trim();
    }
  } catch {
    return null;
  }

  return null;
}
