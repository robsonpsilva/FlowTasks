import { NextResponse } from 'next/server';
import { userService } from '@/app/services/userService';

/**
 * Interface for typing dynamic route parameters.
 */
interface RouteParams {
  params: {
    id: string;
  };
}

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Update an existing user
 *     description: Modifies the data of a specific user in FlowTasks by their ID.
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique user ID (UUID or Serial)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Robson Silva Updated
 *               email:
 *                 type: string
 *                 example: robson.new@example.com
 *     responses:
 *       200:
 *         description: User successfully updated.
 *       404:
 *         description: User not found in the database.
 *       500:
 *         description: Internal error while processing the update.
 */


export async function PUT(request: Request, { params }: RouteParams) {
  try {
    // RESOLUÇÃO DO ERRO: Unwrapping a Promise do params
    const { id } = await params; 
    
    const body = await request.json();
    const updatedUser = await userService.update(id, body);

    if (!updatedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(updatedUser, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Update failed', details: message }, { status: 500 });
  }
}

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Remove a user
 *     description: Permanently deletes a user record from the FlowTasks system.
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User successfully removed.
 *       404:
 *         description: User not found.
 *       500:
 *         description: Error while attempting to delete the record.
 */


export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    // RESOLUÇÃO DO ERRO: Unwrapping a Promise do params
    const { id } = await params;

    const success = await userService.delete(id);

    if (!success) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'User deleted successfully' }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Delete failed', details: message }, { status: 500 });
  }
}

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Retrieve the complete user profile
 *     description: Returns the user data including their role in the FlowTasks system.
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique user ID
 *     responses:
 *       200:
 *         description: Profile successfully retrieved.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 email:
 *                   type: string
 *                 role_name:
 *                   type: string
 *       404:
 *         description: User not found.
 *       500:
 *         description: Server error.
 */


export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params; // Unwrapping para Next.js 15
    const profile = await userService.findProfile(id);

    if (!profile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    return NextResponse.json(profile, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error(`API Error at GET /api/users/${(await params).id}:`, message);
    
    return NextResponse.json(
      { error: 'Failed to fetch profile', details: message }, 
      { status: 500 }
    );
  }
}
