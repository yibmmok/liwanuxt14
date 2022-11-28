<script setup lang="ts">
	/*********************************************************
	prog name: 測試liwaUpload 元件, author: James Lin, date: 2022/11/22
	To Do: 
	**********************************************************/
	import { ref, onMounted } from "vue"
	import liwaScore from "../../components/liwaScore"

	const sGemSys = ref('')

	const setScore = (state) => {
		console.log('state =', state)
	}

	const testProc = () => {

	}

	onMounted(() => {
		
	})

	definePageMeta({
	  title: 'liwaScore 測試',
	  layout: "default",
	})		

</script>

<template>
	<div class="w-full h-auto bg-gray-100">
		<div class="w-[900px] h-full mx-auto my-0 bg-white">
			<liwaScore 
				@setScore="setScore"
			/>		
		</div>
	</div>

</template>