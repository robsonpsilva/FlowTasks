import { NextResponse } from 'next/server';
import { socialAuthService } from '@/app/services/socialAuthService';
import { userService } from '@/app/services/userService';
import jwt from 'jsonwebtoken';

// In a real scenario, this secret must be in your .env.local
const JWT_SECRET = process.env.JWT_SECRET || 'your_super_safe_petrobras_level_secret';

/**
 * @swagger
 * /api/auth/{provider}:
 *   post:
 *     summary: Process social login and issue JWT
 *     description: Receives social profile data, synchronizes with the local database, and returns a session token.
 *     tags:
 *       - Auth
 *     parameters:
 *       - in: path
 *         name: provider
 *         required: true
 *         schema:
 *           type: string
 *           example: "google"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               external_uid:
 *                 type: string
 *               email:
 *                 type: string
 *               name:
 *                 type: string
 *               provider_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Authentication successful. Returns JWT and user profile.
 *       400:
 *         description: Missing profile data.
 *       500:
 *         description: Internal server error.
 */

export async function POST(
  request: Request,
  { params }: { params: Promise<{ provider: string }> }
) {
  try {
    const { provider } = await params;
    const { external_uid, email, name, provider_id } = await request.json();

    // 1. Validate minimum required data
    if (!external_uid || !email) {
      return NextResponse.json({ error: 'Missing profile data' }, { status: 400 });
    }

    // 2. Persist or update in the database (Upsert)
    const user = await socialAuthService.findOrCreateUser({
      name,
      email,
      provider_id: Number(provider_id),
      external_uid
    });

    // 3. Retrieve the full profile including the Role
    const fullProfile = await userService.findProfile(user.id.toString());

    // 4. Generate the JWT
    const token = jwt.sign(
      {
        sub: user.id,
        email: user.email,
        role: fullProfile?.role_name || 'GUEST'
      },
      JWT_SECRET,
      { expiresIn: '8h' } // Token valid for 8 hours
    );

    return NextResponse.json(
      {
        message: `Successfully authenticated via ${provider}`,
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: fullProfile?.role_name || 'GUEST',
          auth_provider: fullProfile?.auth_provider_name || provider
        }
      },
      { status: 200 }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('OAuth Auth Error:', errorMessage);

    return NextResponse.json(
      { error: 'Authentication failed', details: errorMessage },
      { status: 500 }
    );
  }
}
