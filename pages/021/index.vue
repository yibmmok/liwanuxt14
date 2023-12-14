<script setup lang="ts">
	/*********************************************************
	prog name: 上架作業, author: James Lin, date: 2022/10/25
	主要功能: 顯示所有物件的列表及刪除程式
	**********************************************************/
	import { ref, onMounted } from "vue"
	import { useFetch, createFetch, useTitle } from "@vueuse/core"
	import queryString from "query-string"
	import banner from "../../components/banner"
	import { useShowmode } from "../../composables/use-showmode"
	import liwaGrid from "../../components/liwaGrid"
	import liwaMsg from "../../components/liwaMsg.vue"
	import { IconArrowUpShort, IconArrowDownShort, IconX } from '@iconify-prerendered/vue-bi'

	const error = ref('')
	const progName = ref('物件管理')
	const proglink = ref('/021')
	const detailFlg = ref(false)
	const detailKey = ref('')

	const mainID = ref('')
	const progID = ref('021')
	const APIsvr = ref('')

	const isFilter = ref(false)
	const filters = ref({})
	const isGrid = ref(true)
	const params = ref('')
	const page = ref(1)
	const pageSize = ref(10)
	const liwaChklist = ref([])	

	// liwaMsg 初始值
	const isMsg = ref(false)

	/* filterPanel setup starts */
	const optStatus = ref([{"label":"", "value":""}, {"label":"下架", "value":"-1"}, {"label":"上架", "value":"1"}, {"label":"斡旋中", "value":"2"}, {"label":"待成交", "value":"3"}, {"label":"成交", "value":"9"}])

	const toggleFilter = () => {
		// 顯示 filters 對話盒
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

	const setChecked = (arrChklist) => {
		liwaChklist.value = arrChklist
	}

	const setStatus = async (iMode) => {
		console.log('liwaChklist in setStatus1 =', liwaChklist.value)
		if (liwaChklist.value.length > 0) {
			let details = liwaChklist.value.toString()
			let keydata = {			
				'JWT': window.localStorage.getItem('liwaJWT'),
				'details': details,
				'iMode':iMode
			}
			let datastr = JSON.stringify(keydata)
			console.log('datastr =', datastr)

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
			const { data } = await useMyFetch('021_setStatus.php').post().json()
			let msg = data.value.message
			if (!msg) {
				// loadData()
				isGrid.value = false
				setTimeout(() => isGrid.value = true, 1000)
			} else {
				// 送出錯誤訊息
				emits('sendMsg', msg)
			}	
							
		}
	}		

	// 訊息對話盒及設定對話盒相關 starts	
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
		alert("Press the Confirm button")
		isMsg.value = false
	}
	// 訊息對話盒及設定對話盒相關 ends

	onMounted(() => {
		useHead({title:'上架作業'})
		APIsvr.value = window.sessionStorage.getItem('liwaAPIsvr')
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
			:tblTitle="'物件列表'"
			:progID="'021_M'"
			:viewUrl="'021_havelist.php'"
			:dataUrl="'021_edit.php'"
			:params="params"
			:page="page"
			:pageSize="pageSize"
			@sendMsg="sendMsg"
			@setMainID="setMainID"
			@setChecked="setChecked"
		>
			<template #FullBtns>
				<div class="ml-[138px] relative flex flex-row -mt-1">
					<div class="top-icon ml-2 mt-1 bg-orange-500" title="批次上架" @click="setStatus(1)">
						<IconArrowUpShort class="w-8 h-8 text-white font-bold" />
					</div>
					<div class="top-icon ml-2 mt-1 pt-[.125rem] pl-[.125rem] bg-orange-500" title="批次下架" @click="setStatus(-1)">
						<IconArrowDownShort class="w-8 h-8 text-white font-bold" />
					</div>								
				</div>
			</template>
		</liwaGrid>
	</div>
</div>
<teleport to="body">
	<div v-if="isFilter" class="absolute top-[170px] lg:top-[110px] z-10 inset-x-0 w-screen h-[calc(100vh_-_79px)] bg-transparent overflow-hidden items-center justify-center">
	    <div class="flex justify-center w-full h-screen bg-transparent items-start antialiased">
	      	<div class="h-full lg:h-[calc(100%_-_28rem)] flex flex-col mt-4 w-11/12 sm:w-5/6 lg:w-1/2 max-w-lg mx-auto rounded-lg border border-gray-300 shadow-xl">
	        	<div class="relative flex flex-row justify-between px-6 py-2 bg-white border-b border-gray-200 rounded-tl-lg rounded-tr-lg text-center ">
	        		<div class="w-5/7 h-8 text-2xl text-center">物件查詢</div>
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
	        			v-model="filters"      			
	        			:form-class="submitted? 'hidden': 'block'"
	        			submit-label="查詢"
	        			@submit="goSearch()"
	        		>
				        <FormKit
				          name="filterPprodID"
				          label="物件編號"
				          type="text"
				          placeholder="輸入物件編號"
				          help="請輸入物件編號"
				        />
				        <FormKit
				          name="filterProdNM"
				          label="物件名稱"
				          type="text"
				          placeholder="輸入物件名稱"
				          help="可輸入部份物件名稱關鍵字"
				        />
				        <div class="w-full flex flex-col lg:flex-row mb-4">
				        	<div class="w-full lg:w-1/2 lg:pr-4">
						        <FormKit
						          name="filterExpDate1"
						          label="刊登到期日(起始日期)"
						          type="date"
						        />
				        	</div>
				        	<div class="w-full lg:w-1/2 lg:pr-4">
						        <FormKit
						          name="filterExpDate2"
						          label="刊登到期日(結束日期)"
						          type="date"
						        />
				        	</div>
				        </div>				        
				        <FormKit
				          name="filterSellerID"
				          label="賣家ID"
				          type="text"
				          placeholder="輸入賣家ID"
				          help="請輸入賣家ID"
				        />
				        <FormKit
				          name="filterStatus"
				          label="物件狀態"
				          type="select"
				          help="請選擇物件狀態"
				          :options="optStatus"
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