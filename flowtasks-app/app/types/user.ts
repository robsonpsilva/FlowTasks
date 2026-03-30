export interface UserCreateInput {
  name: string;
  email: string;
  password: string;
  provider_id?: string; // O '?' indica que é opcional
}

export interface UserResource {
  id: number;
  name: string;
  email: string;
  created_at: Date;
}