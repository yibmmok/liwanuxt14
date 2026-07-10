<script setup lang="ts">
	/*********************************************************
	prog name: 內部團體明細CRUD, author: James Lin, date: 2022/08/02
	To Do: 發佈日期與下架日期改格式
	**********************************************************/
	import { ref, toRefs, onMounted, computed } from "vue"
	import { useFetch, createFetch, useTitle } from "@vueuse/core"
	import queryString from "query-string"
	import banner from "../../components/banner"
	import liwaMsg from "../../components/liwaMsg.vue"
	import liwa2ColList from "../../components/liwa2ColList.vue"
	import TinyMceEditor from "@tinymce/tinymce-vue"
	import { IconPlusLg, IconSearch, IconX, IconAirplane } from '@iconify-prerendered/vue-bi'	

	const mainID = ref('')
	const progName = ref('內部團體列表')
	const proglink = ref('/010')
	const progID = ref('010')
	const detailFlg = ref(true)
	const detailName = ref('')
	const APIsvr = ref('')
	const Imgsvr = ref('')
	const debug = ref(false)
	const tmpData = ref({})
	const liwaData = ref({})  // 團體的基本資料
	const liwaD1 = ref([])  //目前已經在團體中的成員
	const liwaD1A = ref([]) // 可加入團體的待選成員
	const liwaDall = ref([])
	const stitle = ref('')
	const submitted = ref(false)
	const isMember = ref(true)
	const isMsg = ref(false)
	const isConfig = ref(false)

	const action = ref('view')
	const arrUsers = ref([])
	const dlgLiwa01A = ref(false)
	const sLeader = ref('')
	const D1AParams = ref('') // 已加入的成員ID

	const loadAllMember = async () => {
		let keydata = {
			'JWT': window.localStorage.getItem('liwaJWT'),
			'params': '',
			'action':'view'
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
	    const { data } = await useMyFetch("010_haveD1A.php").post().json() 
	    if (data.value.arrSQL.length > 0) {
	    	liwaDall.value = data.value.arrSQL
	    }
		console.log('liwaDall =', liwaDall.value)
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
	// 設定對話盒及設定對話盒相關 ends

	const loadData = async () => {
		let keydata = {
			'JWT': window.localStorage.getItem('liwaJWT'),
			'mainID': mainID.value
		}
		let sQuery = queryString.stringify(keydata)		
		let url = `${APIsvr.value}/010_haveDetail.php?${sQuery}`
		const data = await useFetch(url, {method: 'GET'}, {refetch: true}).get().json()
		liwaData.value = data.data.value.arrSQL[0]
		liwaData.value.mainID = mainID.value
		sLeader.value = liwaData.value.leader
		detailName.value = liwaData.value.clubName
		stitle.value = detailName.value 
	}	

	const loadD1 = async () => {
		// 取得內部團體成員列表
		let keydata = {
			'JWT': window.localStorage.getItem('liwaJWT'),
			'mainID':mainID.value
		}
		let sQuery = queryString.stringify(keydata)		
		let url = `${APIsvr.value}/010_haveD1.php?${sQuery}`
		const detail1 = await useFetch(url, {method: 'GET'}, {refetch: true}).get().json()
		liwaD1.value = detail1.data.value.arrSQL
		console.log('liwaD1 =', liwaD1.value)
	}

	const saveData = async () => {
		if (action.value == 'view') action.value = 'edit'
		liwaData.value.leader = sLeader.value
		liwaData.value.D1 = liwaD1.value
		liwaData.value.action = action.value
		liwaData.value.JWT = window.localStorage.getItem('liwaJWT')
		let datastr = JSON.stringify(liwaData.value)
		// console.log('datastr =', datastr)
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
	    const { data } = await useMyFetch('010_edit.php').post().json()
	    let msg = data.value.message
	    if (!msg) {
		    if (liwaData.value.action == 'add') {
		    	mainID.value = data.value.key
		    	window.location.href = '/010/' + mainID.value 
		    } 
		    action.value = 'view'
	    } else {
	    	showMsg('存檔錯誤', msg, 1)
	    }
	}

	const jumpAdd = () => {
		window.location.href = '/010/add'
	}

	const clearData = () => {
		let tmpData = {
			'action': 'add',
			'mainID': '',
			'createDate': '',
			'members': liwaD1.value.length,
			'leaderID': '',
			'leader': '',
			'clubName': '',
			'D1':[]
		}
		action.value = 'add'
		detailName.value = '新增內部團體'
		stitle.value = '新增內部團體'
		liwaData.value = tmpData		
	}

	const setNewD1A = async (arrD1A) => {
		// 將新勾選的成員加入 liwaD1中
		let iLength = arrD1A.length
		// 將 arrD1A 逐一加入liwaD1中
		arrD1A.forEach((m) => {
			// 從 liwaDall取得filter資料
			let res = liwaDall.value.filter((n) => n.mainID == m)
			let objItem = {
				"value": res[0].mainID,
				"label": res[0].nickname,
				"keyman": 0,
				"picpath": Imgsvr.value + res[0].picpath
			}
			liwaD1.value.push(objItem)
		})		
		hideDlgLiwa01A()
	}

	const hideDlgLiwa01A = () => {
		dlgLiwa01A.value = !dlgLiwa01A.value
	}

	const addUser = () => {
		liwaD1A.value = []
		liwaD1.value.forEach((m) => {
			liwaD1A.value.push(m.value)
		})
		D1AParams.value = JSON.stringify(liwaD1A.value)
		if (!dlgLiwa01A.value) dlgLiwa01A.value = true
	}

	const remvMember = (idx) => {
		// 團體管理員不得刪除, 先檢查 liwaD1
		let sID = liwaD1.value[idx].value
		if (sID !== liwaData.value.leaderID) {
			liwaD1.value.splice(idx, 1)
		} else {
			showMsg('系統訊息', '刪除錯誤: 團體管理人不得刪除!', 2)
		}
	}

	const testProc = () => {

	}

	onMounted(() => {
		useHead({title:'內部團體明細'})
		APIsvr.value = window.sessionStorage.getItem('liwaAPIsvr')	
		window.sessionStorage.setItem('liwaProgID', progID.value)
		Imgsvr.value = window.sessionStorage.getItem('liwaImgsvr')	
		// 取得 mainID, 由mainID取得
		const route = useRoute()
		mainID.value = route.params.id
		//	由 main
		loadAllMember()
		if (mainID.value !== 'add') {
			loadData()
			loadD1()
		} else {
			clearData()
		}
		
	})	
</script>

<template>
<NuxtLayout name="default">  
<banner
	v-if="detailName"
	:progname="progName"
	:proglink="proglink"
	:detailflg="detailFlg"
	:detailName="detailName"
></banner>	
<main class="w-full h-full flex flex-col justify-center items-center bg-slate-200">
	<div class="barPanel w-full h-12 rounded-3xl mt-2 ml-4 mb-2 px-1 flex flex-row justify-between relative">
		<div class="flex flex-row mt-2 absolute left-1 top-1">
			<div class="top-icon add ml-4 -mt-1" @click="jumpAdd()">
				<IconPlusLg class="w-7 h-7 text-white font-bold" />
			</div>
			<div v-if="debug" class="top-icon add ml-4 -mt-1" @click="testProc()">
				<IconAirplane class="w-7 h-7 text-white font-bold" />
			</div>			
		</div>
		<div class="w-full text-center">
			{{ stitle }}
		</div>
	</div>
	<div class="w-full lg:w-[1024px] lg:max-w-[1024px]">
		<div v-if="detailName" class="bg-white m-2 rounded-xl py-1">
			<FormKit 
			form-class="px-4 py-2 bg-yellow-200 rounded-2xl w-11/12"
			type="form"
			v-model="liwaData"
			:form-class="submitted? 'hidden': 'block'"
			style="margin: 1rem auto;"
			submit-label="存檔"
			@submit="saveData()"
			>
				<FormKit
					name="clubName"
					label="內部團體名稱*"
					type="text"
					placeholder="請輸入內部團體名稱"
					help="輸入內部團體的名稱(字數限制50字)"
					validation="required"
				/>
				<div v-if="liwaD1.length > 0">
					<FormKit
						name="leaderID"
						label="團體管理人*"
						type="liwaDrop"
						:arrOption="liwaD1"
						:sVal="sLeader"
						help="請從下拉選單選擇團體管理人"
						validation="required"
					/>						
				</div>
				<div v-if="action == 'add'" class="w-full mb-4">
					<FormKit
						name="createDate"
						label="建立日期"
						type="date"
						placeholder="請設定"
						help="請設定團體建立日期"
					/>					
				</div>
				<div v-else class="w-full text-lg text-zinc-600">
					<span class="text-zinc-600">建立日期:</span>{{ liwaData.createDate }}
				</div>
				<div class="w-full text-lg text-zinc-600">
					<span class="text-zinc-600">成員數:</span>{{ liwaData.members }}
				</div>
				<div class="w-full min-h-[265px] flex flex-col">
					<div class="w-full h-12 text-center text-white pt-2 bg-zinc-800 relative">
						成員列表
						<div class="w-30 h-12 flex flex-row justify-evenly bg-transparent absolute top-2 left-2">
							<div v-if="liwaD1.length > 30" class="w-8 h-8 mr-2" @click="">
								<IconSearch class="w-8 h-8 text-white font-light cursor-pointer" />
							</div>
							<div class="w-8 h-8 bg-transparent" @click="addUser()">
								<IconPlusLg class="w-8 h-8 text-white font-light cursor-pointer" />
							</div>							
						</div>
					</div>
					<div v-if="isMember" class="w-full min-h-[220px] mb-4 pt-2 px-1 flex flex-col lg:flex-row flex-wrap border-[1px] border-zinc-800">
						<div v-for="(item, index) in liwaD1" :key="index" class="w-[80px] h-[96px] mx-2 bg-transparent text-black ring-[0.1rem] ring-gray-300 relative ">
							<div class="w-[60px] h-[60px] mx-auto">
								<img :src="item.picpath" width="60"/>
							</div>
							<div class="w-full text-center text-base bg-transparent">{{ item.label }}</div>
							<div class="w-4 h-4 absolute top-1 right-1 bg-transparent" @click="remvMember(index)">
								<IconX class="w-4 h-4 text-red-400 font-semibold" />
							</div>
						</div>
					</div>
				</div>
      
			</FormKit>
		</div>
	</div>
</main>
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
	<Teleport to="body">
	  <div v-if="dlgLiwa01A" 
	    class="w-full h-[100vh] fixed top-0 left-0 bg-slate-100 z-[500]"
	  >
		<div class="w-full h-full bg-transparent relative">
			<div class="md:w-[800px] mx-auto mt-[200px] lg:mt-[130px] bg-white relative">
				<div class="w-8 h-8 absolute top-2 left-2 bg-red-600 rounded-full z-50" @click="hideDlgLiwa01A()">
					<IconX class="w-8 h-8 text-white font-bold" />
				</div>
				<liwaMultiSelect
					:tblTitle="'待加入成員列表'"
					:progID="'010_D1Alist'"
					:viewUrl="'010_haveD1A.php'"
					:dataUrl="''"
					:params="D1AParams"
					:canEdit="false"
					@setList="setNewD1A"
					@sendMsg="sendMsg"		
				/>				
			</div>
		</div>     
	  </div>    
	</Teleport>	
</NuxtLayout>	
</template>