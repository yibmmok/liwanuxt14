<script setup lang="ts">
	/*********************************************************
	prog name: 請款單明細CRUD, author: James Lin, date: 2022/08/02
	To Do: 發佈日期與下架日期改格式
	**********************************************************/
	import { ref, toRefs, onMounted, computed } from "vue"
	import { useFetch, createFetch, useTitle } from "@vueuse/core"
	import queryString from "query-string"
	import banner from "../../components/banner"
	import liwaMsg from "../../components/liwaMsg.vue"
	import { IconPlusLg, IconX } from '@iconify-prerendered/vue-bi'	

	const mainID = ref('')
	const progName = ref('請款單列表')
	const proglink = ref('/052')
	const detailFlg = ref(true)
	const detailName = ref('')
	const APIsvr = ref('')

	const tmpData = ref({})
	const liwaData = ref([])
	const liwaD1 = ref([])
	const sUser = ref('')
	const arrUsers = ref([])
	const arrPayway = ref(["現金","匯款","即期支票"])
	const stitle = ref('')
	const submitted = ref(false)

	const isMsg = ref(false)
	const isConfig = ref(false)
	const params = ref('')  // 請款單明細參數
	const action = ref('view')
	const isSimple = ref('簡式請款單') // 1: 簡式請款單; 0:複式請款單

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

	const showConfig = () => {
		isConfig.value = true
	}

	const hideConfig = () => {
		isConfig.value = false	
	}
	// 設定對話盒及設定對話盒相關 ends

	const loadData = async () => {
		let keydata = {
			'JWT': window.localStorage.getItem('liwaJWT'),
			'mainID': mainID.value
		}
		let sQuery = queryString.stringify(keydata)		
		let url = `${APIsvr.value}/052_haveDetail.php?${sQuery}`
		const data = await useFetch(url, {method: 'GET'}, {refetch: true}).get().json()
		liwaData.value = data.data.value.arrSQL[0]
		liwaData.value.mainID = mainID.value
		isSimple.value = (Number(liwaData.value.isSimple) == 1)? '簡式請款單': '複式請款單'
		detailName.value = liwaData.value.purpose
		stitle.value = detailName.value 
		sUser.value = liwaData.value.invMaker
	}	

	const loadUsers = async () => {
		// 取得請款單類別列表
		let keydata = {
			'JWT': window.localStorage.getItem('liwaJWT'),
		}
		let sQuery = queryString.stringify(keydata)		
		let url = `${APIsvr.value}/052_haveUsers.php?${sQuery}`
		const dataUsers = await useFetch(url, {method: 'GET'}, {refetch: true}).get().json()
		arrUsers.value = dataUsers.data.value.arrSQL
		console.log('arrUsers =', arrUsers.value)
	}

	const saveData = async () => {
		if (action.value == 'view') action.value = 'edit'
		liwaData.value.isSimple = (isSimple.value == '簡式請款單')? '1': '0'
		liwaData.value.action = action.value
		liwaData.value.JWT = window.localStorage.getItem('liwaJWT')
		let datastr = JSON.stringify(liwaData.value)
		console.log('datastr in saveData =', datastr)		
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
		const { data } = await useMyFetch('052_edit.php').post().json()
		let msg = data.value.message
		if (!msg) {
			if (liwaData.value.action == 'add') {
				mainID.value = data.value.key
				window.location.href = '/052/' + mainID.value 
			} else {
				stitle.value = liwaData.value.purpose	
			}
		} else {
			showMsg('存檔錯誤', msg, 1)
		}		
	}

	const jumpAdd = () => {
		window.location.href = '/052/add'
	}

	const clearData = () => {
		let tmpData = {
			'action': 'add',
			'mainID': '',
			'invMakerID': '',
			'purpose': '',
			'totalAmt': 0,
			'isSimple': '簡式請購單',
			'projNo': '',
			'acctNo': '',
			'acctNM': '',
			'receiptType': '',
			'prepaid': '',
			'prepaidAmt': 0,
			'payway': '',
			'payDate': '',
			'memo':'',
			'D1':[]
		}
		action.value = 'add'
		detailName.value = '新增請款單'
		stitle.value = '新增請款單'
		liwaData.value = tmpData
	}

	const renewD1 = (arrD1) => {
		console.log('arrD1 =', arrD1)
		let iAmt = 0
		arrD1.forEach((m) => {
			iAmt += Number(m.var3)
		})
		liwaData.value.totalAmt = iAmt
		liwaData.value.D1 = arrD1
	}

	onMounted(() => {
		useHead({title:'請款單明細'})
		APIsvr.value = window.sessionStorage.getItem('liwaAPIsvr')		
		// 取得 mainID, 由mainID取得
		const route = useRoute()
		mainID.value = route.params.id
		let keydata = {
			'mainID':mainID.value
		}
		params.value = JSON.stringify(keydata)
		//	由 mainID 取得資料
		if (mainID.value !== 'add') {
			loadData() 
		} else {
			clearData()
		}
		loadUsers()
	})

	definePageMeta({
	  layout: "default",
	  colorMode: "light"
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
	<div class="barPanel w-[95%] h-12 rounded-3xl mt-2 ml-4 mb-2 px-1 flex flex-row justify-between relative">
		<div class="absolute top-2 left-4 flex flex-row">
			<div class="top-icon add ml-4 -mt-1" @click="jumpAdd()">
				<IconPlusLg class="w-7 h-7 text-white font-bold" />
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
				<div v-if="action=='add'" class="w-full py-2">
					<FormKit
						label="請購單模式"
						v-model="isSimple"
						type="radio"
						:options="['簡式請款單','複式請款單']"
						help="請先設定請購單模式"
						validation="required"
					/>
				</div>
				<div v-if="action!=='add'" class="w-full py-2 flex flex-row justify-between">
					<div class="w-1/2">請購單號: {{ liwaData.mainID }}</div>
					<div class="w-1/2 text-right">請購日期: {{ liwaData.invDate }}</div>
				</div>
				<div v-if="arrUsers.length > 0" class="w-full mt-2 relative">
					<FormKit
						name="invMakerID"
						label="請款人*"
						type="liwaDrop"
						:sVal="sUser"
						:arrOption="arrUsers"
						help="請從下拉選單選擇請款人"
						validation="required"
					/>					
				</div>
				<FormKit
					name="purpose"
					label="請款目的*"
					type="text"
					help="請輸入請款單的目的"
					validation="required"
				/>
				<section v-if="isSimple=='複式請款單'">
					<FormKit
						name="projNo"
						label="專案代號"
						type="text"
						help="請輸入請款專案代號"
					/>
					<FormKit
						name="receiptType"
						label="憑證類別"
						type="text"
						help="請輸入憑證類別(如發票, 收據...)"
					/>
					<FormKit
						name="prepaid"
						label="預支說明"
						type="text"
						help="請輸入預支金額用途"
					/>
					<FormKit
						name="prepaidAmt"
						label="預支金額"
						type="number"
						min="0"
						help="請輸入預支金額, 不得小於0"
					/>				
				</section>
				<liwaCalcTbl
					:tblTitle="'請款明細'"
					:progID="'052_D1'"
					:viewUrl="'052_haveD1.php'"
					:dataUrl="''"
					:params="params"
					:canEdit="true"
					@setList="renewD1"
					@sendMsg="showTblMsg"
					@setMainID="setMainID"	
				/> 
				<div class="w-full flex flex-col">
					<div class="w-full mt-4 text-left pl-1 text-xs text-slate-500 font-semibold">請款總金額</div>
					<div class="w-full mb-4 pl-8 text-4xl text-blue-500 font-semibold">{{ liwaData.totalAmt }}</div>
				</div>			
				<div v-if="arrPayway.length > 0">
					<FormKit
						name="payway"
						label="付款方式"
						type="select"
						:options="arrPayway"
						help="請輸入預支金額用途"
					/>						
				</div>
				<FormKit
					name="payDate"
					label="付款日期"
					type="date"
					help="請設定付款日期"
				/>					
				<div class="w-full h-[200px]">
					<FormKit
						name="memo"
						label="備註"
						type="textarea"
					/> 					
				</div>
			</FormKit>


		</div>
	</div>
</main>
	<div class="invisible">
		<input 
			ref="imgInput" 
			class="w-11/12 h-8 bg-grey-100 hidden" 
			type="file" 
			accept="image/*" 
		/>		
	</div>
	<teleport to="body">
		<div
			v-if="isMsg" 
			class="w-full h-full absolute top-[200px] left-0 bg-slate-100 z-[500]"
		>
			<liwaMsg 
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