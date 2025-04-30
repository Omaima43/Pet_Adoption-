import type { RequestHandler } from '@sveltejs/kit';
import { readFile } from 'fs/promises';
import { json } from '@sveltejs/kit';
import path from 'path';

const logPath = path.resolve('static/data/log.json');

export const GET: RequestHandler = async () => {
	try {
		const raw = await readFile(logPath, 'utf-8');
		const logs = JSON.parse(raw);

		if (!Array.isArray(logs)) {
			throw new Error('Log data is not an array');
		}

		return json(logs);
	} catch (err) {
		console.error('Failed to load logs:', err);
		return json({ error: 'Could not load logs' }, { status: 500 });
	}
};
