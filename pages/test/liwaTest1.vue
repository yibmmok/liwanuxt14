<script setup lang="ts">
	/*********************************************************
	prog name: 測試liwaUpload 元件, author: James Lin, date: 2022/11/22
	To Do: 
	**********************************************************/
	import { ref, onMounted } from "vue"
	import liwaUpload from "../../components/liwaUpload"

	const liwaData = ref(['/tmp/11231543/iching101402.png', '/tmp/11231543/iching101401.png', '/tmp/11231543/iching101403.png'])

	const setFiles = (arrFiles) => {
		if (liwaData.value.length > 0) {
			// 先刪除 liwaData 的所有elements
			for (let i=0; i<liwaData.value.length; i++) {
				liwaData.value.pop()
			}
		}
		liwaData.value = [...arrFiles]
		console.log('liwaData =', liwaData.value, '; arrFiles =', arrFiles)

	}

	onMounted(() => {
		
	})

	definePageMeta({
	  title: 'liwaUpload 測試',
	  layout: "default",
	})		

</script>

<template>
	<div class="w-full h-[calc(100vh_-_7.5rem)] bg-gray-100">
		<div class="w-[900px] h-full mx-auto my-0 bg-white">
			<liwaUpload 
				:mainID="'11231543'" 
				:liwaFiles="liwaData"
				:imgboxCSS="'h-96'"
				:fieldLabel="'上傳附圖'"
				:phpurl="'/testUpload.php'"
				:sAccept="'image/*'"
				@setFiles="setFiles"
			/>			
		</div>

	</div>
</template>