import type { RequestHandler } from '@sveltejs/kit';
import { readFile, writeFile } from 'fs/promises';
import path from 'path';
import { json } from '@sveltejs/kit';
import { writeLog } from '$lib/helpers';

const getFile = (name: string) => path.resolve('static/data', name);

// POST: Assign a pet to a user
export const POST: RequestHandler = async ({ request, locals }) => {
	try {
		const { petId } = await request.json();

		const currentUser = locals.user;
		if (!currentUser) {
			return json({ error: 'You must be logged in to adopt.' }, { status: 401 });
		}

		const [petRaw, userRaw] = await Promise.all([
			readFile(getFile('pets.json'), 'utf-8'),
			readFile(getFile('users.json'), 'utf-8')
		]);

		const pets = JSON.parse(petRaw);
		const users = JSON.parse(userRaw);

		const pet = pets.find((p: any) => p.id === petId);
		if (!pet) {
			return json({ error: 'Pet not found' }, { status: 404 });
		}

		if (pet.adopted) {
			return json({ error: 'Pet is already adopted' }, { status: 400 });
		}

		const user = users.find((u: any) => u.id === currentUser.id);
		if (!user) {
			return json({ error: 'User not found' }, { status: 500 });
		}

		// Update pet ownership
		pet.adopted = true;
		pet.ownerId = user.id;

		// Add pet to user's adopted list
		user.pets = [...(user.pets || []), pet.id];

		await Promise.all([
			writeFile(getFile('pets.json'), JSON.stringify(pets, null, 2)),
			writeFile(getFile('users.json'), JSON.stringify(users, null, 2)),
			writeLog(`${user.name} adopted ${pet.name}`)
		]);

		return json({ success: true, pet });
	} catch (err) {
		console.error('Adoption error:', err);
		return json({ error: 'Could not complete adoption' }, { status: 500 });
	}
};
