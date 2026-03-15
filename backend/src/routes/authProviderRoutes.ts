import { Router } from 'express';
import { 
  getProviders, 
  createProvider, 
  updateProvider, 
  deleteProvider 
} from '../controllers/authProviderController';

const router = Router();

/**
 * @openapi
 * /api/auth-providers:
 *   get:
 *     summary: Lista todos os provedores de autenticação
 *     responses:
 *       200:
 *         description: Lista retornada com sucesso
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
 *     summary: Cria um novo provedor de autenticação
 *     responses:
 *       201:
 *         description: Provedor criado com sucesso
 *
 * /api/auth-providers/{id}:
 *   put:
 *     summary: Atualiza um provedor de autenticação
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Provedor atualizado com sucesso
 *   delete:
 *     summary: Remove um provedor de autenticação
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Provedor removido com sucesso
 */
router.get('/', getProviders);
router.post('/', createProvider);
router.put('/:id', updateProvider);
router.delete('/:id', deleteProvider);

export default router;
