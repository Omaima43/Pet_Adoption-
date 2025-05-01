<script lang="ts">
    import { currentUser } from '$lib/stores';

    let error = '';
    let success = '';

    // Reactive current user
    $: user = $currentUser;

    // Shop logic — POST to /api/shop with the item type
    async function buy(item: 'food' | 'toy' | 'treat') {
        error = '';
        success = '';

        if (!user) {
            error = 'You must be logged in to shop.';
            return;
        }

        try {
            const res = await fetch('/api/shop', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ item })
            });

            const result = await res.json();

            if (!res.ok) {
                error = result.error || 'Purchase failed.';
            } else {
                success = result.message;
                currentUser.set(result.user); // Update store
            }
        } catch (err) {
            error = 'Something went wrong.';
            console.error(err);
        }
    }
</script>

<h1>🛒 Pet Shop</h1>

{#if success}
    <p class="success">{success}</p>
{/if}

{#if error}
    <p class="error">{error}</p>
{/if}

{#if user}
    <p><strong>💰 Budget:</strong> ${user.budget}</p>

    <p>🎒 Inventory:</p>
    <ul>
        <li>🍽️ Food: {user.inventory.food}</li>
        <li>🧸 Toy: {user.inventory.toy}</li>
        <li>🍬 Treat: {user.inventory.treat}</li>
    </ul>

    <div class="shop">
        <button on:click={() => buy('food')}>Buy Food (−$5)</button>
        <button on:click={() => buy('toy')}>Buy Toy (−$10)</button>
        <button on:click={() => buy('treat')}>Buy Treat (−$15)</button>
    </div>
{:else}
    <p>You must be logged in to use the shop.</p>
{/if}

<style>
    button {
        padding: 0.5rem;
        font-size: 1rem;
        margin-right: 1rem;
        margin-top: 1rem;
    }

    ul {
        margin-top: 0.5rem;
        margin-left: 1rem;
    }

    .error {
        color: red;
    }

    .success {
        color: green;
    }

    .shop {
        margin-top: 1rem;
    }
</style>
