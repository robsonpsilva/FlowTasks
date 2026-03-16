import { Router } from 'express';
import { 
  getProviders, 
  createProvider, 
  updateProvider, 
  deleteProvider 
} from '../controllers/authProviderController.ts';

const router = Router();

/**
 * @openapi
 * /api/auth-providers:
 *   get:
 *     summary: Lists all authentication providers.
 *     responses:
 *       200:
 *         description: List returned successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   name:
 *                     type: string
 *   post:
 *     summary: Creates a new authentication provider
 *     responses:
 *       201:
 *         description: Provider created successfully
 *
 * /api/auth-providers/{id}:
 *   put:
 *     summary: Update an authentication provider
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Provider updated successfully
 *   delete:
 *     summary: Remove an authentication provider
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Provider successfully removed
 */
router.get('/', getProviders);
router.post('/', createProvider);
router.put('/:id', updateProvider);
router.delete('/:id', deleteProvider);

export default router;
