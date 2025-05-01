import type { RequestHandler } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';
import fs from 'fs/promises';
import path from 'path';

import { feedPet, toyPet, returnPet, writeLog } from '$lib/helpers';

const resolve = (file: string) => path.resolve('static/data', file);

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { petId, action } = await request.json();

		if (!petId || !action) {
			return json({ error: 'Missing input.' }, { status: 400 });
		}

		const [userData, petData] = await Promise.all([
			fs.readFile(resolve('users.json'), 'utf-8'),
			fs.readFile(resolve('pets.json'), 'utf-8')
		]);

		const users = JSON.parse(userData);
		const pets = JSON.parse(petData);

		const targetPet = pets.find((p: any) => p.id === petId);
		if (!targetPet || !targetPet.ownerId) {
			return json({ error: 'Pet not found or not owned.' }, { status: 404 });
		}

		const owner = users.find((u: any) => u.id === targetPet.ownerId);
		if (!owner) {
			return json({ error: 'User not found.' }, { status: 404 });
		}

		let resultMsg: string | null = null;

		switch (action) {
			case 'feed':
				resultMsg = feedPet(owner, targetPet);
				break;
			case 'toy':
				resultMsg = toyPet(owner, targetPet);
				break;
			case 'return':
				resultMsg = returnPet(owner, targetPet);
				break;
			default:
				return json({ error: 'Unknown action' }, { status: 400 });
		}

		if (!resultMsg) {
			return json({ redirectTo: '/shop' }, { status: 400 });
		}

		await writeLog(resultMsg);

		await Promise.all([
			fs.writeFile(resolve('users.json'), JSON.stringify(users, null, 2)),
			fs.writeFile(resolve('pets.json'), JSON.stringify(pets, null, 2))
		]);

		const { passwordHash, ...safeUser } = owner;

		return json({
			user: safeUser,
			pets: pets.filter((p: any) => p.ownerId === safeUser.id),
			message: resultMsg
		});
	} catch (err) {
		console.error('Action error:', err);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};
