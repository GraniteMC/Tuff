<script lang="ts">
    import { Toasts } from 'svoast';

    import Blurrer from "$lib/Components/Blurrer.svelte";

    import './styles.scss'

</script>

<Toasts position="bottom-right"/>
<Blurrer blur="12px" />

<div class="app">
    
    <slot />

</div>

<style lang="scss">
    .app {
        z-index: 5;        

        display: grid;
        place-items: center;

        min-height: 100vh;
        height: 100vh;
    }
</style>