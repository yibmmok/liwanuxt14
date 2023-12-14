<script setup lang="ts">
	/*********************************************************
	prog name: 會員列表, author: James Lin, date: 2020/04/19
	主要功能: 顯示所有會員的列表及刪除程式
	**********************************************************/
	import type { Ref } from "vue"
	import { ref, onMounted } from "vue"
	import queryString from "query-string"
	import { useFetch, createFetch, useStorage, useTitle } from "@vueuse/core"
	import banner from "../../components/banner"
	import { useShowmode } from "../../composables/use-showmode"
	import liwaGrid from "../../components/liwaGrid"
	import { IconX } from '@iconify-prerendered/vue-bi'

	const error = ref('')
	const progName = ref('會員列表')
	const proglink = ref('/041')
	const detailFlg = ref(false)
	const detailKey = ref('')

	const mainID = ref('')
	const progID = ref('041')
	const APIsvr = ref('')

	const isFilter = ref(false)
	const filters = ref({})
	const isGrid = ref(true)
	const params = ref('')
	const page = ref(1)
	const pageSize = ref(10)

	// liwaMsg 初始值
	const isMsg = ref(false)

	/* filterPanel setup starts */
	const rolesOption = ['', '停權會員', '正式會員']
	const isfirmOption = [{"value":"0", "label":"個人"}, {"value":"1", "label":"公司"}]

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
		useHead({title:'會員列表'})
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
			:tblTitle="'會員列表'"
			:progID="'041_M'"
			:viewUrl="'041_havelist.php'"
			:dataUrl="'041_edit.php'"
			:params="params"
			:page="page"
			:pageSize="pageSize"
			:showBtns="true"
			@sendMsg="sendMsg"
			@setMainID="setMainID"
			@setChecked="setChecked"
		/>
	</div>
</div>
<teleport to="body">
	<div v-if="isFilter" class="absolute top-[170px] lg:top-[110px] z-10 inset-x-0 w-screen h-[calc(100vh_-_79px)] bg-transparent overflow-hidden items-center justify-center">
	    <div class="flex justify-center w-full h-screen bg-transparent items-start antialiased">
	      	<div class="h-full lg:h-[calc(100%_-_28rem)] flex flex-col mt-4 w-11/12 sm:w-5/6 lg:w-1/2 max-w-lg mx-auto rounded-lg border border-gray-300 shadow-xl">
	        	<div class="relative flex flex-row justify-between px-6 py-2 bg-white border-b border-gray-200 rounded-tl-lg rounded-tr-lg text-center ">
	        		<div class="w-5/7 h-8 text-2xl text-center">會員查詢</div>
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
				          name="filterUsername"
				          label="姓名"
				          type="text"
				          placeholder="輸入會員姓名"
				          help="可輸入部份文字"
				        />
				        <FormKit
				          name="filterMobile"
				          label="手機"
				          type="text"
				          help="可輸入部份手機號碼"
				        />
				        <FormKit
				          name="filterRoles"
				          label="會員類別"
				          type="select"
				          :options="rolesOption"
				          help="請選擇會員類別"
				        />
				        <FormKit
				          name="filterUniqID"
				          label="身份證字號/統一編號"
				          type="text"
				          help="可輸入部份身份證字號或統一編號"
				        />	
				        <FormKit
				          name="filterIsFirm"
				          label="個人/公司"
				          type="select"
				          :options="isfirmOption"
				          help="請選擇會員為個人/公司"
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