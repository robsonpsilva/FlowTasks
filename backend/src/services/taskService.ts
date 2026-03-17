/**
 * @file taskService.ts
 * @description The "Brain" of the application. This service layer houses the core Business Logic
 * and enforces a rigorous logical flow for all task-related operations:
 * * 1. Existence Lookup: Verifies the entity in the database before any modification.
 * 2. Policy Enforcement: Prevents modification of 'COMPLETED' tasks to preserve audit trails.
 * 3. Smart Soft Delete (1:N Cascade): When a task is archived (is_active = false), the system 
 * automatically performs a "Logical Cascade" by setting end_date = NOW() on all associated 
 * schedules, effectively halting future recurrences while preserving history.
 * 4. Hybrid Deletion Strategy: 
 * - Physical DELETE (Hard): Applied only to empty, unstarted tasks (no digital waste).
 * - Logical ARCHIVE (Soft): Applied to tasks with progress/content to maintain data integrity.
 * 5. Automated Priority: Dynamically escalates priority based on description keywords.
 * * @module Services/TaskService
 */

import pool from '../db.js';

export const taskService = {
  /**
   * Retrieves all active tasks from the database.
   */
  async findAll() {
    const result = await pool.query(
      'SELECT * FROM public.tasks WHERE is_active = true ORDER BY id ASC'
    );
    return result.rows;
  },

  /**
   * Business logic for creating a task with proposed rules.
   */
  async create(taskData: any) {
    const { title, description, category_id, status, priority } = taskData;

    if (!title || title.trim().length < 10) {
      throw new Error('Title is too short. Please provide a more descriptive title (min 10 chars).');
    }

    if (status === 'COMPLETED') {
      throw new Error('A new task cannot be created with COMPLETED status.');
    }

    if (category_id) {
      const categoryCheck = await pool.query('SELECT id FROM public.categories WHERE id = $1', [category_id]);
      if (categoryCheck.rowCount === 0) {
        throw new Error('The specified Category ID does not exist.');
      }
    }

    let finalPriority = priority || 'MEDIUM';
    const urgentKeywords = ['URGENT', 'CRITICAL', 'BLOCKER', 'IMMEDIATE'];
    if (description && urgentKeywords.some(key => description.toUpperCase().includes(key))) {
      finalPriority = 'HIGH';
    }

    const query = `
      INSERT INTO public.tasks 
      (title, description, category_id, status, priority, created_at, updated_at) 
      VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) RETURNING *`;
    
    const values = [title.trim(), description, category_id, status || 'OPEN', finalPriority];
    const result = await pool.query(query, values);

    return result.rows[0];
  },

  /**
   * Business logic for updating an existing task.
   * Includes logical cascade for schedules if the task is deactivated.
   */
  async update(id: string, updateData: any) {
    const { title, description, category_id, status, priority, is_active } = updateData;

    const currentTaskResult = await pool.query('SELECT * FROM public.tasks WHERE id = $1', [id]);
    if (currentTaskResult.rowCount === 0) throw new Error('Task not found.');
    const currentTask = currentTaskResult.rows[0];

    if (currentTask.is_active === false && is_active !== true) {
      throw new Error('Cannot update an archived task. Please reactivate it first.');
    }

    if (currentTask.status === 'COMPLETED' && (title || category_id)) {
      throw new Error('Completed tasks cannot have their title or category modified.');
    }

    // TRANSACTIONAL BLOCK: If deactivating the task, "expire" all its schedules.
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      if (is_active === false && currentTask.is_active === true) {
        await client.query('UPDATE public.task_schedules SET end_date = NOW() WHERE task_id = $1', [id]);
      }

      const query = `
        UPDATE public.tasks 
        SET title = COALESCE($1, title), 
            description = COALESCE($2, description), 
            category_id = COALESCE($3, category_id), 
            status = COALESCE($4, status), 
            priority = COALESCE($5, priority), 
            is_active = COALESCE($6, is_active), 
            updated_at = NOW() 
        WHERE id = $7 RETURNING *`;

      const values = [title, description, category_id, status, priority, is_active, id];
      const result = await client.query(query, values);
      
      await client.query('COMMIT');
      return result.rows[0];
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  },

  /**
   * Business logic for deleting or archiving a task.
   * Implements Hard Delete vs Soft Delete with 1:N Schedule Cascading.
   */
  async delete(id: string) {
    const currentTaskResult = await pool.query('SELECT * FROM public.tasks WHERE id = $1', [id]);
    if (currentTaskResult.rowCount === 0) throw new Error('Task not found.');
    const currentTask = currentTaskResult.rows[0];

    if (currentTask.status === 'COMPLETED') {
      throw new Error('Cannot delete a completed task. You may only archive it by setting is_active to false.');
    }

    // RULE: If task has content or was started, use SOFT DELETE with logical cascade
    if (currentTask.status !== 'OPEN' || (currentTask.description && currentTask.description.trim().length > 0)) {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        
        // Archiving the task
        await client.query('UPDATE public.tasks SET is_active = false, updated_at = NOW() WHERE id = $1', [id]);
        
        // Cascading the "termination" to all schedules
        await client.query('UPDATE public.task_schedules SET end_date = NOW() WHERE task_id = $1', [id]);
        
        await client.query('COMMIT');
        return { id, action: 'SOFT_DELETE_CASCADE', message: 'Task and all associated schedules archived.' };
      } catch (e) {
        await client.query('ROLLBACK');
        throw e;
      } finally {
        client.release();
      }
    } 

    // HARD DELETE: For empty/draft tasks, we delete physically.
    // The DB "ON DELETE CASCADE" constraint will handle task_schedules removal.
    await pool.query('DELETE FROM public.tasks WHERE id = $1', [id]);
    return { id, action: 'HARD_DELETE_CASCADE', message: 'Task and schedules permanently removed from database.' };
  }
};