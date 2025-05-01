<script lang="ts">
    import { onMount } from 'svelte';
    import type { Pet } from '$lib/types';
    import { currentUser } from '$lib/stores';

    let allPets: Pet[] = [];
    let selection: 'all' | 'puppy' | 'kitten' = 'all';
    let filteredPets: Pet[] = [];

    onMount(fetchPets);

    async function fetchPets() {
        try {
            const res = await fetch('/api/pets');
            if (res.ok) {
                allPets = await res.json();
            }
        } catch (err) {
            console.error('Failed to fetch pets:', err);
        }
    }

    $: filteredPets = selection === 'all'
        ? allPets
        : allPets.filter((p) => p.type === selection);

    async function adopt(petId: number) {
        const res = await fetch('/api/adopt', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ petId })
        });
        if (res.ok) {
            await fetchPets();
        } else {
            alert('Could not adopt this pet.');
        }
    }
</script>

<h1>Pet Adoption Center</h1>

<!-- Optional admin-only content -->
{#if $currentUser?.role === 'admin'}
    <p style="text-align: center; color: darkred; font-weight: bold;">
        👑 You are viewing this as an Admin.
    </p>
{/if}

<div class="filter">
    <label for="filter">Filter by type:</label>
    <select id="filter" bind:value={selection}>
        <option value="all">All</option>
        <option value="puppy">Puppies</option>
        <option value="kitten">Kittens</option>
    </select>
</div>

{#if filteredPets.length === 0}
    <p class="empty">No pets available in this category.</p>
{:else}
    <div class="grid">
        {#each filteredPets as pet}
            <div class="card">
                <div class="emoji">{pet.type === 'puppy' ? '🐶' : '🐱'}</div>
                <h2>{pet.name}</h2>
                <p class="type">Type: {pet.type}</p>
                <p class="status">{pet.adopted ? 'Already Adopted' : 'Available for adoption'}</p>

                {#if !pet.adopted}
                    <button on:click={() => adopt(pet.id)}>Adopt</button>
                {/if}
            </div>
        {/each}
    </div>
{/if}
<style>
    h1 {
        text-align: center;
        font-size: 2rem;
        margin-bottom: 2rem;
    }

    .filter {
        display: flex;
        justify-content: center;
        align-items: center;
        margin-bottom: 1.5rem;
        gap: 0.5rem;
    }

    select {
        padding: 0.4rem 0.7rem;
        font-size: 1rem;
        border-radius: 6px;
        border: 1px solid #ccc;
    }

    .grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
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
        font-size: 3rem;
        margin-bottom: 0.5rem;
    }

    h2 {
        margin: 0.5rem 0;
        font-size: 1.25rem;
    }

    .type,
    .status {
        font-size: 0.95rem;
        color: #555;
        margin: 0.3rem 0;
    }

    button {
        margin-top: 0.75rem;
        padding: 0.4rem 1rem;
        background-color: #28a745;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        font-weight: bold;
        font-size: 0.95rem;
    }

    button:hover {
        background-color: #218838;
    }

    .empty {
        text-align: center;
        font-style: italic;
        color: #666;
    }
</style>
