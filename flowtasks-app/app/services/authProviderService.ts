import pool from '@/app/lib/db';

export const authProviderService = {
  async findAll() {
    const result = await pool.query('SELECT * FROM public.auth_providers ORDER BY name ASC');
    return result.rows;
  },

  async findById(id: string) {
    const result = await pool.query('SELECT * FROM public.auth_providers WHERE id = $1', [id]);
    return result.rows[0] || null;
  },

  async create(name: string) {
    const query = 'INSERT INTO public.auth_providers (name) VALUES ($1) RETURNING *';
    const result = await pool.query(query, [name]);
    return result.rows[0];
  },

  async update(id: string, name: string) {
    const query = 'UPDATE public.auth_providers SET name = $1 WHERE id = $2 RETURNING *';
    const result = await pool.query(query, [name, id]);
    return result.rows[0] || null;
  },

  async delete(id: string) {
    const result = await pool.query('DELETE FROM public.auth_providers WHERE id = $1', [id]);
    return (result.rowCount ?? 0) > 0;
  }
};