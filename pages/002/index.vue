<script setup lang="ts">
	/*********************************************************
	prog name: 使用者列表, author: James Lin, date: 2020/04/19
	主要功能: 顯示所有使用者的列表及刪除程式
	**********************************************************/
	import type { Ref } from "vue"
	import { ref, reactive, onMounted } from "vue"
	import { useFetch, createFetch, useStorage, useTitle } from "@vueuse/core"
	import banner from "../../components/banner"
	import { useShowmode } from "../../composables/use-showmode"
	import liwaPages from "../../components/liwaPages"
	import { IconPlusLg, IconSearch, IconTrash, IconCheck, IconDash, IconStar, IconStarFill, IconX, IconCaretDownFill, IconCaretUpFill } from '@iconify-prerendered/vue-bi'

	const error = ref('')
	const liwaData = ref({})
	const progName = ref('使用者列表')
	const proglink = ref('/002')
	const detailFlg = ref(false)
	const detailKey = ref('')
	const isFilter = ref(false)
	const filters = ref({})
	const mainID = ref('')
	const orderCol = ref('username')
	const sortDir = ref('asc')
	const arrChklist = ref([])
	const isChkAllMode = ref(-1)
	const Imgsvr = ref('')
	const arrOrderCol = ref([0,0,0,0,0])	

	const router = useRouter()
	// liwaMsg 初始值
	const isMsg = ref(false)
	const page = ref(1)
	const pageSize = ref(10)
	const totalPage = ref(1)

	/* filterPanel setup starts */
	const rolesOption = ['', '準會員', '正式會員']

	/* filterPanel setup ends */

	const loadData = async () => {
		let siteID = window.sessionStorage.getItem('liwaSiteID')
		let APIsvr = window.sessionStorage.getItem('liwaAPIsvr')
		let url = `${APIsvr}/002_havelist.php?siteID=${siteID}&filterName=${filters.value.username}&filterEmail=${filters.value.usermail}&filterRole=${filters.value.role}&filterOnboard1=${filters.value.onboard1}&filterOnboard2=${filters.value.onboard2}&orderCol=${orderCol.value}&sortDir=${sortDir.value}&page=${page.value}&pageSize=${pageSize.value}`
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

		// 每次loadData 後都要把filters存下來
		saveFilters()		
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
			if (iCount == 0) isChkAllMode.value = -1
			else isChkAllMode.value = 0
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

	const setOrder = (sName, idx) => {
		if (sName == orderCol.value) {
			let iStatus = Number(arrOrderCol.value[idx])
			if (iStatus < 2) {
				iStatus ++
				arrOrderCol.value[idx] = iStatus
				sortDir.value = (iStatus == 2)?'desc':'asc'
			} else {
				arrOrderCol.value[idx] = 1
				sortDir.value = 'asc'
			}
		} else {
			// arrOrderCol.value.forEach((n1) => n1 = 0)
			for (let i=0; i<arrOrderCol.value.length; i++) {
				arrOrderCol.value[i] = 0
			}
			arrOrderCol.value[idx] = 1
			orderCol.value = sName
			sortDir.value = 'asc'
		}
		loadData()
		// saveFilters()		
	}	

	const setActvPage = (iPage) => {
		page.value = iPage
		loadData()
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
	    const { data } = await useMyFetch('002_edit.php').post().json()
	    if (!data.value.message) {
	    	loadData()
	    } else {
	    	showMsg('刪除錯誤', data.value.message, 1)
	    }	
	}

	// 設定 filters 內容 starts
	const toggleFilter = () => {
		// 顯示 filters 對話盒
		refetchFilters()
		isFilter.value = !isFilter.value
	}

	const saveFilters = () => {
		// 將過濾條件存在storage內
		let datastr = JSON.stringify(filters.value)
		window.sessionStorage.setItem('liwafilter_002', datastr)
	}

	const refetchFilters = () => {
		let tmpFilters = window.sessionStorage.getItem('liwafilter_002')
		if ((tmpFilters == "") || (tmpFilters == null)) {
			// sessionStorage內的liwafilters有值
			filters.value.username = ''
			filters.value.usermail = ''
			filters.value.role = ''
			filters.value.onboard1 = ''
			filters.value.onboard2 = ''
			filters.value.orderCol = orderCol.value
			filters.value.sortDir = sortDir.value
			filters.value.page = page.value
			filters.value.pageSize = pageSize.value
			let datastr = JSON.stringify(filters.value)
			window.sessionStorage.setItem('liwafilter_002', datastr)
		} else {
			let arrFilters = JSON.parse(tmpFilters)
			filters.value = arrFilters
		}
	}

	const goSearch = () => {
		// 顯示結果並關閉對話盒
		loadData()
		saveFilters()
		isFilter.value = false
	}		
	// 設定 filters 內容 ends

	// 設定 liwaMsg starts
	const objMsg = reactive({
		title: '',
		body: '',
		modalType: 1
	})

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
    	const title = useTitle(compName+`- 使用者列表`)
    	Imgsvr.value = window.sessionStorage.getItem('liwaImgsvr')
		// 先設定filter條件
		refetchFilters()
		loadData()
		saveFilters()
	})

	definePageMeta({
	  title: 'LiwaSite 使用者管理',
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
		<div class="top-icon filter ml-4 -mt-1 pt-1 pl-1" @click="toggleFilter()">
			<IconSearch class="w-6 h-6 text-white font-bold" />
		</div>		
		<div class="top-icon add ml-2 -mt-1" @click="setMainID('add')">
			<IconPlusLg class="w-8 h-8 text-white font-bold" />
		</div>
		<div class="top-icon ml-2 -mt-1 pt-[.125rem] pl-[.125rem]" @click="deleteData">
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
			                	<tr class="bg-emerald-600">
			                  		<th class="thPanel w-1/12">
											<div class="w-8 h-8 border-4 border-amber-400 pl-4" @click="toggleChkAll()">
												<div v-if="isChkAllMode == 1" class="-mx-4 -my-1">
													<IconCheck class="w-7 h-7 mt-1 text-amber-300 font-bold" />
												</div>
												<div v-if="isChkAllMode == 0">
													<IconDash class="w-7 h-7 -ml-[1.125rem] -mt-[.125rem] text-amber-300 font-bold" />
												</div>
											</div>	
			                  		</th>
			                  		<th scope="col" class="thPanel w-2/12 relative">
			                    		<div class="text-white cursor-pointer" @click="setOrder('username', 0)">姓名</div>
			                    		<div v-if="arrOrderCol[0]==1">
			                    			<!-- 昇冪排列 -->
			                    			<IconCaretUpFill class="w-7 h-7 absolute right-1 top-3 text-amber-300 font-bold" />
			                    		</div>
			                    		<div v-if="arrOrderCol[0]==2">
			                    			<!-- 降冪排列 -->
			                    			<IconCaretDownFill class="w-7 h-7 absolute right-1 top-3 text-amber-300 font-bold" />
			                    		</div>
			                  		</th>
			                  		<th scope="col" v-if="useShowmode()>1" class="thPanel w-2/12 text-white relative">
			                    		<div class="text-white cursor-pointer" @click="setOrder('usermail', 1)">email</div>
			                    		<div v-if="arrOrderCol[1]==1">
			                    			<!-- 昇冪排列 -->
			                    			<IconCaretUpFill class="w-7 h-7 absolute right-1 top-3 text-amber-300 font-bold" />
			                    		</div>
			                    		<div v-if="arrOrderCol[1]==2">
			                    			<!-- 降冪排列 -->
			                    			<IconCaretDownFill class="w-7 h-7 absolute right-1 top-3 text-amber-300 font-bold" />
			                    		</div>
			                  		</th>
			                  		<th scope="col" v-if="useShowmode()>1" class="thPanel w-2/12 text-white relative">
			                    		<div class="text-white cursor-pointer" @click="setOrder('onboard', 2)">註冊時間</div>
			                    		<div v-if="arrOrderCol[2]==1">
			                    			<!-- 昇冪排列 -->
			                    			<IconCaretUpFill class="w-7 h-7 absolute right-1 top-3 text-amber-300 font-bold" />
			                    		</div>
			                    		<div v-if="arrOrderCol[2]==2">
			                    			<!-- 降冪排列 -->
			                    			<IconCaretDownFill class="w-7 h-7 absolute right-1 top-3 text-amber-300 font-bold" />
			                    		</div>
			                  		</th>
			                  		<th scope="col" v-if="useShowmode()>2" class="thPanel w-2/12 text-white relative">
			                    		<div class="text-white cursor-pointer" @click="setOrder('roles', 3)">會員資格</div>
			                    		<div v-if="arrOrderCol[3]==1">
			                    			<!-- 昇冪排列 -->
			                    			<IconCaretUpFill class="w-7 h-7 absolute right-1 top-3 text-amber-300 font-bold" />
			                    		</div>
			                    		<div v-if="arrOrderCol[3]==2">
			                    			<!-- 降冪排列 -->
			                    			<IconCaretDownFill class="w-7 h-7 absolute right-1 top-3 text-amber-300 font-bold" />
			                    		</div>
			                  		</th>
			                  		<th scope="col" v-if="useShowmode()>2" class="thPanel w-3/12 text-white relative">
			                    		<div class="text-white cursor-pointer" @click="setOrder('loginTime', 4)">上次登入時間</div>
			                    		<div v-if="arrOrderCol[4]==1">
			                    			<!-- 昇冪排列 -->
			                    			<IconCaretUpFill class="w-7 h-7 absolute right-1 top-3 text-amber-300 font-bold" />
			                    		</div>
			                    		<div v-if="arrOrderCol[4]==2">
			                    			<!-- 降冪排列 -->
			                    			<IconCaretDownFill class="w-7 h-7 absolute right-1 top-3 text-amber-300 font-bold" />
			                    		</div>
			                  		</th>
			                	</tr>
			              	</thead>
							<tbody class="w-full bg-white ring-1 ring-gray-50">
								<tr 
									class="odd:bg-white even:bg-slate-200"
									v-for="(user, index) in liwaData" 
									:key="index"
									:data-id="user.mainID" 
									>
									<td scope="col" class="py-3 border-b order-gray-300 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
										<div class="w-full h-full flex flex-row justify-start pl-6 pt-2">
											<div class="w-8 h-8 border-4 border-slate-500 mr-8" @click.stop.prevent="setChkList(user.mainID)">
												<div v-if="user.isChecked==1">
													<IconCheck class="w-7 h-7 text-green-400 font-bold" />
												</div>
											</div>
											<div class="w-8 h-8" @click="setBM(user.mainID)">
												<div v-if="user.bookmark=='0'">
													<IconStar class="w-7 h-7 text-orange-400 font-bold" />
												</div>	
												<div v-else>
													<IconStarFill class="w-7 h-7 text-orange-400 font-bold" />
												</div>
											</div>
										</div>	
									</td>
							        <td scope="col" class="tdPanel w-2/12" @click.prevent="setMainID(user.mainID)">{{ user.username }} 
							        </td>
							        <td v-if="useShowmode()>1" class="tdPanel w-2/12" @click.prevent="setMainID(user.mainID)">{{ user.usermail }}
							        </td>
						            <td v-if="useShowmode()>1" class="tdPanel w-2/12" @click.prevent="setMainID(user.mainID)">{{ user.onboard }}
						            </td>
						            <td v-if="useShowmode()>2" class="tdPanel w-2/12" @click.prevent="setMainID(user.mainID)">{{ user.roles }}
						            </td>
						            <td v-if="useShowmode()>2" class="tdPanel w-3/12" @click.prevent="setMainID(user.mainID)">{{ user.loginTime }}
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
        		<div class="w-5/7 h-8 text-2xl text-center">使用者查詢</div>
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
			          form-class="w-full "
			          name="username"
			          label="姓名"
			          type="text"
			          placeholder="輸入使用者姓名"
			          help="可輸入部份文字"
			        />
			        <FormKit
			          name="usermail"
			          label="Email"
			          type="text"
			          help="可輸入部份Email 文字"
			        />
			        <FormKit
			          name="role"
			          label="會員類別"
			          type="select"
			          :options="rolesOption"
			          help="請選擇會員類別"
			        />
			        <div class="w-[95%] flex flex-col lg:flex-row justify-between">
				        <FormKit
				          name="onboard1"
				          label="註冊日期(上限)"
				          type="date"
				        />
				        <FormKit
				          name="onboard2"
				          label="註冊日期(下限)"
				          type="date"
				        />				        	
			        </div>
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