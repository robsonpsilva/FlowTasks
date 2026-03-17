import pool from '../db.js';

/**
 * Service Layer for Tasks
 * Handles all business logic and database interactions.
 */
export const taskService = {
  /**
   * Retrieves all active tasks from the database.
   * Logic: Returns tasks where is_active is true, ordered by ID.
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

    // RULE 1: Title Complexity
    if (!title || title.trim().length < 10) {
      throw new Error('Title is too short. Please provide a more descriptive title (min 10 chars).');
    }

    // RULE 2: Status Lifecycle Enforcement
    if (status === 'COMPLETED') {
      throw new Error('A new task cannot be created with COMPLETED status.');
    }

    // RULE 3: Category Integrity Check
    if (category_id) {
      const categoryCheck = await pool.query('SELECT id FROM public.categories WHERE id = $1', [category_id]);
      if (categoryCheck.rowCount === 0) {
        throw new Error('The specified Category ID does not exist.');
      }
    }

    // RULE 4: Smart Priority Escalation
    let finalPriority = priority || 'MEDIUM';
    const urgentKeywords = ['URGENT', 'CRITICAL', 'BLOCKER', 'IMMEDIATE'];
    if (description && urgentKeywords.some(key => description.toUpperCase().includes(key))) {
      finalPriority = 'HIGH';
    }

    // Final Persistence
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
   */
  async update(id: string, updateData: any) {
    const { title, description, category_id, status, priority, is_active } = updateData;

    // 1. Fetch current task state to validate rules
    const currentTaskResult = await pool.query('SELECT * FROM public.tasks WHERE id = $1', [id]);
    if (currentTaskResult.rowCount === 0) {
      throw new Error('Task not found.');
    }
    const currentTask = currentTaskResult.rows[0];

    // RULE 5: Archived Protection
    if (currentTask.is_active === false && is_active !== true) {
      throw new Error('Cannot update an archived task. Please reactivate it first.');
    }

    // RULE 6: Immutability of Completed Tasks
    if (currentTask.status === 'COMPLETED' && (title || category_id)) {
      throw new Error('Completed tasks cannot have their title or category modified.');
    }

    // RULE 7: Update Category Validation
    if (category_id) {
      const catCheck = await pool.query('SELECT id FROM public.categories WHERE id = $1', [category_id]);
      if (catCheck.rowCount === 0) {
        throw new Error('The specified Category ID does not exist.');
      }
    }

    // 2. Final Persistence with COALESCE
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
    const result = await pool.query(query, values);

    return result.rows[0];
  },

  /**
   * Business logic for deleting or archiving a task.
   */
  async delete(id: string) {
    const currentTaskResult = await pool.query('SELECT * FROM public.tasks WHERE id = $1', [id]);
    
    if (currentTaskResult.rowCount === 0) {
      throw new Error('Task not found.');
    }
    
    const currentTask = currentTaskResult.rows[0];

    // RULE 8: Completed Task Protection
    if (currentTask.status === 'COMPLETED') {
      throw new Error('Cannot delete a completed task. You may only archive it by setting is_active to false.');
    }

    // RULE 9: Soft Delete vs Hard Delete Logic
    if (currentTask.status === 'OPEN' && (!currentTask.description || currentTask.description.trim().length === 0)) {
      await pool.query('DELETE FROM public.tasks WHERE id = $1', [id]);
      return { id, action: 'HARD_DELETE', message: 'Task permanently removed.' };
    } else {
      await pool.query('UPDATE public.tasks SET is_active = false, updated_at = NOW() WHERE id = $1', [id]);
      return { id, action: 'SOFT_DELETE', message: 'Task archived successfully.' };
    }
  }
};