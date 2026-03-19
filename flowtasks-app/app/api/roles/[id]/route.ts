import { NextResponse } from 'next/server';
import { roleService } from '@/app/services/roleService';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * @swagger
 * /api/roles/{id}:
 *   get:
 *     summary: Search for a role by ID.
 *     tags:
 *       - Roles
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *   put:
 *     summary: Update a role
 *     tags:
 *       - Roles
 *   delete:
 *     summary: Remove a role
 *     tags:
 *       - Roles
 */

export async function GET(request: Request, { params }: RouteParams) {
  const { id } = await params;
  const role = await roleService.findById(id);

  if (!role) {
    return NextResponse.json({ error: 'Role not found' }, { status: 404 });
  }

  return NextResponse.json(role);
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const updated = await roleService.update(id, body);

    if (!updated) {
      return NextResponse.json({ error: 'Role not found' }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const deleted = await roleService.delete(id);

    if (!deleted) {
      return NextResponse.json({ error: 'Role not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Role deleted' });
  } catch (error) {
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
  }
}
