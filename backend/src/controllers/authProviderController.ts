import { Request, Response } from 'express';
import pool from '../db';

export const getProviders = async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM public.auth_providers ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
};

export const createProvider = async (req: Request, res: Response) => {
  const { name } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO public.auth_providers (name) VALUES ($1) RETURNING *',
      [name]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: 'Provider name already exists or invalid data' });
  }
};

export const updateProvider = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name } = req.body;
  try {
    const result = await pool.query(
      'UPDATE public.auth_providers SET name = $1 WHERE id = $2 RETURNING *',
      [name, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: 'Update failed' });
  }
};

export const deleteProvider = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM public.auth_providers WHERE id = $1', [id]);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: 'Delete failed' });
  }
};