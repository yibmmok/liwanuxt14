.<script setup lang="ts">
	import { ref, onMounted, computed } from 'vue'
	// import { useFetch, useStorage, useSessionStorage } from "@vueuse/core"
	// import jwtDecode from "jwt-decode"

	// const { $rmallSessionStorage } = useNuxtApp()
  const isMenu = ref(false)
	const bLogin = ref(false)
	const bIcon = ref(false)
	const objLogo = ref('')

	const route = useRoute() // Nuxt 3 native function

	const jumpPage = () => {
		
	}

	const goLink = () => {

	}

  const toggleMenu = () => {
    isMenu.value = !isMenu.value
  }
	
	onMounted(() => {

	})
</script>

<template>
    <div class="w-full h-24 bg-gradient-to-r from-emerald-100 via-cyan-200 to-sky-400">
        <div class="w-full flex flex-row justify-start items-start">
            <div class="w-40 h-24 rounded-full -mt-4 -ml-4 text-3xl text-center cursor-pointer">
                <img src="http://imgsvr.liwasite.com/syspics/SIED_Logo.png" alt="" class="max-w-none mt-2 ml-2" width="110"/>
            </div>
            <div class="w-[calc(100%_-_7rem)] flex flex-row lg:flex-col">
                <div class="w-3/4 h-24 lg:w-full lg:h-12">
                    <div class="w-48 h-8 mx-auto lg:mx-0 mt-8 sm: float-none lg:float-right lg:mr-4 lg:mt-2 bg-white rounded-md border-2 border-slate-500">
                        <div class="w-7 h-6 ml-1 mt-[0.1rem] float-left cursor-pointer">
                            <svg version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
                            viewBox="0 0 487.95 487.95" style="enable-background:new 0 0 487.95 487.95;" xml:space="preserve" width="20px" height="20px">
                               <path d="M481.8,453l-140-140.1c27.6-33.1,44.2-75.4,44.2-121.6C386,85.9,299.5,0.2,193.1,0.2S0,86,0,191.4s86.5,191.1,192.9,191.1
                                   c45.2,0,86.8-15.5,119.8-41.4l140.5,140.5c8.2,8.2,20.4,8.2,28.6,0C490,473.4,490,461.2,481.8,453z M41,191.4
                                   c0-82.8,68.2-150.1,151.9-150.1s151.9,67.3,151.9,150.1s-68.2,150.1-151.9,150.1S41,274.1,41,191.4z"/>
                            </svg>
                        </div>
                        <input type="text" value="" placeholder="站內搜尋欄" class="w-[9rem] float-left bg-white border-transparent focus:ring-0">
                    </div>
                </div> 
                <div class="w-1/4 h-24 lg:w-[900px] lg:h-12 pl-12 font-bold">
                    <div id="btnMenu" class="w-12 h-12 mt-6 cursor-pointer float-right lg:hidden" @click="toggleMenu">
                        <svg version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
                        width="40px" height="40px" viewBox="0 0 344.339 344.339" style="enable-background:new 0 0 344.339 344.339;"
                        xml:space="preserve">
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
                    <nav class="hidden lg:block lg:flex lg:flex-row lg:justify-between pt-4">
                        <a href="/About_sied">關於我們</a>
                        <a href="/News">最新消息</a>
                        <a href="/Register">報名資訊</a>
                        <a href="/QnA">常見Q&A</a>
                        <a href="/Classes">課程介紹</a>
                        <a href="/Interview">學員分享</a>
                        <a href="/Photos">活動花絮</a>
                    </nav>
                </div>
            </div>  
        </div>
    </div>

    <!-- 下拉選單之用 -->
    <div 
      class="hidden w-36 h-48 bg-slate-50 border-2 border-slate-200 absolute top-16 right-0 lg:invisible"
      v-if="isMenu==true"
    >
        <ul class="list-none">
            <li class="w-full h-8 border-0 border-b-2 border-b-slate-300"><a href="/About_sied">關於我們</a></li>
            <li class="w-full h-8 border-0 border-b-2 border-b-slate-300 pl-12"><a href="/About_sied">經貿營介紹</a></li>
            <li class="w-full h-8 border-0 border-b-2 border-b-slate-300 pl-12"><a href="/About_cyc">救國團介紹</a></li>
            <li class="w-full h-8 border-0 border-b-2 border-b-slate-300 pl-12"><a href="/Teammembers">開發者資訊</a></li>
            <li class="w-full h-8 border-0 border-b-2 border-b-slate-300"><a href="/Register">報名資訊</a></li>
            <li class="w-full h-8 border-0 border-b-2 border-b-slate-300"><a href="/QnA">常見Q&A</a></li>
            <li class="w-full h-8 border-0 border-b-2 border-b-slate-300"><a href="/Classes">課程介紹</a></li>
            <li class="w-full h-8 border-0 border-b-2 border-b-slate-300"><a href="/Interview">學員分享</a></li>
            <li class="w-full h-8 border-0 border-b-2 border-b-slate-300"><a href="/Photos">活動花絮</a></li>
        </ul>
    </div>    
</template>

<style scoped>

</style>