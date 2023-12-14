<script setup lang="ts">
	/*********************************************************
	prog name: 網頁列表, author: James Lin, date: 2020/04/19

	**********************************************************/
	import type { Ref } from "vue"
	import { ref, reactive, onMounted } from "vue"
	import { useFetch, createFetch, useStorage, useTitle } from "@vueuse/core"
	import queryString from "query-string"
	import banner from "../../components/banner"
	import { useShowmode } from "../../composables/use-showmode"
	import liwaPages from "../../components/liwaPages"
	import liwaMsg from "../../components/liwaMsg.vue"
	import { IconPlusLg, IconSearch, IconTrash, IconCheck, IconDash, IconStar, IconStarFill, IconX } from '@iconify-prerendered/vue-bi'

	const error = ref('')
	const APIsvr = ref('')
	const liwaData = ref({})
	const liwaDetail1 = ref([])  // 搜尋對話盒的公告類別過濾
	const progName = ref('網頁列表')
	const proglink = ref('/WPages')
	const detailFlg = ref(false)
	const detailKey = ref('')

	// const arrChklist = ref([])
	// const isChkAllMode = ref(-1)

	const router = useRouter()
	// liwaMsg 初始值
	const isMsg = ref(false)
	const objMsg = reactive({
		title: '',
		body: '',
		modalType: 1
	})

	const page = ref(1)
	const pageSize = ref(10)
	const totalPage = ref(1)

	const loadData = async () => {
		let keydata = {
			'JWT': window.localStorage.getItem('liwaJWT'),
			'page': page.value,
			'pageSize': pageSize.value
		}
		let sQuery = queryString.stringify(keydata)
		let url = `${APIsvr.value}/WPages_havelist.php?${sQuery}`
		// let url = `${APIsvr}/wpages_havelist.php?siteID=${filters.value.siteID}&userID=${filters.value.userID}&mainID=${mainID.value}&filterShortItems=${filters.value.shortItems}&filterStartDate=${filters.value.startDate}&filterEndDate=${filters.value.endDate}&filterItemTypeID=${filters.value.itemTypeID}&filterStatus=${filters.value.status}&orderCol=${orderCol.value}&sortDir=${sortDir.value}&page=${page.value}&pageSize=${pageSize.value}`
		
		const data = await useFetch(url, {method: 'GET'}, {refetch: true}).get().json()
		liwaData.value = data.data.value.arrSQL	
	}	

	const reload = () => {
		refetchFilters()
		loadData()
	}

	const setMainID = (sID) => {
		window.location.href = `${proglink.value}/${sID}`
	}

	const setBM = (idx) => {

	}

	const setActvPage = (iPage) => {
		page.value = iPage
		reload()
	}

	const deleteData = async () => {
		let details = arrChklist.value.toString()
		console.log('details =', details)
		let keydata = {			
			'siteID': window.sessionStorage.getItem('liwaSiteID'),
			'userID': window.sessionStorage.getItem('liwaUserID'),
			'makerName':window.sessionStorage.getItem('liwaUserName'),
			'details': details,
			'action':'delete',
		}
		let datastr = JSON.stringify(keydata)
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
	    const { data } = await useMyFetch('wpages_edit.php').post().json()
	    if (!data.value.message) {
	    	// window.location.href = '/wpages/'
	    	reload()
	    } else {
	    	showMsg('', data.value.message, 1)
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

	onMounted(() => {
		useHead({title:'網頁列表'})
		APIsvr.value = window.sessionStorage.getItem('liwaAPIsvr')
		loadData()
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
<div class="w-full bg-slate-200 px-4 py-2">
	<div class="barPanel h-12 rounded-3xl ml-4 mb-2 px-1">
		<div class="w-full text-center">網頁列表</div>
<!-- 		<div class="top-icon ml-2 -mt-1 pl-[.125rem] pt-[.125rem]" @click="setMainID('add')">
			<IconPlusLg class="w-7 h-7 text-white font-bold" />
		</div> -->
	</div>	
	<div v-if="liwaData.length" class="mx-auto my-0 p-2 border-2 relative">
		<div class="w-full flex flex-row">
	    	<div class="w-full sm:h-96 md:h-[36rem] lg:h-[44rem] min-h-full -my-2 overflow-auto sm:-mx-6 lg:-mx-8">
	        	<div class="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
			        <div class="shadow border-b border-gray-500 bg-white">
			        	<table class="min-w-full divide-x divide-y divide-gray-200 bg-white">
			            	<thead class="bg-gray-50">
			                	<tr class="bg-violet-700">
			                  		<th scope="col" class="thPanel w-full text-center text-white text-lg">
			                    	網頁標題
			                  		</th>
			                	</tr>
			              	</thead>
							<tbody class="w-full bg-white ring-1 ring-gray-50">
								<tr 
									class="odd:bg-white even:bg-slate-200"
									v-for="(record, index) in liwaData" 
									:key="index"
									:data-id="record.mainID" 
									@click.prevent="setMainID(record.mainID)">
									<td scope="col" class="px-3 py-3 border-b order-gray-300 text-left text-sm font-medium text-gray-500 uppercase tracking-wider relative cursor-pointer">
										{{ record.stitle }}
									</td>
								</tr>
							</tbody>
			            </table>
			        </div>
		        </div>
		    </div>
	    </div> 
    </div>
    <div v-else>載入中...</div>
</div>
<div v-if="liwaData.length" class="w-full bg-slate-200 px-4 py-2">
	<!-- 頁碼控制 -->
	<liwaPages
		:page="page"
		:totalPage="totalPage"
		@setActvPage="setActvPage"
	></liwaPages>	
</div>
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