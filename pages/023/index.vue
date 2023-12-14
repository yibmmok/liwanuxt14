<script setup lang="ts">
	/*********************************************************
	prog name: 表格設定列表, author: James Lin, date: 2022/02/06

	**********************************************************/
	import type { Ref } from "vue"
	import { ref, reactive, onMounted, computed, watch } from "vue"
	import queryString from "query-string"
	import { useFetch, createFetch, useStorage, useTitle } from "@vueuse/core"
	import banner from "../../components/banner"
	import { useShowmode } from "../../composables/use-showmode"
	import liwaTbl from "../../components/liwaTbl"
	import liwaTabs from "../../components/liwaTabs"
	import { IconPlusLg, IconSearch, IconX } from '@iconify-prerendered/vue-bi'
	import gemSysData from "../../static/gemSysQ.json"

	const APIsvr = ref('')
	const liwaDataQ = ref([])
	const liwaDataA = ref([])
	const sortIndex = ref(0)
	const progName = ref('評分表設定列表')
	const proglink = ref('/023')
	const detailFlg = ref(false)
	const detailKey = ref('')
	const isFilter = ref(false)
	const filters = ref({})
	const bShowTbl = ref(false)

	const isDetail = ref(false)
	const actionQ = ref('view')
	const actionA = ref('view')
	const mainIDQ = ref('')
	const mainIDA = ref('')
	const step = ref('問題設定')
	const stepNames = ref(['問題設定', '選項設定'])
	const arrGemsys = ref([])
	const sGemsys = ref('')
	const bShowGemsys = ref(false)
	const sGemsysA = ref('')
	const arrQuesA = ref([])
	const bShowGemsysA = ref(false)
	const QuesID = ref('')
	const bShowTblQ = ref(false)
	const bShowTblA = ref(false)
	const paramstrQ = ref('')
	const paramstrA = ref('')
	const Imgsvr = ref('')
	
	const router = useRouter()
	// liwaMsg 初始值
	const isMsg = ref(false)
	const objMsg = reactive({
		title: '',
		body: '',
		modalType: 1
	})

	const loadDataQ = async (sValue) => {
		let keydata = {
			'JWT': window.localStorage.getItem('liwaJWT'),
			'gemSysItem': sValue
		}
		let sQuery = queryString.stringify(keydata)		
		let url = `${APIsvr.value}/023_haveQues.php?${sQuery}`
		const data = await useFetch(url, {method: 'GET'}, {refetch: true}).get().json()
		arrQuesA.value = data.data.value.arrSQL;
		if (arrQuesA.value.length == 1) QuesID.value = arrQuesA.value[0].value
	}

	const closeBox = () => {
		isDetail.value = false
	}

	const setDetail = (arrD1) => {
		console.log('arrD1 =', arrD1)
	}

	watch(sGemsys, (Val, oldVal) =>{
		if (Val !== oldVal) {
			bShowTblQ.value = false
			let timeout = setTimeout(() => {
				let keydata = {
					'gemSys':Val,
				}
				paramstrQ.value = JSON.stringify(keydata)				
				bShowTblQ.value = true
			}, 500)		
		}
	})

	watch(sGemsysA, (Val, oldVal) =>{
		if (Val !== oldVal) {
			if (bShowTblA.value) bShowTblA.value = false
			let timeout = setTimeout(() => {
				loadDataQ(Val)
			}, 1000)
		}
	})

	watch(QuesID, (Val, oldVal) => {
		if (Val !== oldVal) {
			bShowTblA.value = false
			let timeout = setTimeout(() => {
				let keydata = {
					'QuesID':Val,
				}
				paramstrA.value = JSON.stringify(keydata)				
				bShowTblA.value = true
			}, 500)				
		}
	})

	const testProc = () => {
		console.log('sGemsys =', sGemsys.value)
		bShowTblA.value = false
	}

	const setActvTab = (index) => {
		step.value = stepNames.value[index]
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
		useHead({title:'JT.C 評分系統選項列表'})
		APIsvr.value = window.sessionStorage.getItem('liwaAPIsvr')
    	Imgsvr.value = window.sessionStorage.getItem('liwaImgsvr')
    	arrGemsys.value = gemSysData
    	bShowGemsys.value = true
		let keydata = {
			'gemSys':'A01',
		}
		paramstrQ.value = JSON.stringify(keydata)
		bShowTblQ.value = true
		loadDataQ('A01')
		bShowGemsysA.value = true
	})

</script>

<template>
<NuxtLayout name="default">
<banner
	:progname="progName"
	:proglink="proglink"
	:detailflg="detailFlg"
	:detailkey="detailKey"
></banner>
<div class="w-full">
	<div class="w-full h-20 bg-slate-400 py-[0.06rem]">
		<div class="w-[960px] h-16 bg-slate-300 mx-auto">
			<liwaTabs
				:arrTabs="stepNames"
				@setActvTab="setActvTab"
			/>				
		</div>
	</div>	
	<div class="w-[1024px] px-8 mx-auto flex flex-col">
		<section v-show="step == stepNames[0]">
			<div v-if="bShowGemsys" class="w-full py-2 relative">
				<FormKit 
					name="gemSys"
					label="所屬寶石系統*"
					type="select"
					v-model="sGemsys"
					:options="arrGemsys"
					help="請選擇問題所屬寶石系統"
					validation="required"
				/>
			</div>
			<div v-if="bShowTblQ" class="w-full min-h-[calc(100vh_-_130px)] relative">
				<liwaTbl
					:tblTitle="'問題設定列表'"
					:progID="'023_Q'"
					:viewUrl="'023_D1edit.php'"
					:dataUrl="'023_D1edit.php'"
					:params="paramstrQ"
					:canEdit="true"
					@sendMsg="sendMsg"
					@setList="setDetail"
				/>	
			</div>
		</section>
		<section v-show="step == stepNames[1]">
			<div class="w-full py-2 flex flex-col lg:flex-row">
				<div v-if="bShowGemsysA" class="w-full lg:w-1/2 px-8">
					<FormKit 
						label="所屬寶石系統*"
						type="select"
						v-model="sGemsysA"
						:options="arrGemsys"
						help="請選擇問題所屬寶石系統"
						validation="required"
					/>
				</div>
				<div v-if="sGemsysA" class="w-full lg:w-1/2 px-8">
					<FormKit 
						label="評分表問題*"
						type="select"
						:options="arrQuesA"
						v-model="QuesID"
						help="請選擇要設定的評分表問題"
						validation="required"
					/>
				</div>				
			</div>
 			<div v-if="bShowTblA" class="w-full min-h-[calc(100vh_-_130px)] relative">
				<liwaTbl
					:tblTitle="'選項值設定列表'"
					:progID="'023_A'"
					:viewUrl="'023_edit.php'"
					:dataUrl="'023_edit.php'"
					:params="paramstrA"
					:canEdit="true"
					@sendMsg="sendMsg"
					@setList="setDetail"
				/>	
			</div> 

		</section>
	</div>
</div>
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

<style scope>

</style>