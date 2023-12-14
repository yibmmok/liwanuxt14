<script setup lang="ts">
	/*********************************************************
	prog name: 待辦事項明細CRUD, author: James Lin, date: 2022/08/02
	To Do: 發佈日期與下架日期改格式
	**********************************************************/
	import { ref, toRefs, onMounted, computed } from "vue"
	import { useFetch, createFetch, useTitle } from "@vueuse/core"
	import queryString from "query-string"
	import banner from "../../components/banner"
	import liwaMsg from "../../components/liwaMsg.vue"
	import liwaTbl from "../../components/liwaTbl.vue"
	import TinyMceEditor from "@tinymce/tinymce-vue"
	import { IconTrashFill, IconX } from '@iconify-prerendered/vue-bi'	

	const mainID = ref('')
	const progName = ref('待辦事項列表')
	const proglink = ref('/006')
	const detailFlg = ref(true)
	const detailName = ref('')
	const stitle = ref('')
	const progID = ref('')

	const APIsvr = ref('')
	const imgSvr = ref('')
	const liwaData = ref([])
	const liwaD1 = ref([])
	const liwaD2 = ref([])
	const mainConfig = ref('')
	const iBargainAmt = ref(1)
	const bShow041 = ref(false)
	const bShow007 = ref(false)
	const sReplyMsg = ref('')
	const sReply021Msg = ref('')
	const isMsg = ref(false)
	const action = ref('view')
	const bCloseEdit = ref(false)
	const bClose021Edit = ref(false)
	const picpath = ref('')
	const prodNM = ref('')
	const prodID = ref('')

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
		let url = `${APIsvr.value}/006_haveDetail.php?${sQuery}`
		const data = await useFetch(url, {method: 'GET'}, {refetch: true}).get().json()
		liwaData.value = data.data.value.arrSQL[0]
		// liwaData.value.JWT = window.localStorage.getItem('liwaJWT')
		liwaData.value.mainID = mainID.value
		detailName.value = liwaData.value.sMsg
		stitle.value = detailName.value 
		progID.value = liwaData.value.progID
		if (liwaData.value.doneDate) bCloseEdit.value = true
		if (progID.value == '041') {
			let keydata2 = {
				"memberID":liwaData.value.fromUserID
			}
			mainConfig.value = JSON.stringify(keydata2)
			bShow041.value = true
		}
		if (progID.value == '007') {
			loadD1()
		}
		if (progID.value == '021') {
			loadD2()
		}		
	}

	const loadD1 = async () => {
		let keyData = {
			'JWT': window.localStorage.getItem('liwaJWT'),
			'mainID': mainID.value
		}
		let sQuery = queryString.stringify(keyData)		
		let url = `${APIsvr.value}/006_have007D1.php?${sQuery}`
		const data = await useFetch(url, {method: 'GET'}, {refetch: true}).get().json()
		liwaD1.value = data.data.value.arrSQL
		console.log('liwaD1 =', liwaD1.value)	
	}

	const loadD2 = async () => {
		let keyData = {
			'JWT': window.localStorage.getItem('liwaJWT'),
			'mainID': mainID.value
		}
		let sQuery = queryString.stringify(keyData)		
		let url = `${APIsvr.value}/006_have007D2.php?${sQuery}`
		const data = await useFetch(url, {method: 'GET'}, {refetch: true}).get().json()
		liwaD2.value = data.data.value.arrSQL
		picpath.value = imgSvr.value + data.data.value.picpath
		prodNM.value = data.data.value.prodNM
		prodID.value = data.data.value.prodID
		console.log('liwaD2 =', liwaD1.value)	
	}	

	const import041D3 = async () => {
		bShow041.value = false
		let keydata = {
			'JWT': window.localStorage.getItem('liwaJWT'),
			'mainID':mainID.value,
			'memberID': liwaData.value.fromUserID,
			'amt': iBargainAmt.value
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
	    const { data } = await useMyFetch('006_import041D3.php').post().json()
	    let msg = data.value.message	    	
	    if (!msg) {
	    		// bShow041.value = true
	    		// bCloseEdit.value = true        	
	    		window.location.href = '/006/'
	    } else {
	    		showMsg('存檔錯誤', msg, 1)
	    }
	}

	const export041D3 = async () => {
		let keydata = {
			'JWT': window.localStorage.getItem('liwaJWT'),
			'mainID':mainID.value,
			'memberID': liwaData.value.fromUserID,
			'amt': iBargainAmt.value
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
	    const { data } = await useMyFetch('006_export041D3.php').post().json()
	    let msg = data.value.message	    	
	    if (!msg) {
	    		window.location.href = '/006/'		        	
	    } else {
	    		showMsg('存檔錯誤', msg, 1)
	    }
	}


	const setList = (arrD1) => {
		console.log('arrD1 =', arrD1)
	}

	const showTblMsg = (sMsg) => {
		showMsg('系統訊息', sMsg, 2)
	}

	const send007D1 = async () => {
		if (sReplyMsg.value) {
			let keydata = {
				'JWT': window.localStorage.getItem('liwaJWT'),
				'mainID': mainID.value,
				'replyContent': sReplyMsg.value
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
			const { data } = await useMyFetch('006_send007D1.php').post().json()
			let msg = data.value.message
			if (!msg) {
				loadD1()
				sReplyMsg.value = ''
			} else showMsg('系統訊息', msg, 2)
		}
	}

	const send007D2 = async () => {
		if (sReply021Msg.value) {
			let keydata = {
				'JWT': window.localStorage.getItem('liwaJWT'),
				'mainID': mainID.value,
				'replyContent': sReply021Msg.value
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
			const { data } = await useMyFetch('006_send007D2.php').post().json()
			let msg = data.value.message
			if (!msg) {
				loadD2()
				sReplyMsg.value = ''
			} else showMsg('系統訊息', msg, 2)
		}
	}	

	const delReplyMsg = async (idx) => {
		let iIndex = idx + 1
		let keydata = {
			'JWT': window.localStorage.getItem('liwaJWT'),
			'mainID': mainID.value,
			'iIndex': iIndex
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
		const { data } = await useMyFetch('006_del007D1.php').post().json()
		let msg = data.value.message
		if (!msg) loadD1()
		else showMsg('系統訊息', msg, 2)
	}

	const delReply021Msg = async (idx) => {
		let iIndex = idx + 1
		let keydata = {
			'JWT': window.localStorage.getItem('liwaJWT'),
			'mainID': mainID.value,
			'iIndex': iIndex
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
		const { data } = await useMyFetch('006_del007D2.php').post().json()
		let msg = data.value.message
		if (!msg) loadD2()
		else showMsg('系統訊息', msg, 2)
	}	

	const closeTodo = async () => {
		let keydata = {
			'JWT': window.localStorage.getItem('liwaJWT'),
			'mainID': mainID.value,
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
		const { data } = await useMyFetch('006_done.php').post().json()
		let msg = data.value.message
		if (!msg)	window.location.href = '/006'
	}

	onMounted(() => {
		useHead({title:'待辦事項明細'})
		APIsvr.value = window.sessionStorage.getItem('liwaAPIsvr')		
		imgSvr.value = window.sessionStorage.getItem('liwaImgsvr')		
		// 取得 mainID, 由mainID取得
		const route = useRoute()
		mainID.value = route.params.id
		//	由 mainID 取得資料
		loadData()
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
<main class="w-full h-[calc(100vh_-_12rem)] flex flex-col justify-start items-center bg-slate-200">
	<div class="barPanel w-[95%] h-12 rounded-3xl mt-8 ml-4 mb-2 px-1 flex flex-row justify-between">
		<div class="w-full text-center">
			待辦事項: {{ stitle }}
		</div>
	</div>
	<div class="w-full lg:w-[1024px] lg:max-w-[1024px]">
		<div class="w-full py-2">{{ sMsg }}</div>
		<section v-show="progID=='041'">
			<div class="w-full bg-slate-200 flex flex-col lg:flex-row">
				<div v-if="bShow041" class="w-full lg:w-1/2 bg-white">
					<liwaTbl 
						:tblTitle="'斡旋金匯出入記錄'"
						:progID="'006_041D3'"
						:viewUrl="'006_have041D3.php'"
						:dataUrl="''"
						:params="mainConfig"
						:canEdit="false"
						@setList="setList"
						@sendMsg="showTblMsg"
					/>						
				</div>
				<div class="w-full lg:w-1/2 lg:ml-16 py-8 bg-white">
					<FormKit
						label="斡旋金金額*"
						type="number"
						min="1"
						v-model="iBargainAmt"
						help="請輸入匯入或匯出的斡旋金金額, 必須大於0"
						validation="required"
						:outer-class="'px-4 mb-8'"
					/>
					<div v-if="!bCloseEdit" class="w-full mt-12">
						<div class="w-full lg:w-[280px] mx-auto flex flex-row justify-between">
							<div class="w-24 h-12 py-2 bg-green-500 text-white text-center rounded-lg cursor-pointer" @click="import041D3()">匯入</div>
							<div class="w-24 h-12 py-2 bg-violet-500 text-white text-center rounded-lg cursor-pointer" @click="export041D3()">匯出</div>		
						</div>
					</div>
				</div>
			</div>
		</section>
		<section v-show="progID=='007'" class="w-full">
			<div class="w-full py-2 flex flex-col">
				<FormKit
					label="回復訊息*"
					type="text"
					v-model="sReplyMsg"
					validation="required"
					:class="'w-[calc(100%_-_0.5rem)]'"
				/>
				<div v-if="!bCloseEdit" class="w-20 mt-1 ml-2 py-2 rounded-lg bg-green-500 text-white text-center cursor-pointer" @click="send007D1()">發送</div>
			</div>
			<hr class="w-full h-[0.1rem] mt-8 bg-slate-400"/>
			<p class="w-full text-blue-700">以下為回復內容</p>
			<div v-if="liwaD1.length > 0" class="w-full flex flex-col">
				<div v-for="(objItem, index) in liwaD1" :key="index" class="w-full min-h-[2rem] py-1 flex flex-col">
					<div class="w-full flex flex-row justify-between">
						<div class="w-[calc(100%_-_3rem)] whitespace-pre-wrap py-1">{{ objItem.replyContent }}</div>
						<div v-if="!bCloseEdit" class="w-8 h-8 mt-1 cursor-pointer" @click="delReplyMsg(index)">
							<IconTrashFill class="w-7 h-7 text-red-500 font-bold" />
						</div>
					</div>
					<div class="text-right text-sm text-slate-500">{{ objItem.replyTime }}</div>
				</div>	
				<div v-if="!bCloseEdit" class="w-full">
					<div class="w-20 mt-1 ml-2 py-2 rounded-lg bg-violet-500 text-white text-center cursor-pointer" @click="closeTodo()">已完成</div>
				</div>			
			</div>

		</section>
		<section v-show="progID=='021'" class="w-full">
			<div class="w-full py-2 flex flex-col">
				<div class="w-full flex flex-row">
					<div class="w-[70px] ">
						<img :src="picpath" width="70" class="w-[70px]"/>
					</div>
					<div class="ml-4 pt-3">物件名稱: ({{ prodID }}) {{ prodNM }}</div>
				</div>
				<FormKit
					label="回復訊息*"
					type="text"
					v-model="sReply021Msg"
					validation="required"
					:class="'w-[calc(100%_-_0.5rem)]'"
				/>
				<div v-if="!bClose021Edit" class="w-20 mt-1 ml-2 py-2 rounded-lg bg-green-500 text-white text-center cursor-pointer" @click="send007D2()">發送</div>
			</div>
			<hr class="w-full h-[0.1rem] mt-8 bg-slate-400"/>
			<p class="w-full text-blue-700">以下為回復內容</p>
			<div v-if="liwaD2.length > 0" class="w-full flex flex-col">
				<div v-for="(objItem, index) in liwaD2" :key="index" class="w-full min-h-[2rem] py-1 flex flex-col">
					<div class="w-full flex flex-row justify-between">
						<div class="w-[calc(100%_-_3rem)] whitespace-pre-wrap py-1">{{ objItem.replyContent }}</div>
						<div v-if="!bClose021Edit" class="w-8 h-8 mt-1 cursor-pointer" @click="delReply021Msg(index)">
							<IconTrashFill class="w-7 h-7 text-red-500 font-bold" />
						</div>
					</div>
					<div class="text-right text-sm text-slate-500">{{ objItem.replyTime }}</div>
				</div>	
				<div v-if="!bClose021Edit" class="w-full">
					<div class="w-20 mt-1 ml-2 py-2 rounded-lg bg-violet-500 text-white text-center cursor-pointer" @click="closeTodo()">已完成</div>
				</div>			
			</div>

		</section>		
	</div>
</main>
<teleport to="body">
	<div v-if="isMsg" class="w-full h-full fixed top-0 left-0 bg-slate-100 z-[500]">
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