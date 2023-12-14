<script setup lang="ts">
  /*********************************************************
  prog name: 使用者註冊, author: James Lin, date: 2020/04/20

  **********************************************************/
	import { ref, onMounted } from "vue"
  import { useFetch, createFetch } from "@vueuse/core"
  import queryString from "query-string"
  import liwaMsg from "../components/liwaMsg.vue"

  const APIsvr = ref('')
  const submitted = ref(false)
  const liwaData = ref({
    username:'',
    email:'',
    password:''
  })

  const register = async () => {
    let datastr = JSON.stringify(liwaData.value)

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

    const { data } = await useMyFetch('regis_edit.php').post().json()
    // const { data } = await useMyFetch('tmp_testPOST.php').post().json()
    let msg = data.message
    if (msg) {
      console.log('error message =', msg)
      showMsg('系統訊息', '系統程式錯誤: '+msg, 2)
    } else {
      submitted.value = true
    }
  }

  // 設定 liwaMsg starts
  const showMsg = (sTitle, sBody, iType = 1) => {
    objMsg.title = sTitle
    objMsg.body = sBody
    objMsg.modalType = iType
    isMsg.value = true
  }

  const hideMsg = () => {
    isMsg.value = false
  }

  const confirmOK = () => {
    isMsg.value = false
  } 
  // 設定 liwaMsg ends  
	
	// definePageMeta({
  //   layout: 'default',
  //   colorMode: 'light'
	// })

  onMounted(() => {
    useHead({title:'註冊頁'})
    APIsvr.value = window.sessionStorage.getItem('liwaAPIsvr')
  })
</script>

<template>
<NuxtLayout name="default">  
<div class="h-full bg-gradient-to-br from-blue-600 to-indigo-600 flex justify-center items-start w-full">
  <div class="pt-4">
    <div class="bg-white m-2 rounded-xl max-w-sm pb-1">
      <div class="bg-white px-10 py-5 w-screen shadow-md max-w-sm">
        <h1 class="text-center text-2xl font-semibold text-gray-600">會員註冊</h1>
      </div>                
      <FormKit 
        form-class="px-4 py-2 bg-yellow-200 rounded-2xl w-11/12"
        type="form"
        :form-class="submitted? 'hidden': 'block'"
        style="margin: 1rem auto;"
        submit-label="上傳"
        @submit="register"
      >
        <FormKit
          name="username"
          label="姓名"
          type="text"
          placeholder="請輸入姓名"
          help="可輸入中英文名字(字數限制100字)"
          validation="required"
          v-model="liwaData.username"
        />        
        <FormKit
          name="email"
          label="Email"
          type="text"
          placeholder="請輸入Email"
          help="可輸入中英文名字"
          validation="required|email"
          v-model="liwaData.email"
        />
        <FormKit
          name="pswd"
          label="密碼"
          type="password"
          help="請輸入密碼, 必須8字元以上, 必須含英文大小寫字元及數字"
          validation="required|alphanumeric:latin|length:8"
          :validation-messages="{
            length: '密碼長度必須8字元以上',
          }"
          v-model="liwaData.password"
        />
        <FormKit
          name="pswd_confirm"
          label="密碼確認"
          type="password"
          help="確認密碼"
          validation="required|confirm"
          validation-visibility="live"
        />
      </FormKit>
    </div>
    <div class="w-full max-w-sm" style="margin: 0 auto;">
      <pre wrap class="max-w-sm float-left">{{ liwaData }}</pre>
    </div>    
  </div> 
  <div v-if="submitted">
    <h2>已註冊完成, 請開啟通知信並點擊驗證連結</h2>
  </div>
</div>

<Teleport to="body">
  <div v-if="isMsg" 
    class="w-full h-[100vh] fixed top-0 left-0 bg-slate-100 z-[500]"
  >
    <liwaMsg 
        :msgTitle="objMsg.title"
        :msgBody="objMsg.body"
        :modalType="objMsg.modalType"
        @hideMsg="hideMsg"
        @confirmOK="confirmOK"
    />      
  </div>    
</Teleport>
</NuxtLayout>
</template>