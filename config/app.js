const DEFAULT_CLIENT_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:5174',
  'https://a10-fitforge-client.vercel.app',
  'https://b13-a10-frontend.vercel.app',
  'https://fitforge.vercel.app',
];

const splitList = (value = '') => value
  .split(',')
  .map((item) => item.trim().replace(/\/$/, ''))
  .filter(Boolean);

export const clientOrigins = Array.from(new Set([
  ...DEFAULT_CLIENT_ORIGINS,
  ...splitList(process.env.CLIENT_URL),
  ...splitList(process.env.CLIENT_ORIGIN),
  ...splitList(process.env.ALLOWED_ORIGINS),
]));

export const getClientUrl = () => {
  const configuredPrimary = splitList(process.env.PRIMARY_CLIENT_URL)[0];
  const configuredClient = splitList(process.env.CLIENT_URL)[0];
  return configuredPrimary || configuredClient || 'https://a10-fitforge-client.vercel.app';
};

export const isAllowedOrigin = (origin) => {
  if (!origin) return true;
  const normalized = origin.replace(/\/$/, '');
  return clientOrigins.includes(normalized)
    || /^https:\/\/a10-fitforge-client(?:-[a-z0-9-]+)?\.vercel\.app$/i.test(normalized);
};

const isProduction = process.env.NODE_ENV === 'production';

export const authCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export const clearAuthCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? 'none' : 'lax',
};
