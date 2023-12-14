<script setup lang="ts">
	/*********************************************************
	prog name: 部落格文章列表, author: James Lin, date: 2022/09/05
	主要功能: 顯示所有部落格文章的列表及刪除程式 
	**********************************************************/
	import type { Ref } from "vue"
	import { ref, onMounted } from "vue"
	import { useFetch, createFetch, useStorage, useTitle } from "@vueuse/core"
	import queryString from "query-string"
	import banner from "../../components/banner"
	import { useShowmode } from "../../composables/use-showmode"
	import liwaGrid from "../../components/liwaGrid"
	import liwaMsg from "../../components/liwaMsg.vue"
	import { IconX } from '@iconify-prerendered/vue-bi'	

	const error = ref('')
	const progName = ref('文章列表')
	const proglink = ref('/A14')
	const detailFlg = ref(false)
	const detailKey = ref('')

	const mainID = ref('')
	const progID = ref('A14')
	const APIsvr = ref('')
	const liwaDetail1 = ref([])  // 搜尋對話盒的文章類別過濾

	const isFilter = ref(false)
	const filters = ref({})
	const isGrid = ref(true)
	const params = ref('')
	const page = ref(1)
	const pageSize = ref(10)	

	// liwaMsg 初始值
	const isMsg = ref(false)

	/* filterPanel setup starts */
	const statusOption = [
		{label:'', value:-1}, 
		{label:'已上架文章', value:0}, 
		{label:'下架文章', value:1}
	]

	const toggleFilter = () => {
		isFilter.value = !isFilter.value
	}

	const goSearch = () => {
		// 顯示結果並關閉對話盒
		isFilter.value = false
		isGrid.value = false
		params.value = JSON.stringify(filters.value)
		const showGrid = setTimeout(()=> isGrid.value = true, 300)
	}		
	/* filterPanel setup ends */

	const loadDetail1 = async () => {
		// 取得文章類別列表
		let keydata = {
			'JWT': window.localStorage.getItem('liwaJWT'),
		}
		let sQuery = queryString.stringify(keydata)		
		let url = `${APIsvr.value}/A14_haveItemType.php?${sQuery}`
		const detail1 = await useFetch(url, {method: 'GET'}, {refetch: true}).get().json()
		liwaDetail1.value = detail1.data.value.arrSQL
	}

	const setMainID = (sID) => {
		if (sID == 'filter') {
			isFilter.value = true
		} else {
			window.location.href = `/${progID.value}/`+sID
		}
	}

	const sendMsg = (sMsg) => {
		showMsg('程式錯誤', sMsg, 1)
	}					

	// 設定 liwaMsg starts
	const objMsg = ref({
		title: '',
		body: '',
		modalType: 1
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
	// 設定 liwaMsg ends

	onMounted(() => {
		useHead({title:'部落格文章列表'})
		APIsvr.value = window.sessionStorage.getItem('liwaAPIsvr')
		loadDetail1()
	})

	// definePageMeta({
	//   layout: "default",
	//   colorMode: "light"
	// })			
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
<div v-if="isGrid" class="w-full h-[calc(100vh_-_170px)] relative">
	<div class="w-full mx-auto">
		<liwaGrid
			:tblTitle="'部落格文章列表'"
			:progID="'A14_M'"
			:viewUrl="'A14_havelist.php'"
			:dataUrl="'A14_edit.php'"
			:params="params"
			:page="page"
			:pageSize="pageSize"
			@sendMsg="sendMsg"
			@setMainID="setMainID"
		/>
	</div>
</div>
<teleport to="body">
	<div v-if="isFilter" class="absolute top-[170px] lg:top-[110px] z-10 inset-x-0 w-screen h-[calc(100vh_-_79px)] bg-transparent overflow-hidden items-center justify-center">
	    <div class="flex justify-center w-full h-screen bg-transparent items-start antialiased">
	      	<div class="h-full lg:h-[calc(100%_-_28rem)] flex flex-col mt-4 w-11/12 sm:w-5/6 lg:w-1/2 max-w-lg mx-auto rounded-lg border border-gray-300 shadow-xl">
	        	<div class="relative flex flex-row justify-between px-6 py-2 bg-white border-b border-gray-200 rounded-tl-lg rounded-tr-lg text-center ">
	        		<div class="w-5/7 h-8 text-2xl text-center">部落格文章查詢</div>
	        		<div class="w-2/7 h-8 flex flex-row justify-between">
			            <div class="w-8 h-8 top-2 right-2 bg-white cursor-pointer" @click.prevent="toggleFilter()">
			            	<IconX class="w-7 h-7 text-red-400 font-bold" />
			            </div>          			
	        		</div>
	        	</div>
	        	<div class="w-full h-full bg-slate-100">
	        		<FormKit 
	        			form-class="mt-4 ml-4 px-4 py-2 bg-yellow-200 rounded-2xl w-11/12"
	        			type="form"
	        			:form-class="submitted? 'hidden': 'block'"
	        			submit-label="查詢"
	        			@submit="runFilter()"
	        		>
				        <FormKit
				          name="filterShortItems"
				          label="標題"
				          type="text"
				          placeholder="輸入文章標題"
				          help="可輸入部份文字"
				        />
				        <div class="w-full flex flex-col lg:flex-row mb-4">
				        	<div class="w-full lg:w-1/2 lg:pr-4">
						        <FormKit
						          name="filterStartDate"
						          label="起始日"
						          type="date"
						        />
				        	</div>
				        	<div class="w-full lg:w-1/2 lg:pr-4">
						        <FormKit
						          name="filterEndDate"
						          label="結束日"
						          type="date"
						        />
				        	</div>
				        </div>
				        <FormKit
				          outer-class="relative"
				          name="filterItemTypeID"
				          label="文章類別"
				          type="liwaDrop"
				          help="請選擇公告類別"
				          :sVal="itemType"
				          :arrOption="liwaDetail1"
				        />
				        <FormKit
				          name="filterStatus"
				          label="文章狀態"
				          type="select"
				          :options="statusOption"
				          help="請選擇文章狀態"
				        />
	        		</FormKit>
	        	</div>
	        </div>
	    </div>
	</div>
</teleport>
<teleport to="body">
	<div v-if="isMsg" class="w-full h-full fixed top-0 left-0 bg-slate-100 z-[500]">
		<liwaMsg 
		  	v-if="isMsg"
		  	:msgTitle="objMsg.title"
		  	:msgBody="objMsg.body"
		  	:modalType="objMsg.modalType"
		  	@hideMsg="hideMsg"
		  	@confirmOK="confirmOK"
		/> 
	</div> 
</teleport>
</NuxtLayout>
</template>