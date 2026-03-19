import { NextResponse } from 'next/server';
import { userService } from '@/app/services/userService';

/**
 * @swagger
 * /api/users/roles:
 *   post:
 *     summary: Atribui um perfil (Role) a um usuário
 *     description: Cria o vínculo entre um usuário existente e uma role existente no FlowTasks.
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - roleId
 *             properties:
 *               userId:
 *                 type: string
 *                 example: "1"
 *               roleId:
 *                 type: string
 *                 example: "2"
 *     responses:
 *       201:
 *         description: Atribuição realizada com sucesso.
 *       400:
 *         description: Dados inválidos.
 *       500:
 *         description: Erro interno no servidor.
 */

export async function POST(request: Request) {
  try {
    const { userId, roleId } = await request.json();

    if (!userId || !roleId) {
      return NextResponse.json(
        { error: 'userId and roleId are required' },
        { status: 400 }
      );
    }

    const assignment = await userService.assignRole(userId, roleId);

    return NextResponse.json(assignment, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to assign role', details: message },
      { status: 500 }
    );
  }
}
