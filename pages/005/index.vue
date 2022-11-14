<script setup lang="ts">
	/*********************************************************
	prog name: 公告列表, author: James Lin, date: 2020/04/19

	**********************************************************/
	import type { Ref } from "vue"
	import { ref, reactive, onMounted } from "vue"
	import { useFetch, createFetch, useStorage, useTitle } from "@vueuse/core"
	import banner from "../../components/banner"
	import { useShowmode } from "../../composables/use-showmode"
	import liwaPages from "../../components/liwaPages"
	import liwaMsg from "../../components/liwaMsg.vue"
	import { IconPlusLg, IconSearch, IconTrash, IconCheck, IconDash, IconStar, IconStarFill, IconX } from '@iconify-prerendered/vue-bi'

	const error = ref('')
	const liwaData = ref({})
	const liwaDetail1 = ref([])  // 搜尋對話盒的公告類別過濾
	const progName = ref('公告列表')
	const proglink = ref('/005')
	const detailFlg = ref(false)
	const detailKey = ref('')
	const isFilter = ref(false)
	const filters = ref({
		startDate:'',
		endDate:'',
		shortItems:'',
		itemTypeID:'',
		status:-1
	})
	const mainID = ref('')
	const orderCol = ref('shortItems')
	const sortDir = ref('asc')
	const arrChklist = ref([])
	const isChkAllMode = ref(-1)

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
	const statusOption = [
		{label:'', value:-1}, 
		{label:'已上架公告', value:1}, 
		{label:'下架公告', value:0}
	]

	/* filterPanel setup ends */

	const fetchData = async () => {
		let APIsvr = window.sessionStorage.getItem('liwaAPIsvr')
		let url = `${APIsvr}/005_havelist.php?siteID=${filters.value.siteID}&userID=${filters.value.userID}&mainID=${mainID.value}&filterShortItems=${filters.value.shortItems}&filterStartDate=${filters.value.startDate}&filterEndDate=${filters.value.endDate}&filterItemTypeID=${filters.value.itemTypeID}&filterStatus=${filters.value.status}&orderCol=${orderCol.value}&sortDir=${sortDir.value}&page=${page.value}&pageSize=${pageSize.value}`
	
		const data = await useFetch(url, {method: 'GET'}, {refetch: true}).get().json()
		liwaData.value = data.data.value.arrSQL
		totalPage.value = data.data.value.totalPage
		
		if (arrChklist.value.length > 0) {
			// 將 liwaData 符合的mainID的 isChecked = 1
			arrChklist.value.forEach((n) => {
				let res = liwaData.value.filter((obj) => n == obj.mainID)
				if (res.length > 0) res[0].isChecked = 1	
			})
		}
		
		// 每次fetchData 後都要把filters存下來
		// saveFilters()		
	}

	const loadDetail1 = async () => {
		// 取得公告類別列表
		let url1 = window.sessionStorage.getItem('liwaAPIsvr') + "/005_haveItemType.php?siteID="+window.sessionStorage.getItem('liwaSiteID')
		const detail1 = await useFetch(url1, {method: 'GET'}, {refetch: true}).get().json()
		let arrDetail1 = detail1.data.value.arrSQL
		let arrTmp = []
		for (let i=0; i<arrDetail1.length; i++) {
			let objItem = {
				label:arrDetail1[i].label,
				value:arrDetail1[i].value,
				iAuth:arrDetail1[i].iAuth
			}
			arrTmp.push(objItem)
		}
		liwaDetail1.value = arrTmp
	}	

	const reload = () => {
		refetchFilters()
		fetchData()
	}

	const setMainID = (sID) => {
		let makerID = window.sessionStorage.getItem('liwaUserID');
		if (sID !== makerID) window.location.href = `${proglink.value}/${sID}`
	}

	const setChkList = (idx) => {
		let res = liwaData.value.filter((n) => n.mainID == idx)
		let iCheck = (res[0].isChecked == 1)? 0: 1
		res[0].isChecked = iCheck
		let iCount = 0
		// 若 iCheck == 1(代表已被選), 將 idx加入 arrChklist內, 否則從 arrChklist移除
		if (iCheck == 1) {
			arrChklist.value.push(idx)
			if (isChkAllMode.value == -1) isChkAllMode.value = 0
			else {
				// 檢查是否已全選, 若是, isChkAllMode = 1
				iCount = 0
				arrChklist.value.forEach((n1) => {
					// 逐筆檢查, 若已全選, isChkAllMode = 1
					let res1 = liwaData.value.filter((m1) => m1.mainID == n1)
					// 若在liwaData內找到 iCount +1
					if (res1[0].length > 0) iCount += 1
				})
				if (iCount == liwaData.value.length) isChkAllMode.value = 1			
			}
		} else {
			// unChecked
			let iIndex = arrChklist.value.indexOf(idx)
			arrChklist.value.splice(iIndex, 1)
			if (isChkAllMode.value == 1) isChkAllMode.value = 0
			else {
				// 檢查是否已全unChecked, 若是, isChkAllMode = -1
				iCount = 0
				arrChklist.value.forEach((n2) => {
					// 逐筆檢查, 若非全選, isChkAllMode = 0
					let res2 = liwaData.value.filter((m2) => m2.mainID == n2)
					// 若在liwaData內找到 iCount +1
					if (res2[0].length > 0) iCount += 1
				})
			}
			if (liwaData.value.length > iCount) isChkAllMode.value = 0
			else isChkAllMode.value = -1
		}
	}

	const setBM = (idx) => {

	}

	const toggleChkAll = () => {
		if (isChkAllMode.value == -1) {
			// 設為全選
			isChkAllMode.value = 1
			checkAll()
			// 將arrChklist 存到 sessionStorage 內
		} else {
			// 設為全不選
			isChkAllMode.value = -1
			uncheckAll()
		}
	}

	const checkAll = () => {
		liwaData.value.forEach((n) => {
			let iCheck = n.isChecked
			if (iCheck == 0) {
				n.isChecked = 1
				arrChklist.value.push(n.mainID)
			}
		})
	}

	const uncheckAll = () => {
		liwaData.value.forEach((n) => {
			let iCheck = n.isChecked
			let iIndex = arrChklist.value.indexOf(n.mainID)
			if (iCheck == 1) {
				n.isChecked = 0
				arrChklist.value.splice(iIndex, 1)
			}
		})
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
	      baseUrl: window.sessionStorage.getItem('liwaAPIsvr'),
	      fetchOptions: {
	        mode: 'cors',
	        headers: new Headers({
	          'Content-Type': 'application/json; charset=utf-8'
	        }),
	        body: datastr
	      }
	    })
	    const { data } = await useMyFetch('005_edit.php').post().json()
	    if (!data.value.message) {
	    	// window.location.href = '/005/'
	    	reload()
	    } else {
	    	showMsg('', data.value.message, 1)
	    }	
	}

	// 設定 filters 內容 starts
	const saveFilters = () => {
		// 將過濾條件存在storage內
		let datastr = JSON.stringify(filters.value)
		window.sessionStorage.setItem('liwafilter_005', datastr)
	}

	const refetchFilters = () => {
		let siteID = window.sessionStorage.getItem('liwaSiteID')
		let userID = window.sessionStorage.getItem('liwaUserID')
		filters.value.siteID = siteID
		filters.value.userID = userID
		filters.value.shortItems = ''
		filters.value.itemTypeID = ''
		filters.value.startDate = ''
		filters.value.endDate = ''
		filters.value.status = -1
		filters.value.orderCol = orderCol.value
		filters.value.sortDir = sortDir.value
		filters.value.page = page.value
		filters.value.pageSize = pageSize.value
		let datastr = JSON.stringify(filters.value)
		window.sessionStorage.setItem('liwafilter_005', datastr)
	}

	const runFilter = () => {
		fetchData()
		isFilter.value = false
	}	

	// 設定 filters 內容 ends

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
    	let compName = window.sessionStorage.getItem('liwaSiteName')
    	const title = useTitle(compName+`- 公告列表`)
		refetchFilters()	
		fetchData()
		loadDetail1()
	})

	definePageMeta({
	  title: '公告列表',
	  layout: "default",
	})	
