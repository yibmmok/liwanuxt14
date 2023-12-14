<script setup lang="ts">
	/*********************************************************
	prog name: 總合設定程式, author: James Lin, date: 2023/07/14
	To Do: 整合系統所有設定程式
	**********************************************************/
	import { ref, onMounted } from "vue"
	import queryString from "query-string"
	import banner from "../components/banner"
	import liwaTabs from "../components/liwaTabs.vue"
	import liwaTbl from "../components/liwaTbl.vue"
	import liwaMsg from "../components/liwaMsg.vue"
	import { IconX } from '@iconify-prerendered/vue-bi'

	const APIsvr = ref('')
	const progName = ref('編輯設定')
	const proglink = ref('/C01')
	const detailFlg = ref(false)
	const detailName = ref('編輯設定')	

	const step = ref('產地')
	const stepNames = ref(['產地', '寶石種類', '收費項目', '倉位', '儲位'])
	const WHID = ref('')
	const arrWH = ref([])
	const params = ref('')
	const bShowD5 = ref(false)

	// liwaMsg 初始值
	const isMsg = ref(false)
	const objMsg = reactive({
		title: '',
		body: '',
		modalType: 1
	})

	const loadWH = async () => {
		let keydata = {
			'JWT': window.localStorage.getItem('liwaJWT')
		}
		let sQuery = queryString.stringify(keydata)		
		let url = `${APIsvr.value}/021_haveWH.php?${sQuery}`
		const dataD4 = await useFetch(url, {method: 'GET'}, {refetch: true}).get().json()
		arrWH.value = dataD4.data.value.arrSQL
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

	// 設定 liwaTbl 內容 starts
	const setDetail = (arrData) => {
		console.log('arrData =', arrData)
	}

	const setDetailD2 = (arrData, idx) => {
		console.log('D2 in arrData =', arrData)
	}	

	const setDetailD3 = (arrData, idx) => {
		console.log('D3 in arrData =', arrData)
	}	

	const setDetailD4 = (arrData, idx) => {
		console.log('D4 in arrData =', arrData)
	}

	const setDetailD5 = (arrData, idx) => {
		console.log('D5 in arrData =', arrData)
	}	

	const sendMsg = (sMsg) => {
		showMsg('系統訊息', '回傳錯誤 - '+sMsg, 2)
	}

	const setMainID = (sID) => {
		console.log('sID', sID)
	}
	// 設定 liwaTbl 內容 ends

	const setActvTab = (index) => {
		step.value = stepNames.value[index]
	}	

	watch(WHID, (Val, oldVal) => {
		// 若 WHID的值改變, 設定 arrWH
		if (Val !== oldVal) {
			if (Val) {
				bShowD5.value = false
				let keydata = {
					'WHID': Val
				}
				params.value = JSON.stringify(keydata)
				let timeout = setTimeout(() => {
					bShowD5.value = true
				}, 1000)
			}
		}
	})		

	const testProc = () => {
		
	}

	onMounted(() => {
		useHead({title:'編輯設定'})
		APIsvr.value = window.sessionStorage.getItem('liwaAPIsvr')
		loadWH()
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
<div class="w-full h-full flex flex-col justify-center items-center bg-slate-200">
	<div class="w-full lg:w-[1024px] lg:mx-auto">
		<liwaTabs
			:arrTabs="stepNames"
			@setActvTab="setActvTab"
		/>		
	</div>
</div>

<div class="w-full lg:w-[1024px] lg:mx-auto">
	<section v-show="step==stepNames[0]">
		<liwaTbl
			:tblTitle="'產地設定'"
			:progID="'C01_D1'"
			:viewUrl="'C01_D1edit.php'"
			:dataUrl="'C01_D1edit.php'"
			:params="''"
			:canEdit="true"
			@sendMsg="sendMsg"
			@setList="setDetail"
			@setMainID="setMainID"
		/>	
	</section>
	<section v-show="step==stepNames[1]">
		<liwaTbl
			:tblTitle="'寶石種類設定'"
			:progID="'C01_D2'"
			:viewUrl="'C01_D2edit.php'"
			:dataUrl="'C01_D2edit.php'"
			:params="''"
			:canEdit="true"
			@sendMsg="sendMsg"
			@setList="setDetailD2"
			@setMainID="setMainID"
		/>	
	</section>
	<section v-show="step==stepNames[2]">
		<liwaTbl
			:tblTitle="'收費項目設定'"
			:progID="'C01_D3'"
			:viewUrl="'C01_D3edit.php'"
			:dataUrl="'C01_D3edit.php'"
			:params="''"
			:canEdit="true"
			@sendMsg="sendMsg"
			@setList="setDetailD3"
			@setMainID="setMainID"
		/>
	</section>
	<section v-show="step==stepNames[3]">
		<liwaTbl
			:tblTitle="'倉位設定'"
			:progID="'C01_D4'"
			:viewUrl="'C01_D4edit.php'"
			:dataUrl="'C01_D4edit.php'"
			:params="''"
			:canEdit="true"
			@sendMsg="sendMsg"
			@setList="setDetailD4"
			@setMainID="setMainID"
		/>
	</section>
	<section v-show="step==stepNames[4]">
		<div v-if="arrWH.length > 0" class="w-full">
			<FormKit
				label="請設定倉位"
				type="select"
				v-model="WHID"
				:options="arrWH"
				help="請先設定倉位"
			/>				
		</div>
		<div v-if="bShowD5" class="w-full">
			<liwaTbl
				:tblTitle="'儲位設定'"
				:progID="'C01_D5'"
				:viewUrl="'C01_D5edit.php'"
				:dataUrl="'C01_D5edit.php'"
				:params="params"
				:canEdit="true"
				@sendMsg="sendMsg"
				@setList="setDetailD5"
				@setMainID="setMainID"
			/>				
		</div>
	</section>		
</div>
<teleport to="body">
	<liwaMsg 
	  	v-if="isMsg"
	  	:msgTitle="objMsg.title"
	  	:msgBody="objMsg.body"
	  	:modalType="objMsg.modalType"
	  	@hideMsg="hideMsg"
	  	@confirmOK="confirmOK"
	/>  	
</teleport>	
</NuxtLayout>
</template>