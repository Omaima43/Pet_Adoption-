<script lang="ts">
    import { currentUser } from '$lib/stores';
    import type { Pet, SafeUser } from '$lib/types';
    import { goto } from '$app/navigation';

    export let data: { user: SafeUser; pets: Pet[] };

    let pets: Pet[] = data.pets;
    let user: SafeUser = data.user;
    let success = '';
    let error = '';

    async function handleAction(petId: number, action: 'feed' | 'toy' | 'return') {
        success = '';
        error = '';
        try {
            const res = await fetch('/api/actions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ petId, action })
            });
            const result = await res.json();
            if (res.ok) {
                pets = result.pets;
                currentUser.set(result.user);
                user = result.user;
                success = result.message;
            } else {
                if (result.redirectTo) {
                    await goto(result.redirectTo);
                } else {
                    error = result.error || 'Action failed.';
                }
            }
        } catch {
            error = 'Something went wrong.';
        }
    }

    async function buy(item: 'food' | 'toy') {
        success = '';
        error = '';
        try {
            const res = await fetch('/api/shop', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ item })
            });
            const result = await res.json();
            if (res.ok) {
                currentUser.set(result.user);
                user = result.user;
                success = result.message;
            } else {
                error = result.error || 'Purchase failed.';
            }
        } catch {
            error = 'Failed to process purchase.';
        }
    }
</script>

<h1>Your Dashboard</h1>

{#if success}<p class="success">{success}</p>{/if}
{#if error}<p class="error">{error}</p>{/if}

<div class="info">
    <p><strong>Budget:</strong> ${user.budget}</p>
    <p><strong>Inventory:</strong>  {user.inventory.food} food,  {user.inventory.toy} toys,  {user.inventory.treat} treats</p>
</div>

<div class="shop">
    <h2>Shop</h2>
    <button on:click={() => buy('food')}>Buy Food ($5)</button>
    <button on:click={() => buy('toy')}>Buy Toy ($10)</button>
</div>

<h2>Your Adopted Pets</h2>
{#if pets.length === 0}
    <p class="empty">You haven’t adopted any pets yet.</p>
{:else}
    <div class="grid">
        {#each pets as pet}
            <div class="card">
                <div class="emoji">{pet.type === 'puppy' ? '🐶' : '🐱'}</div>
                <h3>{pet.name}</h3>
                <p>Hunger: {pet.hunger}</p>
                <p>Happiness: {pet.happiness}</p>

                <div class="actions">
                    <button on:click={() => handleAction(pet.id, 'feed')}>Feed (−$5)</button>
                    <button on:click={() => handleAction(pet.id, 'toy')}>Play (−$10)</button>
                    <button on:click={() => handleAction(pet.id, 'return')}>Return (−$20)</button>
                </div>
            </div>
        {/each}
    </div>
{/if}

<style>
    h1 {
        text-align: center;
        margin-bottom: 1rem;
    }

    .info {
        margin: 1rem 0;
        text-align: center;
    }

    .success {
        color: green;
        text-align: center;
        margin-bottom: 1rem;
    }
    .error {
        color: red;
        text-align: center;
        margin-bottom: 1rem;
    }

    .shop {
        text-align: center;
        margin-bottom: 2rem;
    }

    .shop button {
        margin: 0.5rem;
        padding: 0.5rem 1rem;
        background-color: #007acc;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        font-weight: bold;
    }

    .shop button:hover {
        background-color: #005fa3;
    }

    h2 {
        text-align: center;
        margin: 1.5rem 0 1rem;
    }

    .grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        gap: 1.5rem;
        padding: 0 1rem;
    }

    .card {
        background-color: #f9f9f9;
        border: 1px solid #ddd;
        border-radius: 10px;
        padding: 1rem;
        text-align: center;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.08);
        transition: transform 0.2s ease;
    }

    .card:hover {
        transform: translateY(-4px);
    }

    .emoji {
        font-size: 2.5rem;
        margin-bottom: 0.5rem;
    }

    .actions button {
        margin: 0.3rem;
        padding: 0.4rem 0.8rem;
        background-color: #28a745;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        font-size: 0.9rem;
    }

    .actions button:hover {
        background-color: #1e7e34;
    }

    .empty {
        text-align: center;
        font-style: italic;
        color: #666;
    }
</style>
