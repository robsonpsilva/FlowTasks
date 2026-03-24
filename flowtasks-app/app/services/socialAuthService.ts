import pool from '@/app/lib/db';

export const socialAuthService = {
  /**
   * Upsert Logic: If the user exists (matched by provider_id + external_uid), 
   * it updates the name and email. Otherwise, it creates a new record.
   */
  async findOrCreateUser(data: {
    name: string;
    email: string;
    provider_id: number;
    external_uid: string;
  }) {
    try {
      const query = `
        INSERT INTO public.users (name, email, provider_id, external_uid)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (provider_id, external_uid) 
        DO UPDATE SET 
          name = EXCLUDED.name,
          email = EXCLUDED.email,
          updated_at = CURRENT_TIMESTAMP
        RETURNING id, name, email;
      `;
      
      const values = [data.name, data.email, data.provider_id, data.external_uid];
      const result = await pool.query(query, values);

      const roleAssignmentQuery = `
        INSERT INTO public.roles_users (users_id, roles_id)
        VALUES ($1, 1)
        ON CONFLICT (users_id, roles_id) DO NOTHING;
      `;
  
      await pool.query(roleAssignmentQuery, [result.rows[0].id]);
      
      return result.rows[0];
    } catch (error) {
      console.error('Error in socialAuthService.findOrCreateUser:', error);
      throw new Error('Failed to synchronize social user data.');
    }
  }
};