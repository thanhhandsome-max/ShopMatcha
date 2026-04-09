export type AuthUser = {
  id: string;
  email: string;
  name?: string | null;
  role?: "CUSTOMER" | "ADMIN";
};

export type Session = {
  user: AuthUser;
};
