.<script setup lang="ts">
	import { ref, onMounted, computed } from 'vue'
  import jsonData from "../static/init.json"
	// import { useFetch, useStorage, useSessionStorage } from "@vueuse/core"
	// import jwtDecode from "jwt-decode"

	// const { $rmallSessionStorage } = useNuxtApp()
  const isMenu = ref(false)
	const bLogin = ref(false)
	const bIcon = ref(false) // 若已登入, 顯示使用者頭像
	const objLogo = ref('')

  const siteID = ref('')
  const userIcon = ref('')
  const APIsvr = ref('')

	const route = useRoute() // Nuxt 3 native function

	const jumpPage = () => {
		
	}

	const goLink = () => {

	}

  const toggleMenu = () => {
    isMenu.value = !isMenu.value
  }

  const getUserIcon = computed(() => {
    let AA = window.sessionStorage.getItem('liwaUserIconPath')
    if ((AA == undefined) || (AA == "")) AA = "../static/man-icon.png"
    return AA
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
    if ((sJWT == undefined) || (sJWT == "") || (sJWT == null) ) {
      // 將 liwaSiteID設為sys
      if ((siteID.value == undefined) || (siteID.value == "") || (siteID.value == null)) 
        // useStorage('liwaSiteID', 'sys', sessionStorage)
        window.sessionStorage.setItem('liwaSiteID', 'sys')
    } else {
      // 若已登入的處理
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
        useStorage('liwaAPIsvr', arrJWT.APIsvr, sessionStorage)
        useStorage('liwaImgsvr', arrJWT.imgsvr, sessionStorage)
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
    <div class="w-full bg-white">
        <div class="w-full flex flex-row justify-between items-start">
            <!-- Logo 欄 -->
            <div class="w-48 h-24 rounded-full -mt-2 -ml-4 text-3xl text-center cursor-pointer">
                <img src="../static/Logo_web.png" alt="" class="max-w-none mx-6 my-6" width="150" />
            </div>
            <div class="w-[calc(100%_-_12rem)] lg:w-[calc(100%_-_4rem)] flex flex-row-reverse justify-between">
                <!-- 登入,頭像, menu button -->
                <!-- menu button -->
                <div class="w-12 h-12 mt-4 cursor-pointer lg:hidden" @click="toggleMenu()">
                  <svg version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="40px" height="40px" viewBox="0 0 344.339 344.339" style="enable-background:new 0 0 344.339 344.339;" xml:space="preserve">
                    <g>
                       <rect y="46.06" width="344.339" height="29.52"/>
                    </g>
                    <g>
                       <rect y="156.506" width="344.339" height="29.52"/>
                    </g>
                    <g>
                       <rect y="268.748" width="344.339" height="29.531"/>
                    </g>
                  </svg>
                </div>  
                <div v-if="!bLogin" class="w-48 p-3 flex flex-row justify-center lg:justify-end">
                  <div class="w-3/4 lg:w-1/2 h-12 pt-2 float-right rounded bg-black text-white text-center">登入
                  </div>
                </div>
                <div v-else class="w-48 mx-1 mt-2 flex flex-row justify-end">
                  <!-- 已登入顯示頭像icon -->
                  <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 459 459" style="enable-background:new 0 0 459 459;" xml:space="preserve" width="42px" height="42px">
                    <g style="fill:#BBB;stroke:#333;stroke-width:12px;stroke-linecap:round;stroke-linejoin:round;">
                      <path d="M229.5,0C102.53,0,0,102.845,0,229.5C0,356.301,102.719,459,229.5,459C356.851,459,459,355.815,459,229.5 C459,102.547,356.079,0,229.5,0z M347.601,364.67C314.887,393.338,273.4,409,229.5,409c-43.892,0-85.372-15.657-118.083-44.314 c-4.425-3.876-6.425-9.834-5.245-15.597c11.3-55.195,46.457-98.725,91.209-113.047C174.028,222.218,158,193.817,158,161 c0-46.392,32.012-84,71.5-84c39.488,0,71.5,37.608,71.5,84c0,32.812-16.023,61.209-39.369,75.035 c44.751,14.319,79.909,57.848,91.213,113.038C354.023,354.828,352.019,360.798,347.601,364.67z"/>
                    </g>
                  </svg>
                </div> 
                <!-- Search bar -->
                <div class="hidden lg:block w-[calc(100%_-_12rem)]">
                  <div class="w-96 h-12 mx-auto my-2 bg-white rounded-md border-2 border-slate-500">
                    <div class="w-7 h-6 ml-1 mt-[0.75rem] float-left cursor-pointer">
                      <svg version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"  viewBox="0 0 487.95 487.95" style="enable-background:new 0 0 487.95 487.95;" xml:space="preserve" width="20px" height="20px">
                         <path d="M481.8,453l-140-140.1c27.6-33.1,44.2-75.4,44.2-121.6C386,85.9,299.5,0.2,193.1,0.2S0,86,0,191.4s86.5,191.1,192.9,191.1 c45.2,0,86.8-15.5,119.8-41.4l140.5,140.5c8.2,8.2,20.4,8.2,28.6,0C490,473.4,490,461.2,481.8,453z M41,191.4 c0-82.8,68.2-150.1,151.9-150.1s151.9,67.3,151.9,150.1s-68.2,150.1-151.9,150.1S41,274.1,41,191.4z"/>
                      </svg>
                    </div>
                    <input type="text" value="" placeholder="站內搜尋欄" class="w-[9rem] pt-2 float-left bg-white border-transparent focus:ring-0">
                  </div>
                </div> 
                <div class="w-7 h-6 lg:hidden pt-4 cursor-pointer">
                  <svg version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 487.95 487.95" style="enable-background:new 0 0 487.95 487.95;" xml:space="preserve" width="35px" height="35px">
                    <path d="M481.8,453l-140-140.1c27.6-33.1,44.2-75.4,44.2-121.6C386,85.9,299.5,0.2,193.1,0.2S0,86,0,191.4s86.5,191.1,192.9,191.1 c45.2,0,86.8-15.5,119.8-41.4l140.5,140.5c8.2,8.2,20.4,8.2,28.6,0C490,473.4,490,461.2,481.8,453z M41,191.4 c0-82.8,68.2-150.1,151.9-150.1s151.9,67.3,151.9,150.1s-68.2,150.1-151.9,150.1S41,274.1,41,191.4z"/>
                  </svg>          
                </div>                
            </div>  
        </div>
    </div>
    <!-- 下拉選單之用 -->
    <div 
      class="w-36 h-48 bg-slate-50 border-2 border-slate-200 absolute top-16 right-0 lg:hidden"
      v-if="isMenu==true"
    >
        <ul class="list-none">
            <li class="w-full h-8 border-0 border-b-2 border-b-slate-300"><a href="/Statics">行情統計</a></li>
            <li class="w-full h-8 border-0 border-b-2 border-b-slate-300"><a href="/Services">客服中心</a></li>
            <li class="w-full h-8 border-0 border-b-2 border-b-slate-300"><a href="/QnA">常見Q&A</a></li>
            <li class="w-full h-8 border-0 border-b-2 border-b-slate-300"><a href="/Blogs">部落格</a></li>
        </ul>
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