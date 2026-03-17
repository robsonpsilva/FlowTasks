import express from 'express';
import pool from '../db.js';

/**
 * Retrieves all tasks.
 * @route GET /api/tasks
 */
export const getTasks = async (req: express.Request, res: express.Response) => {
  try {
    const result = await pool.query('SELECT * FROM public.tasks WHERE is_active = true ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching tasks' });
  }
};

/**
 * Creates a new task.
 * @route POST /api/tasks
 */
export const createTask = async (req: express.Request, res: express.Response) => {
  const { title, description, category_id, status, priority } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO public.tasks 
      (title, description, category_id, status, priority, created_at, updated_at) 
      VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) RETURNING *`,
      [title, description, category_id, status || 'OPEN', priority || 'MEDIUM']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error creating task' });
  }
};

/**
 * Updates an existing task.
 * @route PUT /api/tasks/:id
 */
export const updateTask = async (req: express.Request, res: express.Response) => {
  const { id } = req.params;
  const { title, description, category_id, status, priority, is_active } = req.body;
  try {
    const result = await pool.query(
      `UPDATE public.tasks 
       SET title = $1, description = $2, category_id = $3, status = $4, priority = $5, is_active = $6, updated_at = NOW() 
       WHERE id = $7 RETURNING *`,
      [title, description, category_id, status, priority, is_active, id]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: 'Task not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error updating task' });
  }
};

/**
 * Deletes a task (Hard delete).
 * @route DELETE /api/tasks/:id
 */
export const deleteTask = async (req: express.Request, res: express.Response) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM public.tasks WHERE id = $1', [id]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Task not found' });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: 'Error deleting task' });
  }
};