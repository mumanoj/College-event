export type UserRole = "student" | "organizer" | "admin";

export interface User {
  _id?: string;
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string | null;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserSession {
  user: {
    id: string;
    email: string;
    name: string;
    image?: string | null;
    role: UserRole;
  };
  session: {
    id: string;
    userId: string;
    expiresAt: Date;
    token: string;
  };
}
