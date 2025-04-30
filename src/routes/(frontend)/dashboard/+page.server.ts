import { readFile } from 'fs/promises';
import path from 'path';
import type { Pet, SafeUser } from '$lib/types';
import type { PageServerLoad } from './$types';

const resolveFile = (filename: string) => path.resolve('static/data', filename);

export const load: PageServerLoad = async ({ locals }) => {
    const userFromSession = locals.user;

    const [usersText, petsText] = await Promise.all([
        readFile(resolveFile('users.json'), 'utf-8'),
        readFile(resolveFile('pets.json'), 'utf-8')
    ]);

    const userList = JSON.parse(usersText);
    const allPets: Pet[] = JSON.parse(petsText);

    const activeUser = userList.find((entry: any) => entry.id === userFromSession?.id);

    const ownedPets = allPets.filter((pet) => pet.ownerId === activeUser?.id);

    return {
        user: activeUser,
        pets: ownedPets
    };
};
