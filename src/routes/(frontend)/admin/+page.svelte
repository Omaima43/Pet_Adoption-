<script lang="ts">
    import { currentUser } from '$lib/stores';
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';

    let name = '';
    let type = 'kitten';
    let error = '';
    let success = '';

    onMount(() => {
        const unsubscribe = currentUser.subscribe((user) => {
            if (!user) {
                goto('/login');
            } else if (user.role !== 'admin') {
                goto('/');
            }
        });
    });

    async function addPet() {
        error = '';
        success = '';
        if (!name || !type) {
            error = 'Please fill out all fields.';
            return;
        }

        try {
            const res = await fetch('/api/pets', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, type })
            });

            const result = await res.json();

            if (!res.ok) {
                error = result.error || 'Something went wrong.';
            } else {
                success = `${result.pet.name} was added successfully!`;
                name = '';
                type = 'puppy';
            }
        } catch (err) {
            error = 'Failed to submit pet.';
            console.error(err);
        }
    }
</script>

<h1>Add a New Pet</h1>

{#if error}
    <p class="error">{error}</p>
{/if}
{#if success}
    <p class="success">{success}</p>
{/if}

<form on:submit|preventDefault={addPet}>
    <label>
        Name:
        <input bind:value={name} required />
    </label>

    <label>
        Type:
        <select bind:value={type}>
            <option value="puppy">Puppy</option>
            <option value="kitten">Kitten</option>
        </select>
    </label>

    <button type="submit">Add Pet</button>
</form>

<style>
    h1 {
        margin-bottom: 1rem;
        text-align: center;
    }

    form {
        display: grid;
        gap: 0.75rem;
        max-width: 300px;
        margin: 0 auto;
    }

    label {
        display: flex;
        flex-direction: column;
    }

    .error {
        color: red;
        text-align: center;
    }

    .success {
        color: green;
        text-align: center;
    }

    button {
        padding: 0.5rem;
        border: none;
        background-color: #4caf50;
        color: white;
        cursor: pointer;
        border-radius: 4px;
    }

    button:hover {
        background-color: #3e8e41;
    }
</style>
