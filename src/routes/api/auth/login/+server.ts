import type { RequestHandler } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';
import { readFile } from 'fs/promises';
import path from 'path';
import bcrypt from 'bcrypt';

const FILE_PATH = path.resolve('static/data/users.json');

export const POST: RequestHandler = async ({ request, cookies }) => {
	try {
		const body = await request.json();
		const { name, password } = body;

		// Input check
		if (!name || !password) {
			return json({ error: 'Username and password must be provided.' }, { status: 400 });
		}

		// Load users
		const data = await readFile(FILE_PATH, 'utf-8');
		const allUsers = JSON.parse(data);

		// Find matching user (case-insensitive)
		const matched = allUsers.find((u: any) => u.name?.toLowerCase() === name.toLowerCase());
		if (!matched) {
			return json({ error: 'User does not exist.' }, { status: 401 });
		}

		// Validate password
		const valid = await bcrypt.compare(password, matched.passwordHash);
		if (!valid) {
			return json({ error: 'Invalid password.' }, { status: 401 });
		}

		// Create safe user object
		const { passwordHash, ...publicUser } = matched;

		// Set session cookie
		cookies.set('user', JSON.stringify(publicUser), {
			path: '/',
			httpOnly: true,
			sameSite: 'lax',
			maxAge: 86400
		});

		return json({ success: true, user: publicUser });
	} catch (err) {
		console.error('[Login Error]', err);
		return json({ error: 'Something went wrong.' }, { status: 500 });
	}
};

