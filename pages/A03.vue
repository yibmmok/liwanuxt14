<script setup lang="ts">
	import { ref, onMounted } from 'vue'
	import { useStorage, useTitle, useTimestamp, useFetch } from "@vueuse/core"
	import queryString from "query-string"
	// import jwtDecode from "jwt-decode"

	const APIsvr = ref('')
	const progName = ref('表單庫')
	const detailFlg = ref(false)
	const detailKey = ref('')
	const actvIdx = ref('')

	const liwaData = ref({})

	const toggleChecked = () => {
		isChecked.value = !isChecked.value
	}

	const toggleBookmark = () => {
		isBookmark.value = !isBookmark.value
	}

	const loadData = async () => {
		let sJWT = window.localStorage.getItem('liwaJWT')
		if ((sJWT == 'undefined') || (sJWT == "") || (sJWT == null)) {
			window.location.href = '/NoAuth'
		} else {
			let keydata = {
				'JWT': sJWT
			}
			let sQuery = queryString.stringify(keydata)		
			let url = `${APIsvr.value}/A03_getProgs.php?${sQuery}`
			const data = await useFetch(url, {method: 'GET'}, {refetch: true}).get().json()
			liwaData.value = data.data.value.arrSQL
		}
	}

	const jumpLink = (slink) => {
		window.location.href = slink
	}

	const jumpProg = (idx) => {
		let slink = liwaData.value[idx].slink
		window.location.href = slink
	}

	const toggleMenuBox = (idx) => {
		// 先將liwaData 所有的 isMenuBox設為 0
		liwaData.value.forEach((n1) => {
			n1.isMenuBox = 0
		})
		if (actvIdx.value !== idx) {
			let res = liwaData.value.filter((n) => n.progID == idx)
			res[0].isMenuBox = 1
			actvIdx.value = idx
		} 
	}

    onMounted(() => {
    	useHead({title:'表單庫'})
    	APIsvr.value = window.sessionStorage.getItem('liwaAPIsvr')
    	// liwaJWT 已存在, 先檢查liwaJWT是否過期, 若過期, 先重設, 並回傳新的JWT
    	// chkJWT()
    	loadData()
    })	

 	// definePageMeta({
	//   layout: 'default',
	//   colorMode: 'light'
	// })   
</script>

<template>
<NuxtLayout name="default">	
<banner
	:progname="progName"
	:detailflg="detailFlg"
	:detailkey="detailKey"
></banner>
<div class="w-full h-full flex flex-row flex-wrap mt-4">
	<div v-for="(prog, index) in liwaData" :key="index" :data-id="prog.progID"
		class="w-28 h-32 mx-4 my-3 bg-white text-xl text-center cursor-pointer relative border-2 border-slate-500 shadow-lg shadow-slate-500/40 relative"
	>
		<div class="flex flex-col justify-center" @click="jumpProg(index)">
			<div class="w-full h-24">
				<img :src="prog.imgPath" width="80" class="mx-auto mt-1"/>
			</div>
			<div class="w-full h-8 text-sm">{{ prog.LMName }}</div>
		</div>
		<div class="w-6 h-6 border-2 absolute -top-[15px] -left-[10px] cursor-pointer bg-slate-200 font-bold text-sm cursor-pointer"
		@click.stop="toggleMenuBox(prog.progID)"
		>...</div>		
		<div 
			v-if="prog.bUnread > 0"			
			class="w-8 h-8 bg-red-400 border-2 absolute -top-[15px] -right-[15px] rounded-full text-white text-sm pt-1">{{ prog.bUnread }}</div>
		<div 
			v-if="prog.isMenuBox==1"
			class="w-20 h-8 border-2 border-slate-500 absolute -left-[3px] top-[10px] bg-white"
			>
			<ul class="p-0 m-1 list-none">
				<li 
					class="pl-2 cursor-pointer text-sm text-slate-600"
					@click="toggleShortCut(prog.progID)"
				>
					<div class="relative">
						<div v-if="prog.isShortcut==1"
							class="absolute top-[5px] -left-[12px]"
						>
							<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="15px" height="15px" viewBox="-20 50 405.272 405.272" style="enable-background:new -20 50 405.272 405.272;"
								 xml:space="preserve">
								<g style="fill:#F30;stroke:#F30;stroke-width:6px;stroke-linecap:round;stroke-linejoin:round;">
									<path d="M393.401,124.425L179.603,338.208c-15.832,15.835-41.514,15.835-57.361,0L11.878,227.836
										c-15.838-15.835-15.838-41.52,0-57.358c15.841-15.841,41.521-15.841,57.355-0.006l81.698,81.699L336.037,67.064
										c15.841-15.841,41.523-15.829,57.358,0C409.23,82.902,409.23,108.578,393.401,124.425z"/>
								</g>
							</svg>							
						</div>						
						<span class="ml-1">快捷按鈕</span>
					</div>
				</li>
			</ul>
		</div>		
	</div>	
</div>
</NuxtLayout>
</template>
