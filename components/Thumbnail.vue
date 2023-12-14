<script setup>
import { ref, toRefs } from 'vue'
import { Thumbs } from 'swiper'
import { Swiper, SwiperSlide } from 'swiper/vue'

const props = defineProps({
  currentSlide: Number,
  liwaData: Array,
  liwaClass: String,
  liwaDirection: String,
})

const { liwaDirection, liwaClass } = toRefs(props)

const emit = defineEmits(['thumbs', 'update:currentSlide'])

const slideClick = (idx) => {
	console.log('Slide index =', idx)
	emit('update:currentSlide', idx)
}

const onSwiper = (swiper) => {
  emit('thumbs', swiper)
}
</script>

<template>
  <Swiper @swiper="onSwiper" :slides-per-view="4" :space-between="5" :modules="[Thumbs]" watch-slides-progress :direction="liwaDirection" :class="liwaClass">
    <SwiperSlide v-for="(pic, index) in liwaData" :key="index" @click.stop="slideClick(index)">
      <img :src="pic.img" style="height: 100px" />
    </SwiperSlide>
  </Swiper>
</template>