export type UserRole = "CUSTOMER" | "STAFF" | "ADMIN";
export type AccountRecord = {
  id: string;
  username: string;
  passwordHash: string;
  role: UserRole;
  userId?: string | null; // makh hoac manv
};

export type CustomerRecord = {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
};

export type StaffRecord = {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
};

export type AuthUser = {
  accountId: string;
  role: UserRole;
  profileId: string;
  email: string;
  name: string;
};

export type Session = {
  user: AuthUser;
};