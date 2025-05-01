<script lang="ts">
    import { onMount } from 'svelte';
    import type { Pet } from '$lib/types';

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
        : allPets.filter(p => p.type === selection);

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

<h1>🐾 Adopt a Pet</h1>

<label>
    Filter by type:
    <select bind:value={selection}>
        <option value="all">All</option>
        <option value="puppy">Puppies</option>
        <option value="kitten">Kittens</option>
    </select>
</label>

{#if filteredPets.length === 0}
    <p>No pets available for this type.</p>
{:else}
    <ul>
        {#each filteredPets as pet}
            <li>
                <div class="info">
                    <span class="emoji">{pet.type === 'puppy' ? '🐶' : '🐱'}</span>
                    <strong>{pet.name}</strong>  {pet.type}
                    <p class="status">{pet.adopted ? 'Adopted' : 'Available'}</p>
                </div>
                {#if !pet.adopted}
                    <button on:click={() => adopt(pet.id)}>Adopt</button>
                {/if}
            </li>
        {/each}
    </ul>
{/if}

<style>
    h1 {
        margin-bottom: 1rem;
    }

    select {
        margin-left: 0.5rem;
        padding: 0.25rem;
    }

    ul {
        padding: 0;
        list-style: none;
    }

    li {
        border: 1px solid #ccc;
        border-radius: 6px;
        padding: 0.75rem;
        margin-bottom: 1rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .info {
        display: flex;
        flex-direction: column;
    }

    .emoji {
        font-size: 1.5rem;
        margin-bottom: 0.3rem;
    }

    .status {
        font-size: 0.9rem;
        color: #666;
        margin-top: 0.3rem;
    }

    button {
        padding: 0.4rem 0.8rem;
        border: none;
        background-color: #007acc;
        color: white;
        border-radius: 4px;
        cursor: pointer;
    }

    button:hover {
        background-color: #005fa3;
    }
</style>
