import { NextResponse } from 'next/server';
import { authProviderService } from '@/app/services/authProviderService';

/**
 * @swagger
 * /api/auth-providers:
 *   get:
 *     summary: List all authentication providers
 *     description: Returns the available login methods (e.g., Google, GitHub, Local).
 *     tags:
 *       - AuthProviders
 *     responses:
 *       200:
 *         description: List successfully retrieved.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   name:
 *                     type: string
 *                     example: "Google"
 *       500:
 *         description: Internal server error while fetching providers.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Failed to fetch providers"
 *                 details:
 *                   type: string
 *                   example: "Database connection error"
 */


export async function GET() {
  try {
    const providers = await authProviderService.findAll();
    return NextResponse.json(providers);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to fetch providers', details: message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/auth-providers:
 *   post:
 *     summary: Register a new authentication provider.
 *     description: Adds a new login option to the FlowTasks ecosystem.
 *     tags:
 *       - AuthProviders
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Google"
 *     responses:
 *       201:
 *         description: Provider successfully created..
 *       500:
 *         description: Error creating provider.
 */

export async function POST(request: Request) {
  try {
    const { name } = await request.json();

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const newProvider = await authProviderService.create(name);
    return NextResponse.json(newProvider, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to create provider', details: message },
      { status: 500 }
    );
  }
}
