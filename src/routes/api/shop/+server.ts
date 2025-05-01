import type { RequestHandler } from '@sveltejs/kit';
import { readFile, writeFile } from 'fs/promises';
import path from 'path';
import { json } from '@sveltejs/kit';

const usersPath = path.resolve('static/data/users.json');

const ITEM_COSTS = {
	food: 5,
	toy: 10,
	treat: 15
};

export const POST: RequestHandler = async ({ request, locals }) => {
	const user = locals.user;

	if (!user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const { item } = await request.json();

	if (!['food', 'toy', 'treat'].includes(item)) {
		return json({ error: 'Invalid item type' }, { status: 400 });
	}

	const cost = ITEM_COSTS[item as keyof typeof ITEM_COSTS];

	const usersRaw = await readFile(usersPath, 'utf-8');
	const users = JSON.parse(usersRaw);

	const foundUser = users.find((u: any) => u.id === user.id);

	if (!foundUser) {
		return json({ error: 'User not found' }, { status: 404 });
	}

	if (foundUser.budget < cost) {
		return json({ error: 'Not enough budget' }, { status: 400 });
	}

	// Deduct cost and update inventory
	foundUser.budget -= cost;
	foundUser.inventory[item] += 1;

	await writeFile(usersPath, JSON.stringify(users, null, 2));

	const { passwordHash, ...safeUser } = foundUser;

	return json({
		success: true,
		message: `You bought 1 ${item}.`,
		user: safeUser
	});
};
