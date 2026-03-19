import { NextResponse } from 'next/server';
import { roleService } from '@/app/services/roleService';

/**
 * @swagger
 * /api/roles:
 *   get:
 *     summary: List all profiles (Roles)
 *     tags:
 *       - Roles
 *     responses:
 *       200:
 *         description: List of roles retrieved.
 *   post:
 *     summary: Create a new profile
 *     tags:
 *       - Roles
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
 *                 example: "ADMIN"
 *               description:
 *                 type: string
 *                 example: "Full access to the system"
 *     responses:
 *       201:
 *         description: Role created successfully.
 */

export async function GET() {
  try {
    const roles = await roleService.findAll();
    return NextResponse.json(roles);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch roles' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newRole = await roleService.create(body);
    return NextResponse.json(newRole, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create role' }, { status: 500 });
  }
}
