<script lang="ts">
    import { onMount } from 'svelte';

    let entries: { timestamp: string; message: string }[] = [];
    let fetchError = '';

    onMount(async () => {
        try {
            const response = await fetch('/api/logs');
            const result = await response.json();

            if (!response.ok) {
                fetchError = result.error || 'Unable to load activity history.';
                return;
            }

            entries = result;
        } catch (err) {
            console.error('Log fetch failed:', err);
            fetchError = 'Something went wrong while loading logs.';
        }
    });
</script>

<h1>📖 Activity History</h1>

{#if fetchError}
    <p class="alert">{fetchError}</p>
{:else if entries.length === 0}
    <p>No activity has been recorded yet.</p>
{:else}
    <ul class="history-list">
        {#each entries as entry}
            <li>
                <span class="log-time">{new Date(entry.timestamp).toLocaleString()}</span>
                <span class="log-text">{entry.message}</span>
            </li>
        {/each}
    </ul>
{/if}

<style>
    h1 {
        text-align: center;
        margin-top: 2rem;
        margin-bottom: 1rem;
    }

    .alert {
        color: crimson;
        text-align: center;
        font-weight: bold;
    }

    .history-list {
        max-width: 650px;
        margin: 0 auto;
        padding: 0;
        list-style: none;
    }

    .history-list li {
        background-color: #f0f0f0;
        border: 1px solid #ccc;
        padding: 1rem;
        margin-bottom: 1rem;
        border-radius: 6px;
    }

    .log-time {
        font-size: 0.85rem;
        color: #777;
        display: block;
        margin-bottom: 0.4rem;
    }

    .log-text {
        font-size: 1rem;
        color: #222;
    }
</style>
