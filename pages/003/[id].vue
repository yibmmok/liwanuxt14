<script setup lang="ts">
	/*********************************************************
	prog name: 使用者群組明細CRUD, author: James Lin, date: 2020/06/08

	**********************************************************/	
	import { ref, reactive, onMounted, computed } from "vue"
	import { useFetch, createFetch, useTitle } from "@vueuse/core"
	import queryString from "query-string"
	import banner from "../../components/banner"
	import liwaMsg from "../../components/liwaMsg.vue"
	import liwaConfig from "../../components/liwaConfig.vue"
	import { IconPlusLg, IconTrash, IconX } from '@iconify-prerendered/vue-bi'

	const mainID = ref('')
	const progName = ref('使用者群組列表')
	const proglink = ref('/003')
	const detailFlg = ref(true)
	const detailName = ref('')
	const APIsvr = ref('')
	const liwaData = ref({progName:'', iAuth:0})
	const liwaD1 = ref({})
	const liwaChild = ref({})
	const bEditBox = ref(0)
	const stitle = ref('')
	const submitted = ref(false)
	const liwaSel1 = ref([])
	const action = ref('')
	const actvKeyID = ref('')
	const actvProgName = ref('')
	const actvAuth = ref(1)
	const actvIndex = ref(0)
	// liwaMsg 初始值
	const isMsg = ref(false)
	const objMsg = reactive({
		title: '',
		body: '',
		modalType: 1
	})

	const loadData = async () => {
		let keydata = {
			'JWT': window.localStorage.getItem('liwaJWT'),
			'uGroupID': mainID.value
		}		
		let sQuery = queryString.stringify(keydata)		
		let url = `${APIsvr.value}/003_haveD1.php?${sQuery}`
		const data = await useFetch(url, {method: 'GET'}, {refetch: true}).get().json()
		detailName.value = data.data.value.uGroupName
		liwaData.value = data.data.value.arrSQL
		liwaData.value.action = 'view'
		liwaData.value.mainID = mainID.value
		stitle.value = '使  用  者  群  組  - ' + detailName.value
		liwaChild.value.JWT = window.localStorage.getItem('liwaJWT')
		liwaChild.value.uGroupID = mainID.value
		liwaChild.value.uGroupName = detailName.value	
	}

	const loadD1 = async () => {
		let keydata = {
			'JWT': window.localStorage.getItem('liwaJWT'),
			'uGroupID': mainID.value
		}
		let sQuery = queryString.stringify(keydata)		
		let url = `${APIsvr.value}/003_haveUGprog.php?${sQuery}`
		const data = await useFetch(url, {method: 'GET'}, {refetch: true}).get().json()
		liwaD1.value = data.data.value.arrSQL
		liwaD1.value.forEach((n1) => {
			if (n1.bUsed == '0') {
				liwaSel1.value.push({'label': n1.LMName, 'value':n1.progID})
			}
		})
	}

	const setProgID = (sID) => {
		actvIndex.value = liwaData.value.findIndex((m) => m.progID == sID)
		let res = liwaData.value.filter((n) => n.progID == sID)
		res[0].isShow = '1'
		bEditBox.value = 1
		actvKeyID.value = res[0].progID
		actvAuth.value = res[0].iAuth
		actvProgName.value = res[0].progName
		liwaChild.value.LMID = res[0].LMID
		action.value = 'edit'
	}

	const addD1 = () => {
		// 在 liwaData 新增一筆
		let keydata = {
			'LMID': '',
			'LMName': '',
			'authLimit': '',
			'groupName': '',
			'iAuth': 9,
			'isShow': '1',
			'lang': 'tw',
			'progID': '',
			'progName': '',
			'slink': ''
		}
		liwaData.value.push(keydata)
		bEditBox.value = 1
		action.value = 'add'
		actvIndex.value = liwaData.value.length - 1
	}

	const closeBox = (idx) => {
		if (action.value !== 'add') {
			let res = liwaData.value.filter((n) => n.progID == idx)
			bEditBox.value = 0
			res[0].isShow = '0'			
		} else {
			// 刪除 liwaData最後一筆
			liwaData.value.pop()
		}
		action.value = 'view'
	}

	const saveD1 = async () => {
		liwaChild.value.JWT = window.localStorage.getItem('liwaJWT')
		liwaChild.value.iAuth = actvAuth.value
		liwaChild.value.action = action.value
		let actvLMID = liwaChild.value.LMID
		let datastr = JSON.stringify(liwaChild.value)
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
	    const { data } = await useMyFetch('003_editD1.php').post().json()
	    if (!data.value.message) {
	    	if (action.value == 'edit') {
	    		// 編輯模式, 將liwaChild.value 設到 liwaData.value
	    		let nuLMID = liwaChild.value.uGroupID + liwaChild.value.progID
	    		liwaData.value[actvIndex.value].LMID = nuLMID
	    	} 
	    
	    	liwaData.value[actvIndex.value].LMName = liwaChild.value.LMName
	    	liwaData.value[actvIndex.value].authLimit = liwaChild.value.authLimit
	    	liwaData.value[actvIndex.value].groupName = liwaChild.value.groupName
	    	liwaData.value[actvIndex.value].iAuth = liwaChild.value.iAuth
	    	liwaData.value[actvIndex.value].isShow ="0"
	    	liwaData.value[actvIndex.value].lang = "tw"
	    	liwaData.value[actvIndex.value].progID = liwaChild.value.progID
	    	liwaData.value[actvIndex.value].progName = liwaChild.value.progName
	    	liwaData.value[actvIndex.value].slink = liwaChild.value.slink
	    	// console.log('liwaData =', liwaData.value)
	    } else {
			showMsg('存檔錯誤', data.value.message, 1)
	    } 
    	// 先關閉 editBox
    	bEditBox.value = 0
		liwaData.value[actvIndex.value].isShow = '0'	    
	    action.value = 'view'  		
	}

	const delD1 = async (sID) => {
		actvIndex.value = liwaData.value.findIndex((m) => m.LMID == sID)
		liwaChild.value.JWT = window.localStorage.getItem('liwaJWT')
		liwaChild.value.LMID = sID
		liwaChild.value.action = 'delete'
		let datastr = JSON.stringify(liwaChild.value)
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
	    const { data } = await useMyFetch('003_editD1.php').post().json()
	    if (!data.value.message) {
	    	liwaData.value.splice(actvIndex.value, 1)
	    	loadD1()
	    } else {
	    	// 顯示錯誤訊息
			showMsg('刪除錯誤', data.value.message, 1)
	    } 
	    action.value = 'view'  	    
	}

	const nuProgName = computed(() => {
		// 先取得 liwaChild.value.progID
		let Ans = ''
		let res = liwaD1.value.filter((n) => (n.progID == actvKeyID.value) && (n.bUsed == 0))
		if (res.length > 0) {
			actvProgName.value = res[0].progName
			liwaChild.value.progID = actvKeyID.value
			liwaChild.value.progName = res[0].progName
			liwaChild.value.LMName = res[0].LMName
			liwaChild.value.iAuth = actvAuth.value
			liwaChild.value.authLimit = res[0].authLimit
			liwaChild.value.groupName = res[0].groupName
			liwaChild.value.slink = res[0].slink
			Ans = res[0].LMName
		} else {
			Ans = actvProgName.value
		}	
		return Ans
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

	onMounted(() => {
		useHead({title:'使用者群組列表'})
		APIsvr.value = window.sessionStorage.getItem('liwaAPIsvr')
    	const route = useRoute()
    	mainID.value = route.params.id
		// 設定載入的資料
		loadData()
		loadD1()	
	})

	// definePageMeta({
	//   layout: "default",
	//   colorMode: "light"
	// })		
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
			<div class="w-1/3 h-12 text-center">程式列表及設定</div>
			<div class="w-1/3 h-12"></div>
		</div>
		<div class="w-full flex flex-row mt-4">
			<div class="w-full sm:h-96 md:h-[36rem] lg:h-[44rem] min-h-full -my-2 overflow-auto sm:-mx-6 lg:-mx-2">
				<div class="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
					<div class="shadow border-b border-gray-500 bg-white">
						<table class="min-w-full divide-x divide-y divide-gray-200 bg-white">
							<thead class="bg-gray-50">
								<tr class="bg-emerald-300">
									<th scope="col" class="thPanel w-3/7">程式名稱</th>
									<th scope="col" class="thPanel w-2/7">自訂名稱</th>
									<th scope="col" class="thPanel w-2/7">權限</th>
								</tr>
							</thead>
							<tbody class="w-full bg-white ring-1 ring-gray-50">
								<tr 
									class="h-20 relative odd:bg-white even:bg-slate-200"
									v-for="(prog, index) in liwaData"
									:key="index"
									:data-id="prog.LMID"
								>
									<td scope="col" class="tdPanel w-3/7" @click.stop.prevent="setProgID(prog.progID)">{{ prog.progName }}</td>
									<td scope="col" class="tdPanel w-2/7" @click.stop.prevent="setProgID(prog.progID)">{{ prog.LMName }}</td>
									<td scope="col" class="tdPanel w-2/7" @click.stop.prevent="setProgID(prog.progID)">
										<div class="w-full h-full flex flex-row">
											<div class="w-3/4 pl-4">
												{{ prog.iAuth }}
											</div>
											<div class="w-1/4 pl-4 relative" @click.stop="delD1(prog.LMID)">
												<IconTrash class="w-8 h-8 text-red-400 font-bold" />
											</div>
										</div>
									</td>
									<div 
										v-if="prog.isShow!=='0'"
										class="absolute w-full h-40 top-0 left-0 bg-white z-50"
									>
										<div class="w-full h-full bg-yellow-200">
											<div v-if="bEditBox!==0" 
											class="w-full h-20 flex flex-row"
											>
												<div class="w-2/5 h-20 pl-2 relative">
													<FormKit
														type="liwaDrop"
														name="progID"
														label="程式名稱"
														inner-class="border-0 rounded-none"
														v-model="actvKeyID"
														help="請設定程式名稱"
														:sVal="actvProgName"
														:arrOption="liwaSel1"
													/>				
												</div>
												<div class="w-2/5 h-20 flex flex-col">
													<div class="w-full h-8 text-center font-bold text-sm mt-1">自訂名稱</div>
													<div class="w-full h-8 text-center">{{ nuProgName }}</div>
												</div>
												<div class="w-1/5 h-20">
													<FormKit
														name="iAuth"
														outer-class="w-32 h-8"
														inner-class="h-8"
														v-model="actvAuth"
														label="權限"
														type="text"
														help="請輸入權限(1-9)"
														validation="required|number|between:1,9"
													/>				
												</div>
											</div>
											<div class="w-full h-20 relative -mt-2 pt-8 pl-2">
												<FormKit
													type="submit"
													label="儲存"
													@click="saveD1"
												></FormKit>
												<div class="w-20 h-20 bg-transparent absolute left-32 -bottom-11"
												@click.prevent.stop="closeBox(prog.progID)"
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
</NuxtLayout>
</template>

<style scope>
	.formkit-outer[data-type="submit"] .formkit-wrapper .formkit-input {
		margin-left:0;
		margin-right:auto;
	}
</style>