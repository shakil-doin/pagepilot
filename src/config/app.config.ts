// The only file allowed to read process.env. Everything else imports APP.
const required = (key: string): string => {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required env var: ${key}`);
  return value;
};

const optional = (key: string, fallback = ""): string => process.env[key] ?? fallback;

export const APP = {
  databaseUrl: required("DATABASE_URL"),
  url: optional("APP_URL", "http://localhost:3000"),
  secret: required("APP_SECRET"),
  authSecret: required("AUTH_SECRET"),
  revalidateKey: optional("REVALIDATE_KEY"),

  seed: {
    superadminEmail: optional("SEED_SUPERADMIN_EMAIL", "admin@example.com"),
    superadminPassword: optional("SEED_SUPERADMIN_PASSWORD"),
  },

  storage: {
    // ImageKit media storage; falls back to local disk under public/uploads
    // when unconfigured (development only).
    imagekitPublicKey: optional("IMAGEKIT_PUBLIC_KEY"),
    imagekitPrivateKey: optional("IMAGEKIT_PRIVATE_KEY"),
    imagekitUrlEndpoint: optional("IMAGEKIT_URL_ENDPOINT"),
    imagekitFolder: optional("IMAGEKIT_FOLDER", "/pagepilot"),
    get isConfigured() {
      return Boolean(this.imagekitPublicKey && this.imagekitPrivateKey && this.imagekitUrlEndpoint);
    },
  },

  smtp: {
    host: optional("SMTP_HOST"),
    port: Number(optional("SMTP_PORT", "587")),
    user: optional("SMTP_USER"),
    pass: optional("SMTP_PASS"),
    from: optional("SMTP_FROM"),
  },

  oauth: {
    googleClientId: optional("GOOGLE_CLIENT_ID"),
    googleClientSecret: optional("GOOGLE_CLIENT_SECRET"),
  },
} as const;
