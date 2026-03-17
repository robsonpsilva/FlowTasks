import express from 'express';
import { taskService } from '../services/taskService.js';

/**
 * @file taskController.ts
 * @description The "Maestro" of the Task module. This controller is strictly decoupled from the 
 * database, operating exclusively within the HTTP Protocol context. Its responsibilities include:
 * * 1. Data Capture: Extracts parameters (e.g., :id) and request bodies (req.body) from the HTTP stream.
 * 2. Type Validation: Enforces strict type checking (e.g., ensuring IDs are single strings, not arrays) 
 * to prevent runtime errors and security vulnerabilities.
 * 3. Delegation: Hands over execution to the Service Layer (taskService) and "waits" for the result.
 * 4. Response Orchestration:
 * - On Success: Maps the service's output to the appropriate HTTP Success Status (200 OK, 201 Created).
 * - On Failure: Catches business logic exceptions and translates them into meaningful HTTP Client 
 * Errors (400 Bad Request, 404 Not Found) or Server Errors (500).
 * * @module Controllers/TaskController
 */

/**
 * Retrieves all active tasks using the Service Layer.
 * @route GET /api/tasks
 */
export const getTasks = async (req: express.Request, res: express.Response) => {
  try {
    // Controller now delegates the data fetching to the Service
    const tasks = await taskService.findAll();
    res.json(tasks);
  } catch (err) {
    console.error('Get Tasks Error:', err);
    res.status(500).json({ error: 'Error fetching tasks' });
  }
};

/**
 * Handles the creation of a new task via Service Layer rules.
 * @route POST /api/tasks
 */
export const createTask = async (req: express.Request, res: express.Response) => {
  try {
    const newTask = await taskService.create(req.body);
    res.status(201).json(newTask);
  } catch (err: any) {
    // 400 Bad Request for business rule violations
    if (err.message.includes('Title') || err.message.includes('Category') || err.message.includes('status')) {
      return res.status(400).json({ error: 'Validation Error', message: err.message });
    }
    
    console.error('Create Task Error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Handles the update of an existing task including business constraints.
 * @route PUT /api/tasks/:id
 */
export const updateTask = async (req: express.Request, res: express.Response) => {
  const { id } = req.params as { id: string };
  try {
    const updatedTask = await taskService.update(id, req.body);
    res.json(updatedTask);
  } catch (err: any) {
    if (err.message.includes('not found')) {
      return res.status(404).json({ error: err.message });
    }

    // 400 Bad Request for immutability rules (Completed or Archived tasks)
    if (err.message.includes('Completed') || err.message.includes('archived') || err.message.includes('Category')) {
      return res.status(400).json({ error: 'Business Rule Violation', message: err.message });
    }

    console.error('Update Task Error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Handles the smart deletion (Soft or Hard) of a task.
 * @route DELETE /api/tasks/:id
 */
export const deleteTask = async (req: express.Request, res: express.Response) => {
  const { id } = req.params as { id: string };
  try {
    const result = await taskService.delete(id);
    
    // Returns 200 OK with the specific action taken (Archive vs Permanent Delete)
    res.status(200).json(result);
  } catch (err: any) {
    if (err.message.includes('not found')) {
      return res.status(404).json({ error: err.message });
    }

    if (err.message.includes('completed')) {
      return res.status(400).json({ error: 'Business Rule Violation', message: err.message });
    }

    console.error('Delete Task Error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};