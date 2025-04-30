<script lang="ts">
    import { currentUser } from '$lib/stores';
    import type { Pet, SafeUser } from '$lib/types';
    import { goto } from '$app/navigation';

    export let data: { user: SafeUser; pets: Pet[] };

    let user = data.user;
    let pets = data.pets;
    let error = '';
    let message = '';

    async function takeCare(petId: number, action: 'feed' | 'toy' | 'return') {
        error = '';
        message = '';
        try {
            const res = await fetch('/api/actions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ petId, action })
            });
            const result = await res.json();
            if (res.ok) {
                currentUser.set(result.user);
                user = result.user;
                pets = result.pets;
                message = result.message || 'Action completed.';
            } else {
                if (result.redirectTo) {
                    goto(result.redirectTo);
                } else {
                    error = result.error || 'Something went wrong.';
                }
            }
        } catch {
            error = 'Server error during action.';
        }
    }

    async function purchase(item: 'food' | 'toy') {
        error = '';
        message = '';
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
                message = result.message;
            } else {
                error = result.error || 'Could not complete purchase.';
            }
        } catch {
            error = 'Shop request failed.';
        }
    }
</script>

<main>
    <h2>Welcome back, {user.name}!</h2>

    <section class="status-box">
        <p><strong>Available Funds:</strong> ${user.budget}</p>
        <p><strong>Items:</strong> 🥫 Food: {user.inventory.food} | 🧸 Toy: {user.inventory.toy} | 🍬 Treat: {user.inventory.treat}</p>
    </section>

    {#if message}
        <p class="message">{message}</p>
    {/if}
    {#if error}
        <p class="error">{error}</p>
    {/if}

    <section class="shop">
        <h3>Marketplace</h3>
        <button on:click={() => purchase('food')}>Buy Food - $5</button>
        <button on:click={() => purchase('toy')}>Buy Toy - $10</button>
    </section>

    <section>
        <h3>Adopted Companions</h3>
        {#if pets.length === 0}
            <p>No pets adopted yet.</p>
        {:else}
            <ul class="pet-list">
                {#each pets as pet}
                    <li>
                        <h4>{pet.name} <span>({pet.type})</span></h4>
                        <p>Hunger: {pet.hunger} | Happiness: {pet.happiness}</p>
                        <div class="actions">
                            <button on:click={() => takeCare(pet.id, 'feed')}>Feed</button>
                            <button on:click={() => takeCare(pet.id, 'toy')}>Play</button>
                            <button on:click={() => takeCare(pet.id, 'return')}>Return</button>
                        </div>
                    </li>
                {/each}
            </ul>
        {/if}
    </section>
</main>

<style>
    main {
        max-width: 800px;
        margin: 2rem auto;
        padding: 1.5rem;
        background: #fafafa;
        border: 1px solid #ddd;
        border-radius: 10px;
    }

    h2 {
        text-align: center;
        margin-bottom: 1rem;
    }

    .status-box {
        background: #eef;
        padding: 1rem;
        border-radius: 6px;
        margin-bottom: 1.5rem;
    }

    .shop {
        margin: 2rem 0;
    }

    button {
        margin-right: 0.8rem;
        margin-top: 0.5rem;
        padding: 0.4rem 0.8rem;
        font-size: 0.95rem;
        cursor: pointer;
    }

    .pet-list {
        list-style: none;
        padding: 0;
    }

    .pet-list li {
        border: 1px solid #ccc;
        border-radius: 6px;
        margin-bottom: 1rem;
        padding: 1rem;
        background: #fff;
    }

    .pet-list h4 {
        margin: 0 0 0.5rem 0;
    }

    .pet-list .actions {
        margin-top: 0.8rem;
    }

    .message {
        color: green;
        text-align: center;
        margin-bottom: 1rem;
    }

    .error {
        color: red;
        text-align: center;
        margin-bottom: 1rem;
    }
</style>

