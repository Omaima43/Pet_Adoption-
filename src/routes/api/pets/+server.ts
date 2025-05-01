import type { RequestHandler } from '@sveltejs/kit';
import { readFile, writeFile } from 'fs/promises';
import path from 'path';
import { json, error } from '@sveltejs/kit';

const file = (name: string) => path.resolve('static/data', name);

	export const GET: RequestHandler = async ({ url }) => {
	try {
		const rawPets = await readFile(file('pets.json'), 'utf-8');
		let pets = JSON.parse(rawPets);

		const kind = url.searchParams.get('type');
		if (kind) {
			pets = pets.filter((pet: any) => pet.type === kind);
		}

		return json(pets);
	} catch (err) {
		console.error('Error loading pets:', err);
		return json({ error: 'Unable to fetch pet data' }, { status: 500 });
	}
};

// POST: Add a new pet (admin-only)
export const POST: RequestHandler = async ({ request, locals }) => {
	const admin = locals.user;

	if (!admin || admin.role !== 'admin') {
		return json({ error: 'Admin privileges required' }, { status: 401 });
	}

	const { name, type } = await request.json();
	if (!name || !type) {
		return json({ error: 'Missing name or type' }, { status: 400 });
	}

	try {
		const raw = await readFile(file('pets.json'), 'utf-8');
		const pets = JSON.parse(raw);

		const newPet = {
			id: Math.max(0, ...pets.map((p: any) => p.id)) + 1,
			name,
			type,
			hunger: 50,
			happiness: 50,
			adopted: false,
			ownerId: null
		};

		pets.push(newPet);
		await writeFile(file('pets.json'), JSON.stringify(pets, null, 2));

		return json({ success: true, pet: newPet });
	} catch (err) {
		console.error('Failed to save pet:', err);
		return json({ error: 'Could not add pet' }, { status: 500 });
	}
};

// PATCH: Handle pet interactions (feed/play/return)
// PATCH: Handle pet interactions (feed/play/return)
export const PATCH: RequestHandler = async ({ request, locals }) => {
	// ✅ Check if the user is authenticated
	if (!locals.user) throw error(401, 'Login required');

	const { petId, action } = await request.json();
	if (!petId || !action) throw error(400, 'Missing pet ID or action');

	// ✅ Load data
	const [rawUsers, rawPets] = await Promise.all([
		readFile(file('users.json'), 'utf-8'),
		readFile(file('pets.json'), 'utf-8')
	]);

	const users = JSON.parse(rawUsers);
	const pets = JSON.parse(rawPets);

	// ✅ Safe lookup using verified user
	const currentUserId = locals.user.id;
	const user = users.find((u: any) => u.id === currentUserId);
	if (!user) throw error(404, 'User not found');

	const pet = pets.find((p: any) => p.id === petId);
	if (!pet) throw error(404, 'Pet not found');

	if (pet.ownerId !== user.id) {
		throw error(403, 'This pet does not belong to you');
	}

	// ✅ Perform the action
	let msg = '';
	if (action === 'feed' && user.budget >= 5) {
		user.budget -= 5;
		pet.hunger = Math.max(0, pet.hunger - 20);
		msg = 'Pet has been fed.';
	} else if (action === 'toy' && user.budget >= 10) {
		user.budget -= 10;
		pet.happiness = Math.min(100, pet.happiness + 30);
		msg = 'Played with pet.';
	} else if (action === 'return' && user.budget >= 20) {
		user.budget -= 20;
		pet.adopted = false;
		pet.ownerId = null;
		pet.hunger = 50;
		pet.happiness = 50;
		msg = 'Pet returned.';
	} else {
		throw error(400, 'Invalid action or insufficient funds');
	}

	// ✅ Save updates
	await writeFile(file('users.json'), JSON.stringify(users, null, 2));
	await writeFile(file('pets.json'), JSON.stringify(pets, null, 2));

	const safeUser = { ...user };
	delete safeUser.passwordHash;

	const ownedPets = pets.filter((p: any) => p.ownerId === user.id);

	return json({ user: safeUser, pets: ownedPets, message: msg });
};

