<script setup lang="ts">
	/*********************************************************
	prog name: 搜尋結果, author: James Lin, date: 2022/08/10
	主功能: 在系統搜尋關鍵字並顯示結果

	**********************************************************/	
	import { ref, reactive, onMounted } from "vue"
	import { useFetch, createFetch } from "@vueuse/core"
	import queryString from "query-string"
	import banner from "../components/banner"
	import liwaGrid from "../components/liwaGrid"
	import liwaMsg from "../components/liwaMsg.vue"
	import { IconX, IconSearch } from '@iconify-prerendered/vue-bi'

	const debug = ref(1)
	const progName = ref('系統搜尋')
	const proglink = ref('/Search')
	const detailFlg = ref(false)
	const detailKey = ref('')

	const mainID = ref('')
	const liwaData = ref([])
	const APIsvr = ref('')
	const submitted = ref(false)

	const isFilter = ref(false)
	const filters = ref({})
	const isGrid = ref(false)
	const params = ref('')
	const page = ref(1)
	const pageSize = ref(10)
	const searchString = ref('')

	// liwaMsg 初始值
	const isMsg = ref(false)

	// const loadData = async () => {
	// 	let keydata = {
	// 		'JWT': window.localStorage.getItem('liwaJWT')
	// 	}
	// 	let sQuery = queryString.stringify(keydata)		
	// 	let url = `${APIsvr.value}/A01_haveDetail.php?${sQuery}`
	// 	const data = await useFetch(url, {method: 'GET'}, {refetch: true}).get().json()
	// 	liwaData.value = data.data.value.arrSQL[0]
	// 	liwaData.value.action = 'edit'
	// 	liwaData.value.mainID = liwaData.value.userID
	// 	sContent.value = liwaData.value.userBrief
	// }

	/* 搜尋功能 starts */
	const goSearch = () => {
		// 若searchString非空則顯示結果
	    if (searchString.value) {
	      searchString.value = searchString.value.replace(/\s/g, "+")
	      // 搜尋字非空, 顯示搜尋結果
	      isGrid.value = false
	      params.value = JSON.stringify(filters.value)
	      const showGrid = setTimeout(()=> isGrid.value = true, 300)
	    }		
	}
	/* 搜尋功能 ends */	

	// 訊息對話盒相關 starts
	const objMsg = ref({
		title: '',
		body: '',
		modalType: ''
	})
	
	const showMsg = (sTitle, sBody, iType = 1) => {
  		objMsg.value.title = sTitle
  		objMsg.value.body = sBody
  		objMsg.value.modalType = iType
  		isMsg.value = true
	}

	const hideMsg = () => {
		isMsg.value = false
	}

	const confirmOK = () => {
		isMsg.value = false
	}		
	// 設定對話盒相關 ends	

	onMounted(() => {
		useHead({title:'系統搜尋'})
		APIsvr.value = window.sessionStorage.getItem('liwaAPIsvr')
	})
</script>

<template>
<NuxtLayout name="default">	
<banner
	:progname="progName"
	:proglink="proglink"
	:detailflg="detailFlg"
	:detailkey="detailKey"
></banner>	
	<div v-if="error">{{ error }}</div>
	<div class="w-full h-[30px] ">
		<div class="w-full md:w-[500px] mx-auto flex flex-row justify-items-start">
			<div class="w-[calc(100%_-_3rem)] h-12">
				<FormKit
					type="text"
					label=" "
					v-model="searchString"
					placeholder="站內搜尋欄"
					help="請輸入搜尋關鍵字, 多個關鍵字以空白區隔, 例如「李小梅 請假」"
					:wrapper-class="'w-full'"
					@keyup.enter="goSearch"
				/>				
			</div>
            <div class="w-12 h-11 mt-[0.35rem] pt-[0.3rem] pl-[0.4rem] bg-orange-400 float-left cursor-pointer border-2 border-gray-300">
              <IconSearch class="w-7 h-7 text-slate-100 font-bold" 
              @click="goSearch" />
            </div>
		</div>
	</div>
	<div v-if="isGrid" class="w-full h-[calc(100vh_-_200px)] relative">
		<div class="w-full mx-auto">
			<liwaGrid
				:tblTitle="'搜尋結果'"
				:progID="'A01_M'"
				:viewUrl="'A01_havelist.php'"
				:dataUrl="''"
				:params="params"
				:page="page"
				:pageSize="pageSize"
				@sendMsg="sendMsg"
				@setMainID="setMainID"
			/>
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

<style scope>
	.formkit-option {
		width:50%;
		float:left;
	}

	.actItem {
		max-width:300px;
		line-height:4rem;
		border:1px solid #888;
		padding-left:1rem;
		position:relative;
		background-color: white;
	}

	.btnGT {
		width:3rem;
		height:3rem;
		position:absolute;
		top: 0rem;
		right:0px;
		text-align:center;
		font-size:1.5rem;
		cursor:pointer;
	}
</style>