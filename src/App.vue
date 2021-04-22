<template>
    <div>
        <div class="router-nav">
            <router-link :to="{ name: 'one', params: {}, query: {id: 111}}">one</router-link>
            <router-link :to="{ name: 'two', params: {}, query: {id: 222}}">two</router-link>
            <router-link :to="{ name: 'three', params: {}}">three</router-link>
            <span @click="replace">replace</span>
        </div>
        <router-view/>
    </div>
</template>

<script>
export default {
    methods: {
        replace() {
            this.$router.replace({
                name: 'three', params: {}
            })
        }
    }
}
</script>

<style scoped>
.router-nav {
    display: flex;
    justify-content: space-evenly;
    align-content: center;
}
</style>