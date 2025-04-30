<script lang="ts">
    import { goto } from '$app/navigation';

    let name = '';
    let password = '';
    let confirmPassword = '';
    let error = '';

    async function handleRegister() {
        error = '';

        if (password !== confirmPassword) {
            error = 'Passwords do not match';
            return;
        }

        const res = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, password })
        });

        const data = await res.json();

        if (!res.ok) {
            error = data.error || 'Registration failed';
            return;
        }

        goto('/dashboard');
    }
</script>

<main>
    <h1>Register</h1>

    {#if error}
        <p class="error">{error}</p>
    {/if}

    <form on:submit|preventDefault={handleRegister}>
        <label>
            Username:
            <input type="text" bind:value={name} required />
        </label>

        <label>
            Password:
            <input type="password" bind:value={password} required />
        </label>

        <label>
            Confirm Password:
            <input type="password" bind:value={confirmPassword} required />
        </label>

        <button type="submit">Register</button>
    </form>
</main>

<style>
    main {
        max-width: 400px;
        margin: 2rem auto;
        padding: 2rem;
        border: 1px solid #ddd;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        background-color: #fafafa;
    }

    h1 {
        text-align: center;
        margin-bottom: 1rem;
    }

    form {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    label {
        display: flex;
        flex-direction: column;
        font-size: 0.9rem;
        color: #333;
    }

    input {
        padding: 0.5rem;
        border: 1px solid #ccc;
        border-radius: 4px;
        font-size: 1rem;
    }

    button {
        padding: 0.6rem;
        background-color: #0077cc;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-weight: bold;
    }

    button:hover {
        background-color: #005fa3;
    }

    .error {
        color: red;
        text-align: center;
        font-size: 0.95rem;
        margin-bottom: 0.5rem;
    }
</style>
