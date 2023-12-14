<script setup lang="ts">
  /*********************************************************
  prog name: 使用者註冊, author: James Lin, date: 2020/05/09
  Todo: 0509-待完成 sys_login.php 的回傳及設定storage

  **********************************************************/
	import { ref, onMounted} from "vue"
	import { useFetch, createFetch, useStorage } from "@vueuse/core"
	import queryString from "query-string"

	const APIsvr = ref('')
	const submitted = ref(false)
	const liwaData = ref({
		"usermail":"", 
		"password":"", 
		"jwttoken":"",
		'siteKey': '6LfXLuwjAAAAAFXbAQPm82-X6ArjiMcEIEelQTXZ'
	})
	const res = ref({})
	const msg = ref('')

	const submitlogin = async () => {
		// liwaData 加入jwttoken pair
		let jwt = window.localStorage.getItem('liwaJWT')
		liwaData.value.jwttoken = ((jwt == 'undefined') || (jwt == '') || (jwt == null))? '' : jwt
		let datastr = JSON.stringify(liwaData.value)
	console.log('datastr =', datastr)
		const useMyFetch = createFetch({
		  baseUrl: APIsvr.value,
		  options: {},
		  fetchOptions: {
		    mode: 'cors',
		    headers: new Headers({
		      'Content-Type': 'multipart/form-data'
		    }),
		    body: JSON.stringify(liwaData.value)
		  }
		})

		const { data } = await useMyFetch('sys_login.php').post().json()
		if (data.value.arrSQL.length > 0) res.value = data.value.arrSQL[0]
		if (res.value.message == "") {
			// Login 成功, 先設定 sessionStorage
			window.localStorage.setItem('liwaJWT', res.value.token)
			window.sessionStorage.setItem('liwaUserIconPath', res.value.iconPath)	
			// 跳到 Profile
			window.location.href=`/Profile`
		} else {
			msg.value = res.value.message
		}
	}

	const resetPswd = async () => {
		// 重設密碼, 先取得已輸入的手機號碼
		let sUsermail = liwaData.value.usermail
		if (sUsermail) {
			let passData = {
				'usermail': sUsermail
			}
			let datastr = JSON.stringify(passData)
		    const useMyFetch = createFetch({
		      baseUrl: APIsvr.value,
		      fetchOptions: {
		        mode: 'cors',
		        headers: new Headers({
		          'Content-Type': 'multipart/form-data'
		        }),
		        body: datastr
		      }
		    })
		    const { data } = await useMyFetch('sys_resetPSWD.php').post().json()
		    // 回傳2個結果: 1.發送成功, 2.發送失敗, 都顯示在msg
		    let sMsg = data.value.message
		    if (sMsg) msg.value = data.value.message
		    else msg.value = data.value.key
		} else {
			msg.value = '請輸入註冊時的email'
		}
	}	

	// definePageMeta({
	//   layout: 'default',
	//   colorMode: 'light'
	// })  

	onMounted(() => {
		useHead({title:'登入頁'})
		APIsvr.value = window.sessionStorage.getItem('liwaAPIsvr')
	})
</script>

<template>
<NuxtLayout name="default">	
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
			<div class="w-1/2 h-8 bg-white text-left pl-4" @click="resetPswd()">
				忘記密碼
			</div>
			<div class="w-1/2 h-8 text-red-400 text-right pr-4">
				<NuxtLink to="/regis">
					<div>註冊</div>
				</NuxtLink>				
			</div>
		</div>
	</div>  
</div>
</NuxtLayout>
</template>