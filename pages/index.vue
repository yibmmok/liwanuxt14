<script setup lang="ts">
	/*********************************************************
	prog name: 首頁, author: James Lin, date: 2020/05/11
	主功能: 

	**********************************************************/

	import { ref, reactive, onMounted } from "vue"
	import { useStorage, useTimestamp } from "@vueuse/core"
	import queryString from "query-string"
	import jsonData from "../static/init.json"
	// import jwtDecode from "jwt-decode"


	const liwaUserData = ref([]) as any
	const APIsvr = ref('')
	const Imgsvr = ref('')
	const route = useRoute()

	// const chkTime = () => {
	// 	const timestamp = useTimestamp({interval:1000})
	// 	let sJWT = window.localStorage.getItem('liwaJWT')
	// 	var arrJWT = jwtDecode(sJWT)
	// 	var jwtTime = arrJWT.exp
	// 	text.value = timestamp.value + ';' + jwtTime
		
	// }

	const getPhoto = (imode) => {
		let AA = ''
		switch (imode) {
			case 1:
				AA = Imgsvr.value + '/syspics/BackImg_sm.jpg'
				break
			case 2:
				AA = Imgsvr.value + '/syspics/BackImg_md.jpg'
				break
			case 0:
				AA = Imgsvr.value + '/syspics/BackImg_lg.jpg'
				break
		}
		return AA
	}

	onMounted(() => {
		useHead({title:'首頁'})
		let sAPIPath = window.sessionStorage.getItem('liwaAPIsvr')
		if ((sAPIPath == null) || (sAPIPath == undefined) || (sAPIPath == "")) {
			// APIsvr.value = jsonData[0].APIsvr
			window.sessionStorage.setItem('liwaAPIsvr', jsonData[0].APIsvr)
	    window.sessionStorage.setItem('liwaImgsvr', jsonData[0].imgSvr)
	    window.sessionStorage.setItem('liwaSearchsvr', jsonData[0].Meilisvr)
	    // Imgsvr.value = jsonData[0].imgSvr			
		}
		APIsvr.value = window.sessionStorage.getItem('liwaAPIsvr')
		Imgsvr.value = window.sessionStorage.getItem('liwaImgsvr')
	})
</script>

<template>
	<NuxtLayout name="default">
<!--     <div>
        <TheHeader />
    </div> -->	
    <div class="w-full min-h-[calc(100vh_-_11rem)] md:min-h-[calc(100vh_-_7rem)] relative">
		<picture>
			<source class="w-full" media="(min-width:800px)" :srcset="getPhoto(0)">
			<source class="w-full" media="(min-width:650px)" :srcset="getPhoto(2)">
			<source class="w-full" media="(min-width:320px)" :srcset="getPhoto(1)">
			<img :src="getPhoto(0)" alt="liwaSite 首頁" class="w-full h-[calc(100vh_-_100px)]" />
		</picture> 
		<div class="absolute py-2 right-4 top-4 text-yellow-300 text-2xl md:text-4xl lg:text-8xl">為您打造雲端客製化系統</div>
    </div>
	<!-- <TheFooter /> -->
	</NuxtLayout>
</template>
