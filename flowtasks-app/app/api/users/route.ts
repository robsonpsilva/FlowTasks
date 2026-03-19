import { NextResponse } from 'next/server';
import { userService } from '@/app/services/userService';

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Create a new user
 *     description: Endpoint to register users in the FlowTasks ecosystem.
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *               - provider_id
 *             properties:
 *               name:
 *                 type: string
 *                 example: Robson Silva
 *               email:
 *                 type: string
 *                 example: robson@example.com
 *               password:
 *                 type: string
 *                 example: password123
 *               provider_id:
 *                 type: integer
 *                 example: 0
 *     responses:
 *       201:
 *         description: User successfully created.
 *       500:
 *         description: Internal server error.
 */



export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newUser = await userService.create(body);
    
    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    // We cast the error to access the message property safely
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    console.error('API Error at POST /api/users:', errorMessage);

    return NextResponse.json(
      { error: 'Error while creating user', details: errorMessage }, 
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: List all users
 *     description: Returns a list of all users registered in the FlowTasks system.
 *     tags:
 *       - Users
 *     responses:
 *       200:
 *         description: User list successfully retrieved.
 *       500:
 *         description: Error while fetching users.
 */

export async function GET() {
  try {
    const users = await userService.findAll();
    
    // Boa prática: Garantir que a lista nunca retorne senhas, 
    // mesmo que o service esqueça de filtrar.
    const safeUsers = users.map(({ password, ...user }) => user);
    
    return NextResponse.json(safeUsers, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('API Error at GET /api/users:', message);
    
    return NextResponse.json(
      { error: 'Failed to retrieve users', details: message }, 
      { status: 500 }
    );
  }
}