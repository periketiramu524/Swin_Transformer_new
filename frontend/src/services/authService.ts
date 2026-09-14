export interface AuthUser {
  id: string;
  name: string;
  role: string;
  department: string;
  email?: string;
  avatarUrl?: string;
}

const AUTH_USER_KEY = 'clini_auth_user';
const AUTH_STATUS_KEY = 'clini_is_authenticated';

export const DEFAULT_CLINICIAN: AuthUser = {
  id: 'guest',
  name: 'Guest',
  role: 'Attending Clinician',
  department: 'Thoracic Radiology & AI Clinical Intelligence',
  avatarUrl: '',
};

export function getAuthUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(AUTH_USER_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to parse auth user', e);
  }
  if (isAuthenticated()) {
    return DEFAULT_CLINICIAN;
  }
  return null;
}

export function isAuthenticated(): boolean {
  return localStorage.getItem(AUTH_STATUS_KEY) === 'true';
}

export function loginUser(username: string, role = 'Attending Radiologist'): AuthUser {
  const cleanName = username.trim();
  if (cleanName.toLowerCase() === 'guest' || !cleanName) {
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(DEFAULT_CLINICIAN));
    localStorage.setItem(AUTH_STATUS_KEY, 'true');
    return DEFAULT_CLINICIAN;
  }

  const cleanId = `user_${cleanName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
  let displayName = cleanName;
  if (!displayName.toLowerCase().startsWith('dr.')) {
    displayName = `Dr. ${displayName.charAt(0).toUpperCase() + displayName.slice(1)}`;
  }

  const user: AuthUser = {
    id: cleanId,
    name: displayName,
    role: role || DEFAULT_CLINICIAN.role,
    department: 'Division of Pulmonary & Critical Care Imaging',
  };

  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  localStorage.setItem(AUTH_STATUS_KEY, 'true');
  return user;
}

export function loginWithGoogle(name: string, email: string, avatarUrl?: string): AuthUser {
  const cleanId = `google_${(email || name).toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
  let displayName = name.trim() || 'Google Clinician';
  if (!displayName.toLowerCase().startsWith('dr.') && displayName.toLowerCase() !== 'guest') {
    displayName = `Dr. ${displayName}`;
  }

  const user: AuthUser = {
    id: cleanId,
    name: displayName,
    role: 'Consultant Radiologist',
    department: 'Thoracic Radiology & AI Clinical Intelligence',
    email: email.trim(),
    avatarUrl: avatarUrl || '',
  };

  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  localStorage.setItem(AUTH_STATUS_KEY, 'true');
  return user;
}

export function logoutUser(): void {
  localStorage.removeItem(AUTH_USER_KEY);
  localStorage.removeItem(AUTH_STATUS_KEY);
}
