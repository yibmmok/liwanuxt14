<template>
    <div>
        <TheHeader />
    </div>
    <div class="w-full min-h-[calc(100vh_-_11rem)] md:min-h-[calc(100vh_-_7rem)]">
        <slot></slot>
    </div>
    <!-- <div class="testBox"></div> -->
    <TheFooter />
</template>

<script setup>
const route = useRoute()

useMeta({
  title: computed(() => `珠寶交易中心 - ${route.meta.title}`)
})
	
</script>

<script>
import TheFooter from "~/components/TheFooter_web.vue"
import TheHeader from "~/components/TheHeader_web.vue"

export default {
    components: { TheHeader, TheFooter }
}
</script>
