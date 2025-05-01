import type { Handle } from '@sveltejs/kit';
import { readFile } from 'fs/promises';
import path from 'path';

const usersPath = path.resolve('static/data/users.json');

export const handle: Handle = async ({ event, resolve }) => {
    const cookie = event.cookies.get('user');

    if (cookie) {
        try {
            const userData = JSON.parse(cookie);
            const usersRaw = await readFile(usersPath, 'utf-8');
            const users = JSON.parse(usersRaw);
            const fullUser = users.find((u: any) => u.id === userData.id);

            if (fullUser) {
                const { passwordHash, ...safeUser } = fullUser;
                event.locals.user = safeUser;
            }
        } catch (err) {
            console.error('Failed to parse user from cookie:', err);
            event.locals.user = null;
        }
    } else {
        event.locals.user = null;
    }

    return resolve(event);
};
