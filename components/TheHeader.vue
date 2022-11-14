.<script setup lang="ts">
	/*********************************************************
	prog name: 頁首, author: James Lin, date: 2022/09/01

	**********************************************************/
	import { ref, onMounted, computed } from 'vue'
	import { useFetch, useStorage, useSessionStorage } from "@vueuse/core"
	import jwtDecode from "jwt-decode"
	import jsonData from "../static/init.json"

	// const { $rmallSessionStorage } = useNuxtApp()
	const bLogin = ref(false)
	const bIcon = ref(false)
	const objLogo = ref('')

	const siteID = ref('')
	const siteName = ref('')
	const siteIcon = ref('../static/logo_square.png')
	const userIcon = ref('')
	const APIsvr = ref('')

	const route = useRoute() // Nuxt 3 native function

	const jumpPage = () => {
		return '/A03'
	}

	const logout = () => {
		let sSiteID = window.sessionStorage.getItem('liwaSiteID')
		if (sSiteID !== 'sys') {
			window.sessionStorage.setItem('liwaSiteIcon', "")
			window.sessionStorage.setItem('liwaSiteName', 'Liwasite')
			window.sessionStorage.setItem('liwaAuth', "")
			window.sessionStorage.setItem('liwaUGroupID', "")
			window.sessionStorage.setItem('liwaUGroupName', "")
			window.sessionStorage.setItem('liwaSiteID', 'sys')
			window.location.href="/Profile"
		} else {
			window.sessionStorage.setItem('liwaUserID', "")
			window.sessionStorage.setItem('liwaUserName', "")
			window.sessionStorage.setItem('liwaUserIconPath', "")
			window.sessionStorage.setItem('liwaImgsvr', "")
			window.sessionStorage.setItem('liwaAPIsvr', "")
			window.localStorage.setItem('liwaJWT', '')
			window.location.href="/"
		}		
	}

	const goLink = () => {
		// let AA = (siteID.value == 'sys')? '/': '/A03'
		return (siteID.value == 'sys')? '/': '/A03'
	}

	const goProfile = () => {
		window.location.href='/Profile'
	}

	const getUserIcon = computed(() => {
		return window.sessionStorage.getItem('liwaUserIconPath')
	})
	
	onMounted(() => {
	    // 先檢查 APIsvr是否存在? 若不存在, 從init.json取得
	    let sAPIsvr = window.sessionStorage.getItem('liwaAPIsvr')
	    if ((sAPIsvr == undefined) || (sAPIsvr == "") || (sAPIsvr == null)) {
	      APIsvr.value = jsonData[0].APIsvr
	      window.sessionStorage.setItem('liwaAPIsvr', APIsvr.value)
	    }		
		// 檢查是否已登入?(sessionStorage(liwa_JWT))	
    	let sJWT = window.localStorage.getItem('liwaJWT')
    	siteID.value = window.sessionStorage.getItem('liwaSiteID')
    	siteName.value = (siteID.value == 'sys')? 'Liwasite': window.sessionStorage.getItem('liwaSiteName')
    	if ((sJWT == undefined) || (sJWT == "") || (sJWT == null) ) {
    		siteName.value = 'Liwasite'
    		// 將 liwaSiteID設為sys
    		if ((siteID.value == undefined) || (siteID.value == "") || (siteID.value == null)) 
    			useStorage('liwaSiteID', 'sys', sessionStorage)
    	} else {
    		bLogin.value = true
    		let sUserID = window.sessionStorage.getItem('liwaUserID')
    		if (sUserID == null) {
    			// 若 sessionStorage.userID 為空, 解liwaJWT
	    		var arrJWT = jwtDecode(sJWT)
	    		useStorage('liwaUserID', arrJWT.sub, sessionStorage)
	    		useStorage('liwaUserName', arrJWT.username, sessionStorage)
	    		useStorage('liwaIconPath', arrJWT.iconPath, sessionStorage)
	    		useStorage('liwaSiteID', arrJWT.siteID, sessionStorage)
	    		useStorage('liwaSiteIcon', arrJWT.siteIcon, sessionStorage)
	    		useStorage('liwaSiteName', arrJWT.siteName, sessionStorage)
	    		useStorage('liwaAuth', arrJWT.auth, sessionStorage)
	    		useStorage('liwaUGroupID', arrJWT.uGroupID, sessionStorage)
	    		useStorage('liwaUGroupName', arrJWT.uGroupName, sessionStorage)
	    		useStorage('liwaImgsvr', arrJWT.imgsvr, sessionStorage)
	    		useStorage('liwaAPIsvr', arrJWT.apisvr, sessionStorage)
	    		userIcon.value = arrJWT.iconPath
	    		if (arrJWT.siteID !== 'sys') {
	    			siteIcon.value = arrJWT.imgsvr + arrJWT.siteIcon
	    			siteName.value = arrJWT.siteName
	    		} else {
	    			siteIcon.value = arrJWT.imgsvr+'/syspics/logo_square.png'
	    		}

    		} else {
    			userIcon.value = window.sessionStorage.getItem('liwaSiteIcon')
    			siteIcon.value = window.sessionStorage.getItem('liwaImgsvr') + window.sessionStorage.getItem('liwaSiteIcon')
    		} 
    		bLogin.value = true
    	} 
	})
