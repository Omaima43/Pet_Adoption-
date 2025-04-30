import type { RequestHandler } from '@sveltejs/kit';
import { readFile, writeFile } from 'fs/promises';
import bcrypt from 'bcrypt';
import { json } from '@sveltejs/kit';
import path from 'path';

const usersPath = path.resolve('static/data/users.json');

export const POST: RequestHandler = async ({ request, cookies }) => {
	try {
		const { name, password } = await request.json();

		if (!name || !password) {
			return json({ error: 'Username and password are required' }, { status: 400 });
		}

		const raw = await readFile(usersPath, 'utf-8');
		const users = JSON.parse(raw);

		const exists = users.find((u: any) => u.name.toLowerCase() === name.toLowerCase());
		if (exists) {
			return json({ error: 'User already exists' }, { status: 409 });
		}

		const passwordHash = await bcrypt.hash(password, 10);

		// Auto-increment numeric ID
		const maxId = Math.max(0, ...users.map((u: any) => parseInt(u.id ?? '0')));
		const newUser = {
			id: String(maxId + 1).padStart(2, '0'), // e.g. "01", "02"
			name,
			passwordHash,
			budget: 100,
			role: 'user',
			inventory: { food: 0, toy: 0, treat: 0 },
			PetId: []
		};

		users.push(newUser);
		await writeFile(usersPath, JSON.stringify(users, null, 2));

		const { passwordHash: _, ...safeUser } = newUser;

		cookies.set('user', JSON.stringify(safeUser), {
			path: '/',
			httpOnly: true,
			sameSite: 'strict',
			maxAge: 60 * 60 * 24
		});

		return json({ success: true, user: safeUser });
	} catch (err) {
		console.error('Register error:', err);
		return json({ error: 'Internal Server Error' }, { status: 500 });
	}
};
