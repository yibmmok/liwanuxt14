<script setup lang="ts">
  /*********************************************************
  prog name: 使用者註冊, author: James Lin, date: 2020/05/09
  Todo: 0509-待完成 sys_login.php 的回傳及設定storage

  **********************************************************/
	import { ref, onMounted} from "vue"
	import { useFetch, createFetch, useStorage } from "@vueuse/core"

	const submitted = ref(false)
	const liwaData = ref({})
	const res = ref({})
	const msg = ref('')

	const submitlogin = async () => {
		// liwaData 加入jwttoken pair
		const jwt = useStorage('liwaJWT')
		liwaData.value.jwttoken = ((jwt.value === 'undefined') || (jwt.value === ""))? '' : jwt.value
		let datastr = JSON.stringify(liwaData.value)
		const useMyFetch = createFetch({
		  baseUrl: 'http://172.18.2.13',
		  options: {},
		  fetchOptions: {
		    mode: 'cors',
		    headers: new Headers({
		      'Content-Type': 'application/json; charset=utf-8'
		    }),
		    body: JSON.stringify(liwaData.value)
		  }
		})

		const { data } = await useMyFetch('sys_login.php').post().json()
		if (data.value.arrSQL.length > 0) res.value = data.value.arrSQL[0]
		if (res.value.message == "") {
			// Login 成功, 先設定 sessionStorage
			window.localStorage.setItem('liwaJWT', res.value.token)
			window.sessionStorage.setItem('liwaUserID', res.value.userID)
			window.sessionStorage.setItem('liwaUserName', res.value.username)
			window.sessionStorage.setItem('liwaIconPath', res.value.iconPath)
/*
			useStorage('liwaUserID', res.value.userID, sessionStorage)
			useStorage('liwaUserName', res.value.username, sessionStorage)
			useStorage('liwaIconPath', res.value.iconPath, sessionStorage)
*/			
			if (res.value.siteID) {
				// useStorage('liwaSiteID', res.value.siteID, sessionStorage)
				window.sessionStorage.setItem('liwaSiteID', res.value.siteID)
				window.sessionStorage.setItem('liwaSiteIcon', res.value.siteIcon)
				window.sessionStorage.setItem('liwaSiteName', res.value.siteName)
				window.sessionStorage.setItem('liwaAuth', res.value.auth)
				window.sessionStorage.setItem('liwaUGroupID', res.value.uGroupID)
				window.sessionStorage.setItem('liwaUGroupName', res.value.uGroupName)
				window.sessionStorage.setItem('liwaImgsvr', res.value.imgsvr)
				window.sessionStorage.setItem('liwaAPIsvr', res.value.apisvr)
/*				
				useStorage('liwaSiteIcon', res.value.siteIcon, sessionStorage)
				useStorage('liwaSiteName', res.value.siteName, sessionStorage)
				useStorage('liwaAuth', res.value.auth, sessionStorage)
				useStorage('liwaUGroupID', res.value.uGroupID, sessionStorage)
				useStorage('liwaUGroupName', res.value.uGroupName, sessionStorage)
				useStorage('liwaImgsvr', res.value.imgsvr, sessionStorage)
				useStorage('liwaAPIsvr', res.value.apisvr, sessionStorage)
*/
				//跳到 A03
				window.location.href=`/A03`
			} else {
				window.sessionStorage.setItem('liwaSiteID', 'sys')
				window.sessionStorage.setItem('liwaImgsvr', res.value.imgsvr)
				window.sessionStorage.setItem('liwaAPIsvr', res.value.apisvr)
/*
				useStorage('liwaSiteID', 'sys', sessionStorage)
				useStorage('liwaImgsvr', res.value.imgsvr, sessionStorage)
				useStorage('liwaAPIsvr', res.value.apisvr, sessionStorage)
*/				
				// 跳到 Profile
				window.location.href=`/Profile`
			}
		} else {
			msg.value = res.value.message
		}
	}

	definePageMeta({
	  title: 'LiwaSite 登入頁',
	})  
</script>

<template>
<div class="w-full h-[calc(100vh_-_8rem)] bg-slate-200 flex justify-center items-start">
	<div class="mt-2 pt-4 bg-white">
		<div class="bg-white m-2 rounded-xl max-w-sm pb-1">
			<div class="bg-white px-10 py-5 w-screen shadow-md max-w-sm">
				<h1 class="text-center text-2xl font-semibold text-gray-600">登入</h1>
			</div>
		</div>
		<FormKit 
		form-class="px-4 py-2 bg-yellow-200 rounded-2xl w-11/12"
		v-model="liwaData"
		type="form"
		:form-class="submitted? 'hidden': 'block'"
		style="margin: 1rem auto;"
		submit-label="登入"
		@submit="submitlogin"
		>
	        <FormKit
	          name="usermail"
	          label="帳號"
	          type="email"
	          placeholder="user@example.com"
	          help="請輸入登入帳號"
	          validation="required|email"
	        />
	        <FormKit
	          name="password"
	          label="密碼"
	          type="password"
	          help="請輸入密碼"
	          :validation="required"
	        />
		</FormKit>
		<div v-if="msg" class="w-full h-8 bg-white pl-4 text-red-400 mb-4">
			{{ msg }}
		</div>
		<div class="w-full flex flex-row justify-start text-indigo-400">
			<div class="w-1/2 h-8 bg-white text-left pl-4">
				<a href="">忘記密碼</a>
			</div>
			<div class="w-1/2 h-8 text-red-400 text-right pr-4">
				<NuxtLink to="/regis">
					<div>註冊</div>
				</NuxtLink>				
			</div>
		</div>
	</div>  
</div>
</template>