</script>

<template>
	<div class="headPanel w-full h-32 md:h-[4.5rem] bg-gradient-to-r from-indigo-900 to-violet-200 flex flex-col md:flex-row justify-center">
		<div class="logoPanel w-full pt-2 pl-3 md:w-[calc(100%_-_240px)]">
			<div class="w-[60px] float-left ring-1 ring-white rounded-sm bg-white mr-2 mt-1">
				<a :href="goLink()">
					<img :src="siteIcon" alt="logo of liwasite" class="mx-auto" width="50"/>
				</a>
			</div>
			<div class="float-left">
				<h1 class="text-4xl text-white pt-2">{{ siteName }}雲系統</h1>
			</div>
		</div>
		<div class="w-full md:float-right md:w-[240px]">
			<div v-if="bLogin" class="w-full flex flex-row-reverse justify-between mx-auto">
				<div class="sysIcon logout mx-1 mt-1" @click.prevent="logout()">
					<svg width="40px" height="40px" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" version="1.1" style="margin-top:5px;">
					  <g style="fill:none;stroke:#AE0100;stroke-width:12px;stroke-linecap:round;stroke-linejoin:round;">
					    <path d="m 50,10 0,35"/>
					    <path d="M 26,20 C -3,48 16,90 51,90 79,90 89,67 89,52 89,37 81,26 74,20"/>
					  </g>
					</svg>					
				</div>
				<a :href="jumpPage()">
					<div class="sysIcon help mx-1 mt-1">
						<svg width="50px" height="50px" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
							<path d="M256,80A176,176,0,1,0,432,256,176,176,0,0,0,256,80Z" style="fill:none;stroke:#000;stroke-miterlimit:10;stroke-width:32px"/>
							<path d="M200,202.29s.84-17.5,19.57-32.57C230.68,160.77,244,158.18,256,158c10.93-.14,20.69,1.67,26.53,4.45,10,4.76,29.47,16.38,29.47,41.09,0,26-17,37.81-36.37,50.8S251,281.43,251,296" style="fill:none;stroke:#000;stroke-linecap:round;stroke-miterlimit:10;stroke-width:28px"/>
							<circle cx="250" cy="348" r="20"/>
						</svg>					
					</div>
				</a>
				<div class="sysIcon search mx-1 mt-3">
					<svg version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
						 viewBox="0 0 487.95 487.95" style="enable-background:new 0 0 487.95 487.95;" xml:space="preserve" width="35px" height="35px">
							<path d="M481.8,453l-140-140.1c27.6-33.1,44.2-75.4,44.2-121.6C386,85.9,299.5,0.2,193.1,0.2S0,86,0,191.4s86.5,191.1,192.9,191.1 								c45.2,0,86.8-15.5,119.8-41.4l140.5,140.5c8.2,8.2,20.4,8.2,28.6,0C490,473.4,490,461.2,481.8,453z M41,191.4 c0-82.8,68.2-150.1,151.9-150.1s151.9,67.3,151.9,150.1s-68.2,150.1-151.9,150.1S41,274.1,41,191.4z"/>
					</svg>					
				</div>
				<div class="sysIcon userIcon mx-1 mt-2" @click="goProfile()">
					<img v-if="bIcon" :src="getUserIcon()" width="42" height="42" />
					<svg v-else version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
						 viewBox="0 0 459 459" style="enable-background:new 0 0 459 459;" xml:space="preserve" width="42px" height="42px">
						<g style="fill:#BBB;stroke:#333;stroke-width:12px;stroke-linecap:round;stroke-linejoin:round;">
							<path d="M229.5,0C102.53,0,0,102.845,0,229.5C0,356.301,102.719,459,229.5,459C356.851,459,459,355.815,459,229.5
									C459,102.547,356.079,0,229.5,0z M347.601,364.67C314.887,393.338,273.4,409,229.5,409c-43.892,0-85.372-15.657-118.083-44.314
									c-4.425-3.876-6.425-9.834-5.245-15.597c11.3-55.195,46.457-98.725,91.209-113.047C174.028,222.218,158,193.817,158,161
									c0-46.392,32.012-84,71.5-84c39.488,0,71.5,37.608,71.5,84c0,32.812-16.023,61.209-39.369,75.035
									c44.751,14.319,79.909,57.848,91.213,113.038C354.023,354.828,352.019,360.798,347.601,364.67z"/>
						</g>
					</svg>
				</div>
			</div>
			<div v-else class="mt-3">
				<a href="/login">
					<div class="sysIcon login w-[80px]">登入</div>
				</a>
				<a href="/regis">
					<div class="sysIcon regis w-[80px]">註冊</div>
				</a>
			</div>
		</div>
	</div>
</template>

<style scoped>
	.sysIcon {
		height:40px;
		/*margin:0px 4px 4px 10px;*/
		float:right;
		text-align:center;
		font-weight:bold;
		padding-top:0.35rem;
		box-sizing: border-box;
		cursor:pointer;		
	}

	.sysIcon.regis {
		background-color: #555;
		color:#DDD;
		border: 1px solid #555;
		border-radius: 10%;
	}	
</style>