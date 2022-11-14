<script setup lang="ts">
	/*********************************************************
	prog name: 首頁, author: James Lin, date: 2020/05/11
	主功能: 

	**********************************************************/

	import { ref, reactive, onMounted } from "vue"
	import { useStorage, useTimestamp } from "@vueuse/core"
	import jwtDecode from "jwt-decode"
	import VueSocialSharing from "vue-social-sharing"

	const liwaUserData = ref([]) as any
	const route = useRoute()

	const text = ref('')

	console.log('router name =', route.name)
	const chkTime = () => {
		const timestamp = useTimestamp({interval:1000})
		let sJWT = window.localStorage.getItem('liwaJWT')
		var arrJWT = jwtDecode(sJWT)
		var jwtTime = arrJWT.exp
		text.value = timestamp.value + ';' + jwtTime
		
	}

	definePageMeta({
	  title: 'LiwaSite HomePage',
	  layout: false,
	})

	onMounted(() => {

	})

</script>

<template>
    <div>
        <TheHeader />
    </div>	
    <div class="w-full h-[calc(100vh_-_11rem)] md:h-[calc(100vh_-_7rem)]">
		<div class="barPanel ">
			<h1 class="mx-12 text-2xl">Hello Liwasite !</h1>
			<button class="ml-12 w-[120px] h-8 border border-blue-800" @click="chkTime()">Init Process</button>
		</div>   
		<div class="w-full h-24 pt-4 bg-slate-50">
			<ShareNetwork
				network="line"
				url="https://news.vuejs.org/issues/180"
			    title="Say hi to Vite! A brand new, extremely fast development setup for Vue."
			    description="This week, I’d like to introduce you to 'Vite', which means 'Fast'. It’s a brand new development setup created by Evan You."
			    quote="The hot reload is so fast it\'s near instant. - Evan You"
			    class="w-48 h-12 bg-green-500 m-4 p-4 rounded"
			>
				<i class="fab fah fa-lg fa-twitter"></i>
				<span>Share on Line</span>
			</ShareNetwork>
		</div>
		<pre lang="json">{{ text }}</pre>
    </div>
	<TheFooter />
</template>

<style src="@/assets/css/fa_icon.min.css" scoped></style>