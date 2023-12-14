<script setup lang="ts">
	/*********************************************************
	prog name: 待辦清單列表, author: James Lin, date: 2022/02/06

	**********************************************************/
	import type { Ref } from "vue"
	import { ref, reactive, onMounted, computed } from "vue"
	import queryString from "query-string"
	import { useFetch, createFetch, useStorage, useTitle } from "@vueuse/core"
	import banner from "../../components/banner"
	import liwaGrid from "../../components/liwaGrid"
	import { IconPlusLg, IconSearch, IconTrash, IconCheck, IconCheckSquare, IconDash, IconX, IconCaretDownFill, IconCaretUpFill } from '@iconify-prerendered/vue-bi'

	const error = ref('')
	
	const liwaData = ref({})
	const liwaHead = ref([])
	const liwaSchema = ref({})
	const liwaObject = ref({})
	const arrUsers = ref([])

	const tblTitle = ref('待辦清單')
	const tblProgID = ref('006_M')
	const progName = ref('待辦清單列表')
	const proglink = ref('/006')
	const detailFlg = ref(false)
	const detailKey = ref('')
	const isGrid = ref(true)
	const params = ref('')

	const isFilter = ref(false)
	const filters = ref({})
	const arrTodoType = ref([{'value':'','label':''},{'value':'1','label':'未完成'},{'value':'2','label':'已完成'}])
		
	const mainID = ref('')
	const progID = ref('006')
	const APIsvr = ref('')

	const router = useRouter()
	// liwaMsg 初始值
	const isMsg = ref(false)
	const objMsg = reactive({
		title: '',
		body: '',
		modalType: 1
	})

	const toggleFilter = () => {
		isFilter.value = !isFilter.value
	}

	const page = ref(1)
	const pageSize = ref(10)
	const totalPage = ref(1)

	/* filterPanel setup starts */
	const loadUsers = async () => {
		let keydata = {
			'JWT': window.localStorage.getItem('liwaJWT')
		}
		let sQuery = queryString.stringify(keydata)
		let url = `${APIsvr.value}/006_haveUsers.php?${sQuery}`
		const dataUsers = await useFetch(url, {method: 'GET'}, {refetch: true}).get().json()
		arrUsers.value = dataUsers.data.value.arrSQL
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
		showMsg('系統訊息', sMsg, 2)
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

	onMounted(() => {
		useHead({title:'待辦清單列表'})
		APIsvr.value = window.sessionStorage.getItem('liwaAPIsvr')
		loadUsers()
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
<div class="w-full h-[calc(100vh_-_170px)] relative">
	<div v-if="isGrid" class="w-full mx-auto">
		<liwaGrid
			:tblTitle="'待辦清單'"
			:progID="'006_M'"
			:viewUrl="'006_havelist.php'"
			:dataUrl="'006_edit.php'"
			:params="params"
			:page="page"
			:pageSize="pageSize"
			@sendMsg="sendMsg"
			@setMainID="setMainID"
		>
			<template v-slot:custom>
				<div class="top-icon add ml-2 -mt-1" @click="isFilter=true">
					<IconSearch class="w-8 h-8 text-white font-bold" />
				</div>
				<div class="top-icon ml-2 -mt-1 pt-[.125rem] pl-[.125rem]" @click="deleteData()">
					<IconTrash class="w-7 h-7 text-white font-bold" />
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
	        		<div class="w-5/7 h-8 text-2xl text-center">待辦清單查詢</div>
	        		<div class="w-2/7 h-8 flex flex-row justify-between">
			            <div class="w-8 h-8 top-2 right-2 bg-white cursor-pointer" @click.prevent="toggleFilter()">
			            	<IconX class="w-7 h-7 text-red-400 font-bold" />
			            </div>          			
	        		</div>
	        	</div>
	        	<div class="w-full h-full bg-slate-100">
	        		<FormKit 
	        			form-class="mt-4 ml-4 px-4 py-2 bg-yellow-200 rounded-2xl w-11/12"
	        			v-model="filters"
	        			type="form"
	        			:form-class="submitted? 'hidden': 'block'"
	        			submit-label="查詢"
	        			@submit="goSearch()"
	        		>
				        <FormKit
				          name="filterfromUserNM"
				          label="發布者姓名"
				          type="text"
				          placeholder="輸入發布者姓名"
				          help="可輸入部份文字"
				        />
				        <div class="w-full flex flex-col lg:flex-row">
				        	<div class="w-full lg:w-1/2">
						        <FormKit
						          name="filterfromStartDate"
						          label="起始發布日期"
						          type="date"
						          help="請設定待辦事項發布日起始"
						        />				        		
				        	</div>
				        	<div class="w-full lg:w-1/2">
						        <FormKit
						          name="filterfromEndDate"
						          label="結束發布日期"
						          type="date"
						          help="請設定待辦事項發布日截止"
						        />				        		
				        	</div>
				        </div>
				        <FormKit
				          name="filterdoneUserNM"
				          label="待辦事項承辦人"
				          type="select"
				          :options="arrUsers"
				          help="請從下拉選單選擇承辦人"
				        />
				        <FormKit
				          name="filterTodoType"
				          label="待辦事項類別"
				          type="select"
				          :options="arrTodoType"
				          help="請從下拉選單選擇類別"
				        />				        
				        <div class="w-full flex flex-col lg:flex-row">
				        	<div class="w-full lg:w-1/2">
						        <FormKit
						          name="filterdoneStartDate"
						          label="起始完成日期"
						          type="date"
						          help="請設定待辦事項完成日起始"
						        />				        		
				        	</div>
				        	<div class="w-full lg:w-1/2">
						        <FormKit
						          name="filterdoneEndDate"
						          label="結束完成日期"
						          type="date"
						          help="請設定待辦事項完成日截止"
						        />				        		
				        	</div>
				        </div>
	        		</FormKit>
	        	</div>
	        </div>
	    </div>
	</div>
</teleport>
<Teleport to="body">
	<div v-if="isMsg" class="w-full h-full fixed top-0 left-0 bg-slate-100 z-[500]">
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