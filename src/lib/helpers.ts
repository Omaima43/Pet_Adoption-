import type { Pet, User } from './types';
import { readFile, writeFile } from 'fs/promises';
import path from 'path';

// Helper to resolve data file paths
const resolvePath = (filename: string) => path.resolve('static/data', filename);

/**
 * Append a new log message to log.json
 */
export async function writeLog(entry: string) {
    const logFile = resolvePath('log.json');
    const content = await readFile(logFile, 'utf-8');
    const logs = JSON.parse(content);
    logs.unshift({ timestamp: new Date().toISOString(), message: entry });
    await writeFile(logFile, JSON.stringify(logs, null, 2));
}

/**
 * Check if user has enough money for an action
 */
export function canAfford(user: User, cost: number): boolean {
    return user.budget >= cost;
}

/**
 * Try to feed a pet using food or budget. Updates user and pet objects.
 * Returns a message for logging or null if action fails.
 */
export function feedPet(user: User, pet: Pet): string | null {
    if (user.inventory.food > 0) {
        user.inventory.food--;
        pet.hunger = Math.max(0, pet.hunger - 20);
        return `${user.name} fed ${pet.name} (used 1 food)`;
    }

    if (canAfford(user, 5)) {
        user.budget -= 5;
        pet.hunger = Math.max(0, pet.hunger - 20);
        return `${user.name} fed ${pet.name} (−$5)`;
    }

    return null;
}

/**
 * Try to increase pet happiness by playing. Uses toy or budget.
 * Returns a message for the log or null if the user can't afford it.
 */
export function toyPet(user: User, pet: Pet): string | null {
    if (user.inventory.toy > 0) {
        user.inventory.toy--;
        pet.happiness = Math.min(100, pet.happiness + 30);
        return `${user.name} played with ${pet.name} (used 1 toy)`;
    }

    if (canAfford(user, 10)) {
        user.budget -= 10;
        pet.happiness = Math.min(100, pet.happiness + 30);
        return `${user.name} played with ${pet.name} (−$10)`;
    }

    return null;
}

/**
 * Let user return a pet if they can afford the return fee ($20).
 * Updates the pet's ownership and resets hunger/happiness.
 */
export function returnPet(user: User, pet: Pet): string | null {
    if (!canAfford(user, 20)) return null;

    user.budget -= 20;
    pet.ownerId = null;
    pet.adopted = false;
    pet.hunger = 50;
    pet.happiness = 50;

    return `${user.name} returned ${pet.name} (−$20)`;
}
