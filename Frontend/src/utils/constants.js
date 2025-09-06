export const BACKEND_API_URL = import.meta.env.VITE_BACKEND_API_URL;
export const GENAI_API_URL = import.meta.env.VITE_GEMINI_API_URL;
export const TEMP_SHARE_API_URL = import.meta.env.VITE_TEMP_SHARE_URL;

export const LOCAL_STORAGE_USERNAME_KEY = '__username__';
export const LOCAL_STORAGE_TOKEN_KEY = '__token__';
export const LOCAL_STORAGE_LOGIN_KEY = '__login__';
export const LOCAL_STORAGE_THEME_KEY = '__theme__';

export const SESSION_STORAGE_SHARELINKS_KEY = '__sharelinks__';
export const SESSION_STORAGE_FETCH_STATUS_KEY = '__fetchstatus__';
export const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY;
export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

export const USERNAME_REGEX = /^[a-zA-Z0-9_.-]{5,30}$/;
export const EMAIL_REGEX = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
export const PASSWORD_REGEX = /^.{8,}$/;