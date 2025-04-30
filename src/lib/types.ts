export interface Inventory {
	food: number;
	toy: number;
	treat: number;
}

export type UserRole = 'admin' | 'user';
export type PetType = 'puppy' | 'kitten';

export interface User {
	id: number;
	name: string;
	passwordHash: string;
	budget: number;
	inventory: Inventory;
	role?: UserRole;
	petIds?: number[]; // IDs of adopted pets
}

export type SafeUser = Omit<User, 'passwordHash'>;

export interface Pet {
	id: number;
	name: string;
	type: PetType;
	hunger: number;
	happiness: number;
	adopted: boolean;
	ownerId: number | null;
	image?: string;
}
