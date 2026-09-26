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

function formatDoctorName(raw: string): string {
  const clean = raw.trim();
  if (!clean) return 'Dr. Clinician';
  if (clean.toLowerCase() === 'guest') return 'Guest';

  // Capitalise each word appropriately
  const formatted = clean.split(/\s+/).map(w => {
    if (!w) return '';
    if (w.toLowerCase() === 'dr' || w.toLowerCase() === 'dr.') return 'Dr.';
    return w.charAt(0).toUpperCase() + w.slice(1);
  }).join(' ');

  if (!formatted.toLowerCase().startsWith('dr.')) {
    return `Dr. ${formatted}`;
  }
  return formatted;
}

export function loginUser(username: string, role?: string, fullName?: string): AuthUser {
  const inputName = (fullName && fullName.trim()) ? fullName.trim() : username.trim();
  if (inputName.toLowerCase() === 'guest' || !inputName) {
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(DEFAULT_CLINICIAN));
    localStorage.setItem(AUTH_STATUS_KEY, 'true');
    return DEFAULT_CLINICIAN;
  }

  const cleanId = `user_${inputName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
  const displayName = formatDoctorName(inputName);

  const user: AuthUser = {
    id: cleanId,
    name: displayName,
    role: (role && role.trim()) ? role.trim() : 'Attending Clinician',
    department: 'Division of Pulmonary & Critical Care Imaging',
  };

  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  localStorage.setItem(AUTH_STATUS_KEY, 'true');
  return user;
}

export function loginWithGoogle(name: string, email: string, avatarUrl?: string): AuthUser {
  const cleanId = `google_${(email || name).toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
  const displayName = formatDoctorName(name.trim() || 'Google Clinician');

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
