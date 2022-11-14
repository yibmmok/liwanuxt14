<script setup lang="ts">
	/*********************************************************
	prog name: 評分系統選項明細CRUD, author: James Lin, date: 2020/06/08

	**********************************************************/	
	import { ref, reactive, onMounted, computed } from "vue"
	import { useFetch, createFetch, useTitle } from "@vueuse/core"
	import banner from "../components/banner"
	import liwaMsg from "../components/liwaMsg.vue"
	import liwaConfig from "../components/liwaConfig.vue"
	import { IconPlusLg, IconTrash, IconX } from '@iconify-prerendered/vue-bi'
	import gemSysData from "../static/gemSys.json"

	const error = ref('')
	const mainID = ref('')
	const progName = ref('評分系統選項列表')
	const proglink = ref('/023')
	const detailFlg = ref(false)
	const detailName = ref('評分系統選項設定')
	const liwaData = ref([])
	const liwaDetail1 = ref([])
	const liwaDetailA = ref([])
	const liwaDetailB = ref([])
	const liwaDetailC = ref([])
	const liwaDetailD = ref([])
	const liwaSel1 = ref([])
	const liwaChild = ref({})
	const bEditBox = ref(0)
	const stitle = ref('')
	const submitted = ref(false)
	
	const action = ref('')
	const actvGemSys = ref('A')
	const actvQuesID = ref('')
	const actvQues = ref('')
	const actvLabel = ref('')
	const actvScore = ref(1)
	const actvIndex = ref(0)
	// liwaMsg 初始值
	const isMsg = ref(false)
	const objMsg = reactive({
		title: '',
		body: '',
		modalType: 1
	})

	const loadData = async () => {
		let siteID = window.sessionStorage.getItem('liwaSiteID')
		let keydata = {
			'siteID': siteID,
			'action': 'view'
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
		const { data } = await useMyFetch('023_edit.php').post().json()
		liwaData.value = data.value.arrSQL
		liwaData.value.siteID = window.sessionStorage.getItem('liwaSiteID')
		liwaData.value.userID = window.sessionStorage.getItem('liwaUserID')
		liwaData.value.makerName = window.sessionStorage.getItem('liwaUserName')
		stitle.value = '評 分 系 統 選 項 列 表'
	}

	const loadD1 = async (sSys) => {
		let siteID = window.sessionStorage.getItem('liwaSiteID')
		let url = window.sessionStorage.getItem('liwaAPIsvr') + "/023_haveD1.php?siteID=" + siteID + "&gemSys=" + sSys
		const data = await useFetch(url, {method: 'GET'}, {refetch: true}).get().json()
		liwaDetail1.value = data.data.value.arrSQL
		liwaDetailA.value = liwaDetail1.value.filter(liwaItem => liwaItem.value.substr(0,1) == 'A' )
		liwaDetailB.value = liwaDetail1.value.filter(liwaItem => liwaItem.value.substr(0,1) == 'B' )
		liwaDetailC.value = liwaDetail1.value.filter(liwaItem => liwaItem.value.substr(0,1) == 'C' )
		liwaDetailD.value = liwaDetail1.value.filter(liwaItem => liwaItem.value.substr(0,1) == 'D' )
	}

	const setProgID = (sID) => {
		// 編輯
		actvIndex.value = liwaData.value.findIndex((m) => m.mainID == sID)
		let res = liwaData.value.filter((n) => n.mainID == sID)
		res[0].isShow = '1'
		bEditBox.value = 1
		actvQuesID.value = res[0].QuesID
		actvQues.value = res[0].Ques
		actvScore.value = res[0].score
		actvLabel.value = res[0].label
		actvGemSys.value = res[0].mainID.substr(0,1)
		// liwaDetail2.value = liwaDetail1.value.filter(liwaItem => liwaItem.value.substr(0,1) == sGemSys )
		liwaChild.value.mainID = res[0].mainID
		action.value = 'edit'
	}

	const addD1 = () => {
		// 在 liwaData 新增一筆
		let keydata = {
			'mainID': '',
			'gemSys': '',
			'QuesID': '',
			'Ques': '',
			'label': '',
			'score': 0,
			'isShow': '1'
		}
		liwaData.value.push(keydata)
		bEditBox.value = 1
		action.value = 'add'
		actvIndex.value = liwaData.value.length - 1
		actvGemSys.value = 'A'
		actvQuesID.value = ''
		actvQues.value = ''
		actvLabel.value = ''
		actvScore.value = 0
	}

	const closeBox = (idx) => {
		if (action.value !== 'add') {
			let res = liwaData.value.filter((n) => n.mainID == idx)
			bEditBox.value = 0
			res[0].isShow = '0'			
		} else {
			// 刪除 liwaData最後一筆
			liwaData.value.pop()
		}
	}

	const saveD1 = async () => {
		switch (actvGemSys.value) {
			case 'A': liwaChild.value.gemSys = '鑽石'
				break
			case 'B': liwaChild.value.gemSys = '彩寶'
				break
			case 'C': liwaChild.value.gemSys = '翡翠'
				break
			case 'D': liwaChild.value.gemSys = '軟玉'
				break											
		}
		liwaChild.value.QuesID = actvQuesID.value
		// 取得 actvQues.value
		let arrTmp = []
		arrTmp = liwaDetail1.value.filter(liwaItem => liwaItem.value == actvQuesID.value)
		actvQues.value = arrTmp[0].label
		liwaChild.value.Ques = actvQues.value
		liwaChild.value.label = actvLabel.value
		liwaChild.value.score = actvScore.value
		liwaChild.value.action = action.value
		liwaChild.value.userID = window.sessionStorage.getItem('liwaUserID')
		liwaChild.value.username = window.sessionStorage.getItem('liwaUserName')
		if (action.value == 'add') liwaChild.value.mainID = ''
		let datastr = JSON.stringify(liwaChild.value)

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
	    const { data } = await useMyFetch('023_edit.php').post().json()
	    if (!data.value.message) {
	    	liwaData.value[actvIndex.value].QuesID = liwaChild.value.QuesID
	    	liwaData.value[actvIndex.value].Ques = actvQues.value
	    	liwaData.value[actvIndex.value].gemSys = liwaChild.value.gemSys
	    	liwaData.value[actvIndex.value].label = liwaChild.value.label
	    	liwaData.value[actvIndex.value].score = liwaChild.value.score
	    	liwaData.value[actvIndex.value].isShow ="0"
	    	liwaData.value[actvIndex.value].mainID = data.value.key
	    } else {
	    	// 先關閉 editBox
	    	bEditBox.value = 0
			liwaData.value[actvIndex.value].isShow = '0'
			showMsg('存檔錯誤', data.value.message, 1)
	    } 
	    action.value = 'view'	      		
	}

	const delD1 = async (sID) => {
		actvIndex.value = liwaData.value.findIndex((m) => m.mainID == sID)
		liwaChild.value.mainID = sID
		liwaChild.value.action = 'delete'
		let datastr = JSON.stringify(liwaChild.value)
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
	    const { data } = await useMyFetch('023_edit.php').post().json()
	    if (!data.value.message) {
	    	liwaData.value.splice(actvIndex.value, 1)
	    } else {
	    	// 顯示錯誤訊息
			showMsg('刪除錯誤', data.value.message, 1)
	    } 
	    action.value = 'view'  	    
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
    	const title = useTitle(compName+`- 評分系統選項列表`)
    	const route = useRoute()
    	// mainID.value = route.params.id
		// 設定載入的資料
		loadData()
		loadD1()
		liwaSel1.value = gemSysData
	})

	definePageMeta({
	  title: 'LiwaSite 評分系統選項管理',
	  layout: "default",
	})		
