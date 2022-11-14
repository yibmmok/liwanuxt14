<script setup lang="ts">
	/*********************************************************
	prog name: 使用者列表, author: James Lin, date: 2020/04/19

	**********************************************************/
	import type { Ref } from "vue"
	import { ref, reactive, onMounted } from "vue"
	import { useFetch, createFetch, useStorage, useTitle } from "@vueuse/core"
	import banner from "../../components/banner"
	import liwaMsg from "../../components/liwaMsg.vue"
	import { IconPlusLg, IconSearch, IconTrash, IconCheck, IconDash, IconStar, IconStarFill, IconX } from '@iconify-prerendered/vue-bi'

	const error = ref('')
	const liwaData = ref({})
	const progName = ref('使用者群組列表')
	const proglink = ref('/003')
	const detailFlg = ref(false)
	const detailName = ref('')
	const siteID = ref('')
	const mainID = ref('')
	const action = ref('')
	const itemIcon = ref('')
	const arrChklist = ref([])
	const arrChklistIndex = ref([])
	const nuUGroupName = ref('')
	// liwaMsg 初始值
	const isMsg = ref(false)
	const objMsg = reactive({
		title: '',
		body: '',
		modalType: 1
	})

	const fetchData = async () => {
		siteID.value = window.sessionStorage.getItem('liwaSiteID')
		let APIsvr = window.sessionStorage.getItem('liwaAPIsvr')
		let url = `${APIsvr}/003_havelist.php?siteID=${siteID.value}`
		const data = await useFetch(url, {method: 'GET'}, {refetch: true}).get().json()
		liwaData.value = data.data.value.arrSQL
	}

	const setMainID = (sID) => {
		let makerID = window.sessionStorage.getItem('liwaUserID');
		if (sID !== makerID) window.location.href = `${proglink.value}/${sID}`
	}

	const addNewGroup = () => {
		let keydata = {
			'uGroupID': '',
			'uGroupName': '新使用者群組',
			'isChecked': '0',
			'bEdit': '1'
		}
		liwaData.value.push(keydata)
		action.value = 'add'
	}

	const toggleEdit = (sID) => {
		// 先取消所有 liwaData 的 bEdit
		liwaData.value.forEach((obj) => {
			obj.bEdit = '0'
		})
		let res = liwaData.value.filter((n) => n.uGroupID == sID)
		res[0].bEdit = '1'
		nuUGroupName.value = res[0].uGroupName
		action.value = 'edit'
	}

	const cancelEdit = () => {
		liwaData.value.forEach((obj) => {
			obj.bEdit = '0'
		})
		action.value = ''
	}

	const toggleChecked = (idx) => {
		let iListIndex = liwaData.value.findIndex((m) => m.uGroupID == idx)
		let res = liwaData.value.filter((n) => n.uGroupID == idx)
		let iCheck = (res[0].isChecked == '1')? '0': '1'
		res[0].isChecked = iCheck
		let iCount = 0
		// 若 iCheck == 1(代表已被選), 將 idx加入 arrChklist內, 否則從 arrChklist移除
		if (iCheck == 1) {
			arrChklist.value.push(idx)
			arrChklistIndex.value.push(iListIndex)
			// 檢查是否已全選, 若是, isChkAllMode = 1
			iCount = 0
			arrChklist.value.forEach((n1) => {
				// 逐筆檢查, 若已全選, isChkAllMode = 1
				let res1 = liwaData.value.filter((m1) => m1.uGroupID == n1)
				// 若在liwaData內找到 iCount +1
				if (res1[0].length > 0) iCount += 1
			})
		} else {
			// unChecked
			let iIndex0 = arrChklistIndex.value.indexOf(iListIndex)
			arrChklistIndex.value.splice(iIndex0, 1)
			let iIndex = arrChklist.value.indexOf(idx)
			arrChklist.value.splice(iIndex, 1)
			iCount = 0
			arrChklist.value.forEach((n2) => {
				// 逐筆檢查, 若非全選, isChkAllMode = 0
				let res2 = liwaData.value.filter((m2) => m2.uGroupID == n2)
				// 若在liwaData內找到 iCount +1
				if (res2[0].length > 0) iCount += 1
			})
		}
	}

	const changeUGroupName = async (sID) => {
		// 改名: 1 先變更data, 若成功, 則2A. 改名, bEdit='0', 否則不變
		let uGroupID = ''
		let res = liwaData.value.filter((n) => n.uGroupID == sID)
		// if (action.value == 'edit') {
		// 	let res = liwaData.value.filter((n) => n.uGroupID == sID)
		// } 
		
		let keydata = {
			'siteID': window.sessionStorage.getItem('liwaSiteID'),
			'uGroupID': (action.value == 'add')?'':res[0].uGroupID,
			'uGroupName': nuUGroupName.value,
			'action': action.value
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
	    const { data } = await useMyFetch('003_edit.php').post().json()
	    if (!data.value.message)	{
	    	if (action.value == 'edit') {
		    	res[0].uGroupName = nuUGroupName.value
		    	res[0].bEdit = '0'
	    	} else {
	    		fetchData()
	    		nuUGroupName.value = ''
	    	}
	    } else {

	    }
	    action.value = ''
	}

	const deleteData = async () => {
		let arrSel = []
		liwaData.value.forEach((obj) => {
			if (obj.isChecked == '1') {
				arrSel.push(obj.uGroupID)
			}
		})
		let details = arrSel.toString()
		let keydata = {
			'siteID': window.sessionStorage.getItem('liwaSiteID'),
			'details': details,
			'action': 'delete'
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
	    const { data } = await useMyFetch('003_edit.php').post().json()
	    if (!data.value.message) {
	    	arrChklistIndex.value.sort().reverse().forEach((n1) => {
	    		liwaData.value.splice(n1, 1)
	    	})
	    } else {
	    	showMsg('刪除群組錯誤', data.value.message, 1)
	    }
	}

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

	onMounted(() => {
    	let compName = window.sessionStorage.getItem('liwaSiteName')
    	const title = useTitle(compName+`- 使用者群組列表`)
    	let imgsvr = window.sessionStorage.getItem('liwaImgsvr')
    	itemIcon.value = imgsvr + '/syspics/groups.png'
    	// 取得列表資料
		fetchData()
	})	

	definePageMeta({
	  title: 'LiwaSite 使用者群組管理',
	  layout: "default",
	})		
</script>

<template>
<banner
	:progname="progName"
	:proglink="proglink"
	:detailflg="detailFlg"
	:detailName="detailName"
></banner>
<div v-if="error">{{ error }}</div>
<div class="w-full bg-slate-200 px-4 py-2">
	<div class="barPanel h-12 rounded-3xl ml-4 mb-2 px-1">
		<div class="top-icon ml-2 -mt-1 pt-[.125rem] pl-[.125rem]" @click="addNewGroup()">
			<IconPlusLg class="w-7 h-7 text-white font-bold" />
		</div>
		<div class="top-icon ml-2 -mt-1 pt-[.125rem] pl-[.125rem]" @click="deleteData()">
			<IconTrash class="w-7 h-7 text-white font-bold" />
		</div>		
	</div>
	<div v-if="liwaData.length" class="mx-auto my-0 p-2 border-2 relative">
		<div class="w-full flex flex-col">
	    	<div class="w-[97%] sm:h-96 md:h-[36rem] lg:h-[42rem] min-h-full -my-2 overflow-x-hidden overflow-y-auto sm:-mx-6 lg:mx-8 bg-white">
	    		<div class="w-full flex flex-row justify-items-center">
					<div v-for="(uGroup, index) in liwaData" :key="index" :data-id="uGroup.uGroupID" 
						class="w-24 h-32 mx-2 my-1 bg-neutral-300 text-xl text-center rounded cursor-pointer flex flex-row justify-between relative"
						>
						<div class="flex flex-col">
							<div class="w-full h-24"
								@click.prevent="setMainID(uGroup.uGroupID)"
							>
								<img :src="itemIcon" width="80" class="mt-4"/>
							</div>
							<div class="w-full h-8 text-center ml-2">
								<div v-if="uGroup.bEdit=='0'" class="text-center text-sm" @click.stop="toggleEdit(uGroup.uGroupID)">{{ uGroup.uGroupName }}</div>
								<div v-else class="w-20 h-8 -ml-1 mb-2">
									<input type="text" class="w-[5.5rem] h-6 border-0 bg-white text-center text-sm" placeholder="輸入群組名稱" v-model="nuUGroupName" @keyup.enter.stop="changeUGroupName(uGroup.uGroupID)" @keyup.esc.stop="cancelEdit()"/>
								</div>
							</div>
						</div>
						<div class="absolute w-6 h-6 top-1 left-1 border-2 border-slate-700" @click.prevent="toggleChecked(uGroup.uGroupID)">
							<div v-if="uGroup.isChecked=='1'" class="mt-1 ml-1">
								<IconCheck class="w-7 h-7 text-green-400 font-bold" />
							</div>								
						</div>						
					</div>
				</div>
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