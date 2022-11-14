<script setup lang="ts">
	/*********************************************************
	prog name: 會員合約, author: James Lin, date: 2022/09/27
	To Do: 發佈日期與下架日期改格式
	**********************************************************/
	import { ref, onMounted } from "vue"
	import { useFetch } from "@vueuse/core"

	const liwaData = ref([])

	const loadData = async () => {
		let sAPIsvr = window.sessionStorage.getItem('liwaAPIsvr')
		let url = `${sAPIsvr}/WTerms_edit.php`
		const data = await useFetch(url, {method: 'GET'}, {refetch: true}).get().json()
		liwaData.value = data.data.value.arrSQL[0]
		console.log('liwaData = ', liwaData.value)		
	}

	onMounted(() => {
		loadData()
	})

	definePageMeta({
	  title: '會員合約',
	  layout: "web",
	})		

</script>

<template>
	<div class="w-full lg:w-[900px] mx-auto my-4" v-html="liwaData.parag1"></div>
</template>

<style scope>
	h2 {
		font-size:2rem;
		font-weight: bold;
		margin: 1rem 0;
	}
</style>