</script>

<template>
<banner
	v-if="detailName"
	:progname="progName"
	:proglink="proglink"
	:detailflg="detailFlg"
	:detailName="detailName"
></banner>
<div v-if="error">{{ error }}</div>
<div class="w-full bg-slate-300 px-4 py-2">
	<div class="barPanel h-12 rounded-3xl ml-4 mb-2 px-1 flex flex-row justify-between">
		<div class="w-full h-12 text-center">{{ stitle }}</div>
	</div>
	<div v-if="liwaData.length" class="w-full lg:max-w-4xl lg:mx-auto my-0 p-2 border-2 relative">
		<div class="barPanel w-full h-12 rounded-3xl mt-2 mb-2 px-1 flex flex-row justify-between">
			<div class="w-1/3 h-12">
				<div class="top-icon Dadd ml-2 -mt-1 mr-4 pl-[.125rem] pt-[.125rem] bg-white"
                 @click="addD1()"
            	>
            		<IconPlusLg class="w-7 h-7 text-slate-400 font-bold" />	
            	</div>
			</div>
			<div class="w-1/3 h-12 text-center">評分系統選項設定</div>
			<div class="w-1/3 h-12"></div>
		</div>
		<div class="w-full flex flex-row mt-4">
			<div class="w-full sm:h-96 md:h-[36rem] lg:h-[44rem] min-h-full -my-2 overflow-auto sm:-mx-6 lg:-mx-2">
				<div class="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
					<div class="shadow border-b border-gray-500 bg-white">
						<table class="min-w-full divide-x divide-y divide-gray-200 bg-white">
							<thead class="bg-gray-50">
								<tr class="bg-emerald-300">
									<th scope="col" class="thPanel w-2/12">評分系統</th>
									<th scope="col" class="thPanel w-4/12">評分項目</th>
									<th scope="col" class="thPanel w-5/12">選項</th>
									<th scope="col" class="thPanel w-1/12">分數</th>
								</tr>
							</thead>
							<tbody class="w-full bg-white ring-1 ring-gray-50">
								<tr 
									class="h-20 relative odd:bg-white even:bg-slate-200"
									v-for="(option, index) in liwaData"
									:key="index"
									:data-id="option.mainID"
								>
									<td scope="col" class="tdPanel w-2/12" @click.stop.prevent="setProgID(option.mainID)">{{ option.gemSys }}</td>
									<td scope="col" class="tdPanel w-4/12" @click.stop.prevent="setProgID(option.mainID)">{{ option.Ques }}</td>
									<td scope="col" class="tdPanel w-5/12" @click.stop.prevent="setProgID(option.mainID)">{{ option.label }}</td>
									<td scope="col" class="tdPanel w-1/12" @click.stop.prevent="setProgID(option.mainID)">
										<div class="w-full h-full flex flex-row">
											<div class="w-3/4 pl-4">
												{{ option.score }}
											</div>
											<div class="w-1/4 pr-1 relative" @click="delD1(option.mainID)">
												<IconTrash class="w-8 h-8 text-red-400 font-bold" />
											</div>
										</div>
									</td>
									<div 
										v-if="option.isShow!=='0'"
										class="absolute w-full h-40 top-0 left-0 bg-white z-50"
									>
										<div class="w-full h-full bg-yellow-200">
											<div v-if="bEditBox!==0" 
											class="w-full h-20 flex flex-row"
											>
												<div class="w-[15%] h-20 pl-2 relative">
													<FormKit
														v-if="action=='add'"
														type="select"
														name="gemSys"
														label="所屬系統"
														v-model="actvGemSys"
														inner-class="border-0 rounded-none"
														help="請設定所屬評分系統"
														:options="liwaSel1"
													/>
													<div v-else class="pt-8">
														{{ option.gemSys }}
													</div>				
												</div>		
												<div class="w-[30%] h-20 pl-2 mr-1 relative">
													<FormKit
														v-if="actvGemSys=='A'"
														type="liwaDrop"
														name="QuesID"
														label="主要評分項目"
														inner-class="border-0 rounded-none h-10 mt-1"
														v-model="actvQuesID"
														help="請設定主要評分項目"
														:sVal="actvQues"
														:arrOption="liwaDetailA"
													/>
													<FormKit
														v-if="actvGemSys=='B'"
														type="liwaDrop"
														name="QuesID"
														label="主要評分項目"
														inner-class="border-0 rounded-none h-10 mt-1"
														v-model="actvQuesID"
														help="請設定主要評分項目"
														:sVal="actvQues"
														:arrOption="liwaDetailB"
													/>	
													<FormKit
														v-if="actvGemSys=='C'"
														type="liwaDrop"
														name="QuesID"
														label="主要評分項目"
														inner-class="border-0 rounded-none h-10 mt-1"
														v-model="actvQuesID"
														help="請設定主要評分項目"
														:sVal="actvQues"
														:arrOption="liwaDetailC"
													/>	
													<FormKit
														v-if="actvGemSys=='D'"
														type="liwaDrop"
														name="QuesID"
														label="主要評分項目"
														inner-class="border-0 rounded-none h-10 mt-1"
														v-model="actvQuesID"
														help="請設定主要評分項目"
														:sVal="actvQues"
														:arrOption="liwaDetailD"
													/>				
												</div>
												<div class="w-[37%] h-20 flex flex-col mr-1">
													<div class="w-full h-8 text-left font-bold text-sm mt-1">選項</div>
													<FormKit
														name="Ques"
														type="text"
														v-model="actvLabel"
														help="請輸入選項內容"
														validation="required"
													/>
												</div>
												<div class="w-1/12 h-20">
													<FormKit
														name="score"
														inner-class="w-32 h-10"
														v-model="actvScore"
														label="分數"
														type="number"
														help="請輸入分數"
														validation="required|number"
													/>				
												</div>
											</div>
											<div class="w-full h-20 relative -mt-2 pt-8 pl-2">
												<FormKit
													type="submit"
													label="儲存"
													@click="saveD1"
												></FormKit>
												<div class="w-20 h-20 bg-transparent absolute left-24 -bottom-11"
												@click.prevent.stop="closeBox(option.mainID)"
												>
													<IconX class="w-7 h-7 text-red-400 font-bold" />
												</div>			
											</div>
										</div>
									</div>
								</tr>
							</tbody>
						</table>
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

<style scope>
	.formkit-input[type="text"] {
	height:2rem;
	}	
</style>