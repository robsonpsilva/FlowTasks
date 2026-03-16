import express from 'express';
import bcrypt from 'bcrypt';
import pool from '../db.js';

/**
 * Retrieves all users from the database.
 * @route GET /api/users
 */
export const getUsers = async (req: express.Request, res: express.Response) => {
  try {
    const result = await pool.query('SELECT * FROM public.users ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching users' });
  }
};

/**
 * Retrieves a specific user by their ID.
 * @route GET /api/users/:id
 */
export const getUserById = async (req: express.Request, res: express.Response) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM public.users WHERE id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching user' });
  }
};

/**
 * Creates a new user with a hashed password.
 * @route POST /api/users
 */
export const createUser = async (req: express.Request, res: express.Response) => {
  // Receive plaintext password and other data from the request body
  const { name, email, password, provider_id, external_id } = req.body;

  if (!password) {
    return res.status(400).json({ error: 'Password is required' });
  }

  try {
    // Generate the password hash (cost factor of 12)
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Insert the HASH, never the original password
    const result = await pool.query(
      `INSERT INTO public.users 
      (name, email, password_hash, provider_id, external_uid, created_at, updated_at) 
      VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) RETURNING *`,
      [name, email, passwordHash, provider_id, external_id]
    );

    // Remove the hash from the response for enhanced security
    const { password_hash, ...userWithoutHash } = result.rows[0];
    res.status(201).json(userWithoutHash);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error creating user' });
  }
};

/**
 * Updates existing user information.
 * @route PUT /api/users/:id
 */
export const updateUser = async (req: express.Request, res: express.Response) => {
  const { id } = req.params;
  const { name, email, password, provider_id, external_uid } = req.body;
  const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);
  try {
    const result = await pool.query(
      'UPDATE public.users SET name = $1, email = $2, password_hash = $3, provider_id = $4, external_uid = $5, updated_at = NOW() WHERE id = $6 RETURNING *',
      [name, email, passwordHash, provider_id, external_uid, id]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: 'User not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error updating user' });
  }
};

/**
 * Deletes a user from the system.
 * @route DELETE /api/users/:id
 */
export const deleteUser = async (req: express.Request, res: express.Response) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM public.users WHERE id = $1', [id]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'User not found' });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: 'Error deleting user' });
  }
};

/**
 * Retrieves a user with their associated roles.
 * @route GET /api/users/:id/profile
 */
export const getUserWithRole = async (req: express.Request, res: express.Response) => {
  const { id } = req.params;
  try {
    // JOIN para trazer o usuário e seu papel de uma só vez
    const query = `
      SELECT u.*, r.name as role_name, ap.name as provider_name
      FROM public.users u
      LEFT JOIN public.roles_users ur ON u.id = ur.users_id
      LEFT JOIN public.roles r ON ur.roles_id = r.id
      LEFT JOIN public.auth_providers ap ON u.provider_id = ap.id
      WHERE u.id = $1
    `;
    
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Remove informações sensíveis da resposta
    const { password_hash, ...userProfile } = result.rows[0];
    res.json(userProfile);
  } catch (err) {
    console.error('Error fetching user profile:', err);
    res.status(500).json({ error: 'Error fetching user profile' });
  }
};