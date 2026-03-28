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
        SELECT 
          u.id, 
          u.name, 
          u.email, 
          u.external_uid,
          u.password_hash as password,
          u.created_at,
          u.updated_at,
          r.name as role_name,
          r.id as roleId,
          ap.name as auth_provider_name
        FROM public.users u
        LEFT JOIN public.roles_users ur ON u.id = ur.users_id
        LEFT JOIN public.roles r ON ur.roles_id = r.id
        LEFT JOIN public.auth_providers ap ON u.provider_id = ap.id
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
  async create(userData: UserCreateInput & { role_id?: string }) {
    const client = await pool.connect();
    try {
      const { name, email, password, provider_id, role_id } = userData;
      
      const saltRounds = 12;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      await client.query('BEGIN');

      // 1. Inserir o usuário
      const userQuery = `
        INSERT INTO public.users (name, email, password_hash, provider_id, created_at) 
        VALUES ($1, $2, $3, $4, NOW()) 
        RETURNING id, name, email, created_at
      `;
      const userResult = await client.query(userQuery, [name, email, passwordHash, provider_id]);
      const newUser = userResult.rows[0];

      // 2. Vincular a Role (se enviada)
      if (role_id) {
        const roleQuery = `
          INSERT INTO public.roles_users (users_id, roles_id)
          VALUES ($1, $2)
        `;
        await client.query(roleQuery, [newUser.id, role_id]);
      }

      await client.query('COMMIT');
      return newUser;
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error at userService.create:', error);
      throw new Error('Database operation failed while creating user with role.');
    } finally {
      client.release();
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
          u.image,
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

   async findProfilebyEmail(email: string) {
    try {
      const query = `
        SELECT 
          u.id, 
          u.name, 
          u.email, 
          u.image,
          u.external_uid,
          u.password_hash as password,
          r.name as role_name,
          r.id as roleId,
          ap.name as auth_provider_name
        FROM public.users u
        LEFT JOIN public.roles_users ur ON u.id = ur.users_id
        LEFT JOIN public.roles r ON ur.roles_id = r.id
        LEFT JOIN public.auth_providers ap ON u.provider_id = ap.id
        WHERE u.email = $1
      `;
      
      const result = await pool.query(query, [email]);
      
      if (result.rows.length === 0) return null;
      
      return result.rows[0];
    } catch (error) {
      console.error(`Error at userService.findProfilebyEmail for Email ${email}:`, error);
      throw new Error('Database operation failed while fetching enriched user profile.');
    }
  },
  /**
   * Updates an existing user's basic information.
   */
  async update(id: string, data: { name?: string; email?: string; password?: string; role_id?: string; image?: string }) {
    const client = await pool.connect();
    try {
      const { name, email, password, role_id, image } = data;
      await client.query('BEGIN');

      let passwordHash = null;
      if (password && password.trim().length > 0) {
        passwordHash = await bcrypt.hash(password, 12);
      }

      const userQuery = `
        UPDATE public.users 
        SET 
          name = COALESCE($1, name), 
          email = COALESCE($2, email),
          password_hash = COALESCE($3, password_hash),
          image = COALESCE($4, image), -- Parâmetro 4
          updated_at = NOW()
        WHERE id = $5 -- Corrigido para Parâmetro 5
        RETURNING id, name, email, image, updated_at
      `;
      // Agora os argumentos seguem a ordem: $1=name, $2=email, $3=passwordHash, $4=image, $5=id
      const userResult = await client.query(userQuery, [name, email, passwordHash, image, id]);

      if (userResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return null;
      }

      if (role_id) {
        await client.query('DELETE FROM public.roles_users WHERE users_id = $1', [id]);
        await client.query('INSERT INTO public.roles_users (users_id, roles_id) VALUES ($1, $2)', [id, role_id]);
      }

      await client.query('COMMIT');
      return userResult.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      console.error(`Error at userService.update for ID ${id}:`, error);
      throw new Error('Database operation failed while updating user and role.');
    } finally {
      client.release();
    }
  },

  /**
  /**
   * Deletes a user and their relationships (Atomic Operation).
   */
  async delete(id: string) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // 1. Remove da tabela de relacionamento primeiro (Resolve o erro 23503)
      await client.query('DELETE FROM public.roles_users WHERE users_id = $1', [id]);

      // 2. Remove o usuário
      const result = await client.query('DELETE FROM public.users WHERE id = $1', [id]);

      await client.query('COMMIT');
      return (result.rowCount ?? 0) > 0;
    } catch (error) {
      await client.query('ROLLBACK');
      console.error(`Error at userService.delete for ID ${id}:`, error);
      throw error;
    } finally {
      client.release();
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