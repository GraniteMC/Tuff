<script lang="ts">
    
    export let path = "/"

    let href = `/?path=${path}`

</script>

<a target="_self" {href}>
    <slot />
</a>

<style lang="scss">
    a {
        color: inherit;
    }
</style>