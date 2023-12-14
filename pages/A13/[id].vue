<script setup lang="ts">
	/*********************************************************
	prog name: 郵件明細, author: James Lin, date: 2023/05/29
	Todo: 1. 串資料庫
	**********************************************************/
	import { ref, toRefs, onMounted, computed } from "vue"
	import { useFetch, createFetch, useTitle } from "@vueuse/core"
	import queryString from "query-string"
	import banner from "../../components/banner"
	import liwaMsg from "../../components/liwaMsg.vue"
	import liwaMultiSelect from "../../components/liwaMultiSelect.vue"
	import TinyMceEditor from "@tinymce/tinymce-vue"
	import { IconPlusLg, IconGearFill, IconX, IconArrowRightCircleFill, IconAirplane } from '@iconify-prerendered/vue-bi'
	import { IconEmail } from '@iconify-prerendered/vue-mdi'

	const route = useRoute()
	const APIsvr = ref('')
	const mainID = ref('')
	const progName = ref('郵件列表')
	const proglink = ref('/A13')
	const detailFlg = ref(true)
	const detailName = ref('')

	const action = ref('view')
	const tmpData = ref({})
	const liwaData = ref({})
	const liwaD1 = ref([])
	const arrClub = ref([])
	const stitle = ref('')
	const submitted = ref(false)
	const sContent = ref('')
	const liwaEditor = ref(null)
	const isMsg = ref(false)
	const isConfig = ref(false)
	const isAddDlg = ref(false)
	const UserParam = ref('')
	const sEPaper = ref('是')
	const bEditBox = ref(false)
	const sMail = ref('')

	const imgInput = ref(null)
	const InitVal = ref({
		height: 400,
		language:"zh_TW",
		menubar: true,
		content_style:"../../assets/css/tinyMCE.css",
	    plugins: [
	    	'emoticons', 'fullscreen', 'lists', 'link', 'image', 'help', 'wordcount'
	    ],
	    fullscreen_native: true,
	    toolbar: 'fullscreen | undo redo | blocks |  forecolor backcolor | indent outdent | emoticons | link image | bold italic | help',
	    file_picker_callback: function(callback, value, meta) {
		  	if (meta.filetype == 'image') {
		  // 		const imgInput = document.createElement('input')
				// imgInput.setAttribute('type', 'file');
				// imgInput.setAttribute('accept', 'image/*');
				imgInput.value.addEventListener('change', (e) => {
					const file = e.target.files[0]
					const reader = new FileReader()
					reader.onload = (e) => {
						callback(e.target.result, { alt: ''})
					}
					reader.readAsDataURL(file)
				})
				imgInput.value.click()
			}
		},
	})

	const loadData = async () => {
		let keydata = {
			'JWT': window.localStorage.getItem('liwaJWT'),
			'mainID': mainID.value
		}
		let sQuery = queryString.stringify(keydata)		
		let url = `${APIsvr.value}/A13_haveDetail.php?${sQuery}`
		const data = await useFetch(url, {method: 'GET'}, {refetch: true}).get().json()
		liwaData.value = data.data.value.arrSQL[0]
		liwaData.value.action = 'view'
		liwaData.value.mainID = mainID.value
		sEPaper.value = (liwaData.value.isEPaper == 0)? '否': '是'
		detailName.value = liwaData.value.title
		stitle.value = detailName.value 
		sContent.value = liwaData.value.content		
		liwaD1.value = data.data.value.arrD1
		console.log('liwaD1 in loadData =', liwaD1.value)
	}

	const loadClub = async () => {
		let keydata = {
			'JWT': window.localStorage.getItem('liwaJWT'),
		}
		let sQuery = queryString.stringify(keydata)		
		let url = `${APIsvr.value}/A13_haveClub.php?${sQuery}`
		const dataClub = await useFetch(url, {method: 'GET'}, {refetch: true}).get().json()
		arrClub.value = dataClub.data.value.arrSQL		
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

	const showConfig = () => {
		isConfig.value = true
	}

	const hideConfig = () => {
		isConfig.value = false	
	}
	// 設定對話盒及設定對話盒相關 ends

	const delReceiver = (idx) => {
		console.log('idx in delReceiver =', idx)
		liwaD1.value.splice(idx)
		console.log('liwaD1 in delReceiver =', liwaD1.value)
	}

	const saveData = async () => {
		if (action.value == 'view') action.value = 'edit'
		if (liwaD1.value.length > 0) liwaData.value.receivers = liwaD1.value
		liwaData.value.content = tinymce.activeEditor.getContent({format: 'html'})
		liwaData.value.isEPaper = (sEPaper == '是')?1: 0;	
		liwaData.value.JWT = window.localStorage.getItem('liwaJWT')
		liwaData.value.action = action.value
		let datastr = JSON.stringify(liwaData.value)
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
	    const { data } = await useMyFetch('A13_edit.php').post().json()
	    let msg = data.value.message
	    if (!msg) {
		    if (liwaData.value.action == 'add') {
		    	mainID.value = data.value.key
		    	window.location.href = '/A13/' + mainID.value 
		    } else {
		    	loadData()
		    }	    	
	    } else {
	    	showMsg('存檔錯誤', msg, 1)
	    }
	}

	const callDialog = () => {
		imgInput.value.click()
	}	

	const handleImage = (e) => {
		const selectedImage = e.target.files[0]
		createBase64Image(selectedImage)
	}

	const createBase64Image = (fileObject) => {
		const reader = new FileReader()

		reader.onload = (e) => {
			liwaData.value.picpath = e.target.result
		}
		reader.readAsDataURL(fileObject)
	}	

	const jumpAdd = () => {
		window.location.href = '/A13/add'
	}

	const clearData = () => {
		let tmpData = {
			'action': 'add',
			'JWT': window.localStorage.getItem('liwaJWT'),
			'mainID': '',
			'title': '',
			'clubID': 'liwa14010001',
			'isEPaper':'',
			'content':'',
			'receivers':[]
		}
		detailName.value = '新增郵件'
		stitle.value = '新增郵件'
		action.value = 'add'
		liwaData.value = tmpData		
	}

	const sendMail = async () => {
		let keydata = {
			'JWT': window.localStorage.getItem('liwaJWT'),
			'subject': liwaData.value.title,
			'sContent': sContent.value,
			'D1': liwaD1.value
		}
		let datastr = JSON.stringify(keydata)
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
	    const { data } = await useMyFetch('A13_sendMail.php').post().json()
	    let msg = data.value.message
	    console.log('msg =', msg)		

	}

	const toggleAddDlg = () => {
		isAddDlg.value = !isAddDlg.value
	}

	const ShowAddDlg = async () => {
		// 取得 liwaD1 的 userID
		let arrUserID = [];
		for (let i = 0; i< liwaD1.value.length; i++) {
			let sReceiverID = liwaD1.value[i].userID
			arrUserID.push(sReceiverID)
		}
		let keydata = {
			'userIDs': arrUserID
		}
		UserParam.value = JSON.stringify(keydata)
		isAddDlg.value = true
	}

	const setNewD1 = (arrTmp) => {
		// 將 arrTmp 加入 liwaD1 中
		for (let i = 0; i < arrTmp.length; i++) {
			let objItem = {
				"userID": arrTmp[i].mainID,
				"userName": arrTmp[i].username,
				"usermail": arrTmp[i].usermail
			}
			liwaD1.value.push(objItem)

		}
		isAddDlg.value = false
	}

	const setActvTab = (index) => {
		step.value = arrTabs.value[index]
	}	

	const toggleEditBox = () => {
		sMail.value = ''
		bEditBox.value = !bEditBox.value
	}

	const AddNuEmail = () => {
		if (!/^[^@]+@\w+(\.\w+)+\w$/.test(sMail.value)) {
			alert('Email 錯誤')
		} else {
			let objItem = {
				"userID": '',
				"userName": sMail.value,
				"usermail": sMail.value
			}
			liwaD1.value.push(objItem)
		}
		bEditBox.value = false
	}

	const testProc = () => {
		isAddDlg.value = true
	}

	onMounted(() => {
		useHead({title:'郵件明細'})
		APIsvr.value = window.sessionStorage.getItem('liwaAPIsvr')		
		// 取得 mainID, 由mainID取得
		mainID.value = route.params.id
		// 由 mainID 取得資料
		if (mainID.value !== 'add') {
			loadData() 
		} else {
			clearData()
		}
		loadClub()
	})	

	// definePageMeta({
	//   layout: "default",
	//   colorMode: "light"
	// })	
				
</script>

<template>
<NuxtLayout name="default">
<banner v-if="liwaData.length > 0"
	:progname="progName"
	:proglink="proglink"
	:detailflg="detailFlg"
	:detailName="detailName"
></banner>	
<div class="w-full h-full flex flex-col justify-center items-center bg-slate-200">
	<div class="barPanel w-[95%] h-12 rounded-3xl mt-2 ml-4 mb-2 px-1 flex flex-row justify-between">
		<div class="w-1/3 flex flex-row">
			<div class="top-icon add ml-4 -mt-1" @click="jumpAdd()">
				<IconPlusLg class="w-7 h-7 text-gray-100 font-bold" />
			</div>
			<div class="top-icon add ml-2 -mt-1" @click="sendMail()">
				<IconEmail class="w-7 h-7 text-gray-100 font-bold" />
			</div>
			<div class="top-icon add ml-2 -mt-1" @click="testProc()">
				<IconAirplane class="w-7 h-7 text-gray-100 font-bold" />
			</div>
		</div>
		<div class="w-1/3 text-center">
			{{ stitle }}
		</div>
		<div class="w-1/3 flex flex-row justify-end">
            <div class="top-icon config -mt-1 mr-4"
                 @click="showConfig()"
            >
            	<IconGearFill class="w-7 h-7 text-orange-400 font-bold" />
            </div>			
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
				<div class="w-full h-[6.5rem] flex flex-col relative">
					<div class="w-full font-bold text-sm">收件人*</div>
					<div class="w-full min-h-20 flex flex-row overflow-x-hidden overflow-y-auto py-1 px-1 rounded-lg bg-white border-[1px] border-slate-800" title="按空白處新增自訂收件者">
						<div class="w-8 h-8 mt-1 mr-2 bg-orange-400 rounded-full cursor-pointer" @click="ShowAddDlg()">
							<IconPlusLg class="w-7 h-7 mt-[1px] ml-[1px] text-gray-100 font-bold" />
						</div>
						<div class="w-[calc(100%_-_3rem)] flex flex-row flex-wrap " @click.stop="toggleEditBox()">
							<div v-for="(objItem, index) in liwaD1" class="h-10 mr-2 pt-2 pl-2 pr-6 relative border-b-[1px] border-b-slate-600 bg-white">
								<div class="absolute -right-1 -top-1 cursor-pointer" @click.stop="delReceiver(index)">
									<IconX class="w-7 h-7 text-red-400 font-bold" />
								</div>
								{{ objItem.userName }}
							</div>							
						</div>
					</div>
					<div class="w-full h-8 mt-2 text-xs text-slate-700">要新增系統內收件人請按「+」按鈕, 要新增系統外收件人請按收件人欄空白處 </div>
					<div v-if="bEditBox==true" class="w-full h-24 absolute top-[4rem] left-0 border-2 border-slave-400 bg-white">
						<div class="w-full h-full pl-4 pr-8 flex flex-row justify-between relative">
							<div class="w-[calc(100%_-_3rem)]">
								<FormKit
									label="收件人Email*"
									type="email"
									v-model="sMail"
									placeholder="Email 地址"
									help="若要發信給非系統內成員, 請輸入收件人的Email地址。"
									validation="required"
								/>								
							</div>
							<div class="w-8 h-8 mt-8 cursor-pointer" @click="AddNuEmail()">
								<IconArrowRightCircleFill class="w-7 h-7 text-green-400 font-bold" />
							</div>
							<div class="w-8 h-8 absolute top-1 right-1" @click="toggleEditBox()">
								<IconX class="w-7 h-7 text-red-400 font-bold" />
							</div>
						</div>
					</div>
				</div>
				<FormKit
					name="title"
					label="郵件標題*"
					type="text"
					placeholder="請輸入標題"
					help="輸入郵件的標題(字數限制150字)"
					validation="required"
				/>
				<div v-if="arrClub.length > 0" class="w-full">
					<FormKit
						name="clubID"
						label="發信單位*"
						type="select"
						help="輸入郵件的發信單位"
						:options="arrClub"
						validation="required"
					/>					
				</div>
				<div v-if="action=='edit'" class="w-full text-md">
					發信時間: {{ liwaData.sendTime }}
				</div>
				<FormKit
					label="是否電子報?"
					type="radio"
					v-model="sEPaper"
					:options="['是','否']"
					help="請設定是否電子報?"
				/>				
				<div class="w-full h-[450px]">
					<div class="w-full h-8 text-sm font-bold text-slate-800">郵件內容</div>
					<div class="w-full h-full">
						<TinyMceEditor api-key="fkoaqldrjeuygn6wbe51uchydhzrhufgs8a9tt6yehn106uo" 
						:init="InitVal"
						ref="liwaEditor"
						v-model="sContent"
						@change="handleOnChange"/>
					</div>
				</div>
			</FormKit>
		</div>
	</div>	
</div>
<div class="invisible">
	<input 
		ref="imgInput" 
		class="w-11/12 h-8 bg-grey-100 hidden" 
		type="file" 
		accept="image/*" 
	/>		
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
<Teleport to="body">
	<div v-if="isConfig" class="w-full h-full fixed top-[130px] left-0 bg-slate-100 z-[500]">
	</div>
</Teleport>
<Teleport to="body">
	<div v-if="isAddDlg" 
		class="w-full h-full absolute top-[130px] left-0 bg-slate-100 z-[500]">
	    <div class="flex justify-center w-full h-screen bg-transparent items-start antialiased">
	      	<div class="h-[69vh] flex flex-col mt-4 w-11/12 sm:w-5/6 lg:w-1/2 max-w-lg mx-auto rounded-lg border border-gray-300 shadow-xl">
		        	<div class="relative flex flex-row justify-between px-6 py-2 bg-white border-b border-gray-200 rounded-tl-lg rounded-tr-lg text-center ">
		        		<div class="w-full h-8 text-lg text-center">設定收件者</div>
					<div class="w-8 h-8 absolute top-2 right-1 bg-white cursor-pointer" @click.prevent="toggleAddDlg()">
						<IconX class="w-7 h-7 text-red-400 font-bold" />
					</div>
				</div>
				<div class="w-full">
					<div v-if="UserParam" class="w-full ">
						<liwaMultiSelect
							:tblTitle="'收信者列表'"
							:progID="'A13_userlist'"
							:viewUrl="'A13_haveUnselected.php'"
							:dataUrl="''"
							:params="UserParam"
							:canEdit="true"
							@setList="setNewD1"
							@sendMsg="sendMsg"		
						/>
					</div>
				</div>
			</div>
		</div>	
	</div>
</Teleport>
</NuxtLayout>
</template>
