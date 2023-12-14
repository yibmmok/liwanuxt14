<script setup lang="ts">
	/*********************************************************
	prog name: 表格設定列表, author: James Lin, date: 2022/02/06

	**********************************************************/
	import type { Ref } from "vue"
	import { ref, reactive, onMounted, computed } from "vue"
	import queryString from "query-string"
	import { useFetch, createFetch, useStorage, useTitle } from "@vueuse/core"
	import banner from "../../components/banner"
	import { useShowmode } from "../../composables/use-showmode"
	import liwaTbl from "../../components/liwaTbl"
	import { IconPlusLg, IconSearch, IconX, IconTrash } from '@iconify-prerendered/vue-bi'

	const APIsvr = ref('')
	const liwaData = ref({})
	const liwaDetail = ref([])
	const sortIndex = ref(0)
	const progName = ref('表格設定列表')
	const proglink = ref('/B01')
	const detailFlg = ref(false)
	const detailKey = ref('')
	const isFilter = ref(false)
	const filters = ref({})
	const bShowTbl = ref(false)
	const sProgID = ref('')
	const tblParam = ref('')
	const isDetail = ref(false)
	const Dkeydata = ref([])
	const action = ref('view')
	const mainID = ref('')

	const Imgsvr = ref('')
	const paramstr = ref('')
	const arrShowMode = ref([{"value":"0","label":"sm"},{"value":"1","label":"md"},{"value":"2","label":"lg"}])
	const arrCalcType = ref([{"value":"","label":""},{"value":"var1","label":"被乘數"},{"value":"var2","label":"乘數"},{"value":"var3","label":"結果"}])

	const router = useRouter()
	// liwaMsg 初始值
	const isMsg = ref(false)
	const objMsg = reactive({
		title: '',
		body: '',
		modalType: 1
	})

	const queryTbl = () => {
		if (!bShowTbl.value) {
			if (sProgID.value) {
				let keydata = {
					"JWT": window.localStorage.getItem('liwaJWT'),
					"progID": sProgID.value
				}
				paramstr.value = JSON.stringify(keydata)
				bShowTbl.value = true	
			}
		} else {
			sProgID.value = ''
			bShowTbl.value = false
		}
	}

	const setDetail = (sID) => {
		action.value = (sID) ? 'edit' : 'add'
		Dkeydata.value = {
			'JWT': window.localStorage.getItem('liwaJWT'),
			"action": action.value,
			"mainID": sID
		}
		if (action.value == 'edit') {
			mainID.value = sID
			loadDetail()
		} else clearData()
	}

	const loadDetail = async () => {
		let sQuery = queryString.stringify(Dkeydata.value)		
		let url = `${APIsvr.value}/B01_haveDetail.php?${sQuery}`
		const data = await useFetch(url, {method: 'GET'}, {refetch: true}).get().json()
		liwaDetail.value = data.data.value.arrSQL[0]
		liwaDetail.value.isOrder = (Number(liwaDetail.value.isOrder) == 1)? true: false
		liwaDetail.value.canEdit = (Number(liwaDetail.value.canEdit) == 1)? true: false
		isDetail.value = true
	}

	const addData = async () => {
		let arrKeys = []
		let keydata = {
			"action":"add",
			"mainID": ""
		}
		arrKeys.push(keydata)
		setDetail('')
	}	

	const deleteData = async () => {
		bShowTbl.value = false
		let details = arrChklist.value.toString()
		let keydata = {			
			'JWT': window.localStorage.getItem('liwaJWT'),
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
	    const { data } = await useMyFetch(state.dataUrl).post().json()
	    if (!data.value.message) {
	    	bShowTbl.value = true
	    } else {
	    	// 送出錯誤訊息
	    	let msg = data.value.message
	    	showMsg('系統訊息', msg, 2)
	    	bShowTbl.value = true 	
	    }

	}	

	const clearData = () => {
		let tmpData = {
			"mainID":"",
			"progID": sProgID,
			"colNM":"",
			"colField":"",
			"valField":"",
			"fieldPic":"",
			"fieldType":"",
			"isOrder":true,
			"canEdit":true,
			"headCSS":"",
			"bodyCSS":"",
			"bodyOptions":"",
			"slink":"",
			"iIndex":0
		}
		action.value = 'add'
		liwaDetail.value = tmpData
		isDetail.value = true
	}

	const saveData = async (idx) => {
		bShowTbl.value = false
		liwaDetail.value.JWT = window.localStorage.getItem('liwaJWT');
		liwaDetail.value.mainID = mainID.value
		liwaDetail.value.action = action.value
		liwaDetail.value.isOrder = (liwaDetail.value.isOrder)?1: 0
		liwaDetail.value.canEdit = (liwaDetail.value.canEdit)?1: 0
		let datastr = JSON.stringify(liwaDetail.value)
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
	    const { data } = await useMyFetch('B01_edit.php').post().json()
	    let msg = data.value.message
	    isDetail.value = false
	    if (msg) {
	    	showMsg('存檔錯誤', msg, 1)
	    } 
	    bShowTbl.value = true	    
	}

	const closeBox = () => {
		isDetail.value = false
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
		useHead({title:'表格設定列表'})
		APIsvr.value = window.sessionStorage.getItem('liwaAPIsvr')
    	Imgsvr.value = window.sessionStorage.getItem('liwaImgsvr')

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
<div class="w-full mt-4">
	<div class="w-[1024px] px-8 mx-auto flex flex-row">
		<div class="px-4 py-2">ProgID:</div>
		<div class="w-96 px-4 box-border border-b-2 border-b-slate-300">
			<input type="text" class="searchCol w-full" v-model="sProgID"
				@keyup.enter="queryTbl()"
			/>
		</div>
		<div class="w-24 mx-4 py-2 bg-emerald-800 text-white text-center rounded-xl" @click="queryTbl()">查詢</div>		
	</div>
</div>
<div v-if="bShowTbl" class="w-full min-h-[calc(100vh_-_130px)] relative">
	<liwaTbl
		:tblTitle="'格式設定列表'"
		:progID="'B01_M'"
		:viewUrl="'B01_edit.php'"
		:dataUrl="'B01_edit.php'"
		:params="paramstr"
		:canEdit="false"
		@setMainID="setDetail"
	>
		<template v-slot:custom>
			<div class="py-2 absolute left-0 top-2 flex flex-row">
				<div class="top-icon add ml-2 -mt-1" @click="addData()">
					<IconPlusLg class="w-8 h-8 text-white font-bold" />
				</div>
				<div class="top-icon ml-2 -mt-1 pt-[.125rem] pl-[.125rem]" @click="deleteData()">
					<IconTrash class="w-7 h-7 text-white font-bold" />
				</div>					
			</div>	
		</template>
	</liwaTbl>
</div>
<Teleport to="body">
	<div v-if="isMsg" 
		class="w-full h-full absolute top-[130px] left-0 bg-slate-100 z-[500]"
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
	<div v-if="isDetail==true"
		 class="w-full h-full absolute top-[130px] left-0 bg-slate-100 z-[500]"
	>
		<div class="w-full lg:w-[1024px] lg:mx-auto relative">
			<div class="absolute top-4 right-2 z-50" @click="closeBox()">
				<IconX class="w-11 h-11 text-red-400 font-bold" />
			</div>
			<div class="w-full p-2 absolute left-0 bg-transparent flex flex-col" >
				<div class="w-full relative">
					<FormKit 
					form-class="px-4 pt-8 bg-violet-100 "
					type="form"
					v-model="liwaDetail"
					:form-class="submitted? 'hidden': 'block'"
					submit-label="存檔"
					@submit="saveData(index)"
					>
						<div class="w-full px-0 py-2 flex flex-col lg:flex-row">
				        	<div class="w-full lg:w-1/2 pr-4">
						        <FormKit
						          name="colNM"
						          label="標題欄名字*"
						          type="text"
						          placeholder="請設定標題欄名字"
						          help="請設定標題欄名字"
						          validation="required"
						        />
				        	</div>
				        	<div class="w-full lg:w-1/2 pr-4">
						        <FormKit
						          name="colField"
						          label="資料欄位*"
						          type="text"
						          placeholder="請設定資料欄位"
						          help="請設定資料欄位"
						          validation="required"
						        />
				        	</div>	
						</div>	
						<div class="w-full px-0 py-2 flex flex-col lg:flex-row">
				        	<div class="w-full lg:w-1/2 pr-4">
						        <FormKit
						          name="valField"
						          label="下拉選單顯示欄位"
						          type="text"
						          placeholder="請設定下拉選單顯示欄位"
						          help="請設定下拉選單顯示欄位"
						        />
				        	</div>
				        	<div class="w-full lg:w-1/2 pr-4">
						        <FormKit
						          name="fieldPic"
						          label="圖檔路徑欄位"
						          type="text"
						          placeholder="請設定圖檔路徑顯示欄位"
						          help="請設定圖檔路徑顯示欄位"
						        />
				        	</div>	
						</div>	
						<div class="w-full px-0 py-2 flex flex-col lg:flex-row">
				        	<div class="w-full lg:w-1/2 pr-4 flex flex-row">
						        <FormKit
						          name="isOrder"
						          label="是否排序"
						          type="checkbox"
						          :value="true"
						          help="本欄是否允許排序?"
						          wrapper-class="flex flex-row"
						          inner-class="outline-none border-none"
						          label-class="ml-2"
						        />
				        	</div>
				        	<div class="w-full lg:w-1/2 pr-4">
						        <FormKit
						          name="canEdit"
						          label="可否編輯"
						          type="checkbox"
						          :value="true"
						          help="本欄是否在編輯模式允許編輯?"
						          wrapper-class="flex flex-row"
						          inner-class="outline-none border-none"
						          label-class="ml-2"
						        />
				        	</div>	
						</div>
				        <FormKit
				          name="fieldType"
				          label="欄位型態*"
				          type="text"
				          placeholder="請設定編輯模式的欄位型態"
				          help="請設定編輯模式的欄位型態"
				          validation="required"
				        />	
				        <FormKit
				          name="calcType"
				          label="計算類型"
				          type="select"
				          :options="arrCalcType"
				          help="設定自動運算公式中的被乘數, 乘數, 結果。設定值為 var1:被乘數; var2:乘數; var3:結果。"
				        />
				        <FormKit
				          name="headCSS"
				          label="標題欄CSS*"
				          type="text"
				          placeholder="標題欄的CSS"
				          help="請設定標題欄的CSS, 要符合Tailwind CSS的語法"
				          validation="required"
				        />
				        <FormKit
				          name="bodyCSS"
				          label="資料欄CSS"
				          type="text"
				          placeholder="資料欄的CSS"
				          help="請設定資料欄的CSS, 要符合Tailwind CSS的語法"
				        />
				        <FormKit
				          name="showMode"
				          label="RWD顯示設定"
				          type="select"
				          :options="arrShowMode"
				          help="設定該欄位在liwaGrid顯示設定。0:所有模式;1:md模式以上;2:只在lg模式;"
				        />
				        <FormKit
				          name="optionsAPI"
				          label="產生下拉選項的程式名"
				          type="text"
				          placeholder="輸入php程式檔名"
				          help="只需輸入程式檔名, 不需全路徑"
				        />					        
						<div class="w-full px-0 py-2 flex flex-col lg:flex-row">
				        	<div class="w-full lg:w-1/2 pr-4">
						        <FormKit
						          name="slink"
						          label="欄位連結"
						          type="text"
						          placeholder="欄位連結"
						          help="請設定欄位連結, 例如:/041, 不需加上mainID"
						        />
				        	</div>
				        	<div class="w-full lg:w-1/2 pr-4">
						        <FormKit
						          name="iIndex"
						          label="欄位排列順序*"
						          type="number"
						          placeholder="1"
						          help="請設定欄位排列順序, 從1開始, 不得重覆"
						          validation="required"
						        />
				        	</div>	
						</div>						
					</FormKit>
				</div>
			</div>										
		</div>
	</div>
</Teleport>
</NuxtLayout>
</template>

<style scope>
	.searchCol {
		line-height:40px;
	}

	.searchCol:focus {
		outline:none;
	}
</style>