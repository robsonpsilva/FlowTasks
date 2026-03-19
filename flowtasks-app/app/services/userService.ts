import pool from '@/app/lib/db';
import bcrypt from 'bcrypt';
import { UserCreateInput } from '@/app/types/user';

/**
 * Service responsible for user-related database operations (CRUD).
 */
export const userService = {
  /**
   * Retrieves all users from the system.
   * Useful for administrative views or selection lists.
   */
  async findAll() {
    try {
      // Selecionamos apenas campos necessários, omitindo o password_hash por segurança
      const query = `
        SELECT id, name, email, created_at, updated_at 
        FROM public.users 
        ORDER BY created_at DESC
      `;
      
      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      console.error('Error at userService.findAll:', error);
      throw new Error('Database operation failed while fetching all users.');
    }
  },

  /**
   * Creates a new user with a hashed password.
   */
  async create(userData: UserCreateInput) {
    try {
      const { name, email, password, provider_id } = userData;
      
      const saltRounds = 12;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      const query = `
        INSERT INTO public.users (name, email, password_hash, provider_id, created_at) 
        VALUES ($1, $2, $3, $4, NOW()) 
        RETURNING id, name, email, created_at
      `;

      const result = await pool.query(query, [name, email, passwordHash, provider_id]);
      
      return result.rows[0];
    } catch (error) {
      console.error('Error at userService.create:', error);
      throw new Error('Database operation failed while creating user.');
    }
  },

  /**
   * Retrieves a user's profile information, including their role.
   */
  async findProfile(id: string) {
    try {
      const query = `
        SELECT 
          u.id, 
          u.name, 
          u.email, 
          u.external_uid,
          r.name as role_name,
          ap.name as auth_provider_name
        FROM public.users u
        LEFT JOIN public.roles_users ur ON u.id = ur.users_id
        LEFT JOIN public.roles r ON ur.roles_id = r.id
        LEFT JOIN public.auth_providers ap ON u.provider_id = ap.id
        WHERE u.id = $1
      `;
      
      const result = await pool.query(query, [id]);
      
      if (result.rows.length === 0) return null;
      
      return result.rows[0];
    } catch (error) {
      console.error(`Error at userService.findProfile for ID ${id}:`, error);
      throw new Error('Database operation failed while fetching enriched user profile.');
    }
  },

  /**
   * Updates an existing user's basic information.
   */
  async update(id: string, data: { name?: string; email?: string }) {
    try {
      const { name, email } = data;
      const query = `
        UPDATE public.users 
        SET 
          name = COALESCE($1, name), 
          email = COALESCE($2, email),
          updated_at = NOW()
        WHERE id = $3
        RETURNING id, name, email, updated_at
      `;
      const result = await pool.query(query, [name, email, id]);
      if (result.rows.length === 0) return null;
      return result.rows[0];
    } catch (error) {
      console.error(`Error at userService.update for ID ${id}:`, error);
      throw new Error('Database operation failed while updating user.');
    }
  },

  /**
   * Deletes a user from the system.
   */
  async delete(id: string) {
    try {
      const query = 'DELETE FROM public.users WHERE id = $1';
      const result = await pool.query(query, [id]);
      return (result.rowCount ?? 0) > 0;
    } catch (error) {
      console.error(`Error at userService.delete for ID ${id}:`, error);
      throw new Error('Database operation failed while deleting user.');
    }
  },

  /**
   * Assigns a role to a user.
   * @param userId The ID of the user.
   * @param roleId The ID of the role to be assigned.
   */
  async assignRole(userId: string, roleId: string) {
    try {
      // Usamos ON CONFLICT para evitar erros caso o usuário já tenha essa role
      const query = `
        INSERT INTO public.roles_users (users_id, roles_id)
        VALUES ($1, $2)
        ON CONFLICT (users_id, roles_id) DO NOTHING
        RETURNING *
      `;
      
      const result = await pool.query(query, [userId, roleId]);
      return result.rows[0] || { message: 'Role already assigned' };
    } catch (error) {
      console.error(`Error assigning role ${roleId} to user ${userId}:`, error);
      throw new Error('Database operation failed while assigning role.');
    }
  }
};