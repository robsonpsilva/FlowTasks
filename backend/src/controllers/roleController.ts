import { Request, Response } from 'express';
import pool from '../db.ts';

/**
 * Retrieves all roles from the database
 */
export const getRoles = async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM public.roles ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching roles' });
  }
};

/**
 * Creates a new role
 */
export const createRole = async (req: Request, res: Response) => {
  const { name, description } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO public.roles (name, description) VALUES ($1, $2) RETURNING *',
      [name, description]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error creating role' });
  }
};

/**
 * Deletes a role by ID
 */
export const deleteRole = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM roles WHERE id = $1', [id]);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: 'Error deleting role' });
  }
};

/**
 * Updates an existing role's name and description
 */
export const updateRole = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, description } = req.body;
  try {
    const result = await pool.query(
      'UPDATE public.roles SET name = $1, description = $2 WHERE id = $3 RETURNING *',
      [name, description, id]
    );
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Role not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error updating role' });
  }
};

/**
 * Assigns a specific role to a user in the roles_users bridge table
 * This resolves the "has no exported member 'assignRoleToUser'" error.
 */
export const assignRoleToUser = async (req: Request, res: Response) => {
  const { users_id, roles_id } = req.body;
  try {
    await pool.query(
      'INSERT INTO public.roles_users (users_id, roles_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [users_id, roles_id]
    );
    res.status(200).json({ message: 'Role assigned successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Error assigning role to user' });
  }
};