import { NextResponse } from 'next/server';
import { authProviderService } from '@/app/services/authProviderService';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

/**
 * @swagger
 * /api/auth-providers/{id}:
 *   put:
 *     summary: Update an authentication provider.
 *     tags:
 *       - AuthProviders
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "GitHub"
 *     responses:
 *       200:
 *         description: Provider updated successfully.
 *       404:
 *         description: Provider not found.
 */

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const { name } = await request.json();

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const updatedProvider = await authProviderService.update(id, name);

    if (!updatedProvider) {
      return NextResponse.json({ error: 'Auth Provider not found' }, { status: 404 });
    }

    return NextResponse.json(updatedProvider, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Update failed', details: message }, { status: 500 });
  }
}

/**
 * @swagger
 * /api/auth-providers/{id}:
 *   delete:
 *     summary: Remove an authentication provider
 *     tags:
 *       - AuthProviders
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Provider removed successfully.
 *       404:
 *         description: Provider not found.
 */

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const success = await authProviderService.delete(id);

    if (!success) {
      return NextResponse.json({ error: 'Auth Provider not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Auth Provider deleted successfully' }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Delete failed', details: message }, { status: 500 });
  }
}
