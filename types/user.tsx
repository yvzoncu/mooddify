export interface User {
  id: string;
  name: string;
  avatar: string;
  username: string;
  email?: string;
  joinDate: string;
  followers?: number;
  following?: number;
}
