<script lang="ts">
    import { currentUser } from '$lib/stores';
    import { goto } from '$app/navigation';
    import { writable } from 'svelte/store';

    let userData = $currentUser;

    $: userData = $currentUser;

    const notice = writable<string | null>(null);

    async function handleLogout() {
        try {
            const response = await fetch('/api/logout', { method: 'POST' });

            if (response.ok) {
                currentUser.set(null);
                notify('✅ You have been logged out.');
                await goto('/login');
            } else {
                console.error('Logout failed');
            }
        } catch (err) {
            console.error('Logout error:', err);
        }
    }

    function notify(msg: string) {
        notice.set(msg);
        setTimeout(() => notice.set(null), 3000);
    }
</script>

<header>
    <nav class="menu">
        <a href="/">🏠</a>

        {#if userData}
            <a href="/dashboard">My Pets</a>
            <a href="/shop">Shop</a>

            {#if userData.role === 'admin'}
                <a href="/admin">Admin</a>
                <a href="/logs">Logs</a>
            {/if}

            <span class="username">{userData.name}</span>
            <button on:click={handleLogout}>Logout</button>
        {:else}
            <a href="/login">Login</a>
            <a href="/register">Register</a>
        {/if}
    </nav>

    {#if $notice}
        <div class="toast">{$notice}</div>
    {/if}
</header>

<slot />

<style>
    header {
        border-bottom: 1px solid #ccc;
        background-color: #f4f4f4;
        padding: 1rem 0;
    }

    .menu {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 0 1rem;
    }

    .menu a {
        color: #222;
        text-decoration: none;
    }

    .menu button {
        background: none;
        border: none;
        color: #0077cc;
        cursor: pointer;
    }

    .menu button:hover {
        text-decoration: underline;
    }

    .username {
        margin-left: auto;
        font-weight: bold;
    }

    .toast {
        position: fixed;
        top: 1rem;
        right: 1rem;
        background-color: #222;
        color: #fff;
        padding: 0.75rem 1.25rem;
        border-radius: 6px;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
        animation: fadeIn 0.3s ease-out, fadeOut 0.5s ease-in 2.5s;
        z-index: 999;
    }

    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
    }

    @keyframes fadeOut {
        from { opacity: 1; transform: translateY(0); }
        to { opacity: 0; transform: translateY(-10px); }
    }
</style>
