import { Request, Response } from 'express';
import pool from '../db';

// Listar todos os usuários (Read)
export const getUsers = async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM "user" ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching users' });
  }
};

// Obter usuário por ID (Read by ID)
export const getUserById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM "user" WHERE id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching user' });
  }
};

// Criar novo usuário (Create)
export const createUser = async (req: Request, res: Response) => {
  const { name, email, external_id, department_id } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO "user" (name, email, external_id, department_id, is_active, last_login_at) VALUES ($1, $2, $3, $4, true, NOW()) RETURNING *',
      [name, email, external_id, department_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error creating user' });
  }
};

// Atualizar informações (Update)
export const updateUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, department_id, is_active } = req.body;
  try {
    const result = await pool.query(
      'UPDATE "user" SET name = $1, department_id = $2, is_active = $3 WHERE id = $4 RETURNING *',
      [name, department_id, is_active, id]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: 'User not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error updating user' });
  }
};

// Deletar usuário (Delete)
export const deleteUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM "user" WHERE id = $1', [id]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'User not found' });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: 'Error deleting user' });
  }
};