<script lang="ts">
    import { goto } from '$app/navigation';

    let name = '';
    let password = '';
    let error = '';

    async function handleLogin() {
        error = '';

        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, password })
        });

        const data = await res.json();

        if (!res.ok) {
            error = data.error || 'Login failed';
            return;
        }

        goto('/dashboard');
    }
</script>

<h1>Login</h1>

{#if error}
    <p class="error">{error}</p>
{/if}

<form on:submit|preventDefault={handleLogin}>
    <label>Username:
        <input type="text" bind:value={name} required />
    </label>

    <label>Password:
        <input type="password" bind:value={password} required />
    </label>

    <button type="submit">Login</button>
</form>

<style>
    h1 {
        text-align: center;
        margin-top: 2rem;
        margin-bottom: 1rem;
    }

    form {
        width: 300px;
        margin: 0 auto;
        display: flex;
        flex-direction: column;
        gap: 1rem;
        padding: 1.5rem;
        border: 1px solid #ccc;
        border-radius: 8px;
        background-color: #f4f4f4;
    }

    label {
        display: flex;
        flex-direction: column;
        font-size: 1rem;
    }

    input {
        padding: 0.4rem;
        font-size: 1rem;
        border: 1px solid #bbb;
        border-radius: 4px;
    }

    button {
        padding: 0.5rem;
        font-size: 1rem;
        background-color: #0077cc;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
    }

    button:hover {
        background-color: #005fa3;
    }

    .error {
        color: red;
        text-align: center;
        margin-bottom: 1rem;
    }
</style>