</script>

<template>
<banner
	:progname="progName"
	:proglink="proglink"
	:detailflg="detailFlg"
	:detailkey="detailKey"
></banner>
<div v-if="error">{{ error }}</div>
<div class="w-full bg-slate-200 px-4 py-2">
	<div class="barPanel h-12 rounded-3xl ml-4 mb-2 px-1">
		<div class="top-icon ml-4 -mt-1 pl-[.125rem] pt-[.125rem]" @click="toggleFilter()">
			<IconSearch class="w-6 h-6 text-white font-bold" />
		</div>		
		<div class="top-icon ml-2 -mt-1 pl-[.125rem] pt-[.125rem]" @click="setMainID('add')">
			<IconPlusLg class="w-7 h-7 text-white font-bold" />
		</div>
		<div class="top-icon ml-2 -mt-1 pl-[.125rem] pt-[.125rem]" @click="deleteData">
			<IconTrash class="w-7 h-7 text-white font-bold" />
		</div>
	</div>	
	<div v-if="liwaData.length" class="mx-auto my-0 p-2 border-2 relative">
		<div class="w-full flex flex-row">
	    	<div class="w-full sm:h-96 md:h-[36rem] lg:h-[44rem] min-h-full -my-2 overflow-auto sm:-mx-6 lg:-mx-8">
	        	<div class="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
			        <div class="shadow border-b border-gray-500 bg-white">
			        	<table class="min-w-full divide-x divide-y divide-gray-200 bg-white">
			            	<thead class="bg-gray-50">
			                	<tr class="bg-emerald-300">
			                  		<th class="thPanel w-2/16 pl-4">
										<div class="w-8 h-8 border-4 border-slate-500" @click="toggleChkAll()">
											<div v-if="isChkAllMode == 1">
												<IconCheck class="w-7 h-7 text-green-400 font-bold" />
											</div>
											<div v-if="isChkAllMode == 0">
												<IconDash class="w-7 h-7 text-green-400 font-bold" />
											</div>
										</div>	
			                  		</th>
			                  		<th scope="col" class="thPanel w-2/5">
			                    	公告標題
			                  		</th>
			                  		<th scope="col" v-if="useShowmode()>1" class="thPanel w-2/5">
			                    	公告日期
			                  		</th>
			                  		<th scope="col" v-if="useShowmode()>1" class="thPanel w-2/16">
			                    	公告類別
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
									<td scope="col" class="px-3 py-3 border-b order-gray-300 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
										<div class="w-full h-full flex flex-row justify-evenly pt-2">
											<div class="w-8 h-8 border-4 border-slate-500 mr-4" @click.stop.prevent="setChkList(record.mainID)">
												<div v-if="record.isChecked==1">
													<IconCheck class="w-7 h-7 text-orange-400 font-bold" />
												</div>
											</div>
											<div class="w-8 h-8" @click="setBM(record.mainID)">
												<div v-if="record.bookmark=='0'">
													<IconStar class="w-7 h-7 text-orange-400 font-bold" />
												</div>	
												<div v-else>
													<IconStarFill class="w-7 h-7 text-green-400 font-bold" />
												</div>
											</div>
										</div>	
									</td>
							        <td scope="col" class="tdPanel w-2/5">{{ record.shortItems }}
							        </td>
							        <td v-if="useShowmode()>1" class="tdPanel w-2/5">{{ record.pDate }}
							        </td>
						            <td v-if="useShowmode()>1" class="tdPanel w-1/5">{{ record.itemType }}
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
<div v-if="isFilter" class="absolute top-[170px] lg:top-[110px] z-10 inset-x-0 w-screen h-[calc(100vh_-_79px)] bg-transparent overflow-hidden items-center justify-center">
    <div class="flex justify-center w-full h-screen bg-transparent items-start antialiased">
      	<div class="h-full lg:h-[calc(100%_-_28rem)] flex flex-col mt-4 w-11/12 sm:w-5/6 lg:w-1/2 max-w-lg mx-auto rounded-lg border border-gray-300 shadow-xl">
        	<div class="relative flex flex-row justify-between px-6 py-2 bg-white border-b border-gray-200 rounded-tl-lg rounded-tr-lg text-center ">
        		<div class="w-5/7 h-8 text-2xl text-center">公告查詢</div>
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
			          form-class="w-full "
			          name="shortItems"
			          label="標題"
			          type="text"
			          v-model="filters.shortItems"
			          value=""
			          placeholder="輸入公告標題"
			          help="可輸入部份文字"
			        />
			        <div class="w-[95%] flex flex-col lg:flex-row justify-between">
				        <FormKit
				          name="startDate"
				          label="起始日"
				          type="date"
				          v-model="filters.startDate"
				        />
				        <FormKit
				          name="endDate"
				          label="結束日"
				          type="date"
				          v-model="filters.endDate"
				        />				        	
			        </div>
			        <FormKit
			          outer-class="relative"
			          name="itemTypeID"
			          label="公告類別"
			          type="liwaDrop"
			          v-model="filters.itemTypeID"
			          help="請選擇公告類別"
			          :sVal="itemType"
			          :arrOption="liwaDetail1"
			        />
			        <FormKit
			          name="status"
			          label="上架狀態"
			          type="select"
			          v-model="filters.status"
			          :options="statusOption"
			          help="請選擇上架狀態"
			        />
        		</FormKit>
        	</div>
        </div>
    </div>
</div>
<liwaMsg 
  	v-if="isMsg"
  	:msgTitle="objMsg.title"
  	:msgBody="objMsg.body"
  	:modalType="objMsg.modalType"
  	@hideMsg="hideMsg"
  	@confirmOK="confirmOK"
/>  
</template>