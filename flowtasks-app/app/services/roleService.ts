import pool from '@/app/lib/db';

export interface RoleInput {
  name: string;
  description?: string;
}

export const roleService = {
  async findAll() {
    const result = await pool.query('SELECT * FROM public.roles ORDER BY id ASC');
    return result.rows;
  },

  async findById(id: string) {
    const result = await pool.query('SELECT * FROM public.roles WHERE id = $1', [id]);
    return result.rows[0] || null;
  },

  async create(data: RoleInput) {
    const query = `
      INSERT INTO public.roles (name, description) 
      VALUES ($1, $2) 
      RETURNING *
    `;
    const result = await pool.query(query, [data.name, data.description]);
    return result.rows[0];
  },

  async update(id: string, data: Partial<RoleInput>) {
    const query = `
      UPDATE public.roles 
      SET 
        name = COALESCE($1, name), 
        description = COALESCE($2, description)
      WHERE id = $3
      RETURNING *
    `;
    const result = await pool.query(query, [data.name, data.description, id]);
    return result.rows[0] || null;
  },

  async delete(id: string) {
    const result = await pool.query('DELETE FROM public.roles WHERE id = $1', [id]);
    return (result.rowCount ?? 0) > 0;
  }
};