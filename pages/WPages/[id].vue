<script setup lang="ts">
	/*********************************************************
	prog name: 網頁明細CRUD, author: James Lin, date: 2022/08/02
	To Do: 發佈日期與下架日期改格式
	**********************************************************/
	import { ref, toRefs, onMounted, computed } from "vue"
	import { useFetch, createFetch, useTitle } from "@vueuse/core"
	import queryString from "query-string"
	import banner from "../../components/banner"
	import liwaMsg from "../../components/liwaMsg.vue"
	import TinyMceEditor from "@tinymce/tinymce-vue"
	import { IconPlusLg, IconGearFill, IconX, IconTrashFill } from '@iconify-prerendered/vue-bi'

	const APIsvr = ref('')
	const mainID = ref('')
	const progName = ref('網頁列表')
	const proglink = ref('/WPages')
	const detailFlg = ref(true)
	const detailName = ref('')
	const tmpData = ref({})
	const liwaData = ref({})
	const stitle = ref('')
	const submitted = ref(false)
	const sContent = ref('')
	const liwaEditor = ref(null)
	const isMsg = ref(false)
	const isConfig = ref(false)

	const imgInput = ref(null)
	const InitVal = ref({
		height: 400,
		language:"zh_TW",
		menubar: true,
		content_style:"../../assets/css/tinyMCE.css",
	    plugins: [
	    	'emoticons', 'fullscreen', 'lists', 'link', 'image', 'help', 'wordcount', 'code'
	    ],
	    fullscreen_native: true,
	    toolbar: 'fullscreen | undo redo | blocks |  forecolor backcolor | indent outdent | code | link image | bold italic | help',
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
		let url = `${APIsvr.value}/WPages_haveDetail.php?${sQuery}`
		const data = await useFetch(url, {method: 'GET'}, {refetch: true}).get().json()
		liwaData.value = data.data.value.arrSQL[0]
		liwaData.value.action = 'edit'
		liwaData.value.mainID = mainID.value
		detailName.value = liwaData.value.stitle
		stitle.value = detailName.value 
		sContent.value = liwaData.value.sContent
		// console.log('liwaData =', liwaData.value, '; sContent =', sContent.value)
	}	

	const saveData = async () => {
		liwaData.value.sContent = tinymce.activeEditor.getContent({format: 'html'})
		liwaData.value.JWT = window.localStorage.getItem('liwaJWT')
		let datastr = JSON.stringify(liwaData.value)
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
	    const { data } = await useMyFetch('WPages_edit.php').post().json()
	    let msg = data.value.message
	    	if (!msg) {
			    if (liwaData.value.action == 'add') {
				    	mainID.value = data.value.key
			    }
			    window.location.href = '/WPages/' + mainID.value	    	
	    	} else {
	    		showMsg('存檔錯誤', msg, 1)
	    	}
	}

	const jumpAdd = () => {
		window.location.href = '/WPages/add'
	}

	const clearData = () => {
		let tmpData = {
			'action': 'add',
			'JWT': window.localStorage.getItem('liwaJWT'),
			'mainID': '',
			'stitle': '',
			'sContent': ''
		}
		detailName.value = '新增網頁'
		stitle.value = '新增網頁'
		liwaData.value = tmpData	
	}

	onMounted(() => {
		useHead({title:'網頁明細'})
		APIsvr.value = window.sessionStorage.getItem('liwaAPIsvr')
		// 取得 mainID, 由mainID取得
		const route = useRoute()
		mainID.value = route.params.id
		//	由 mainID 取得資料
		if (mainID.value !== 'add') {
			loadData() 
		} else {
			clearData()
		}

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
<main class="w-full h-full flex flex-col justify-center items-center bg-slate-200">
	<div class="barPanel w-[95%] h-12 rounded-3xl mt-2 ml-4 mb-2 px-1 flex flex-row justify-between">
		<div class="w-1/3 flex flex-row">
<!-- 			<div class="top-icon add ml-4 -mt-1" @click="jumpAdd()">
				<IconPlusLg class="w-7 h-7 text-white font-bold" />
			</div> -->
		</div>
		<div class="w-1/3 text-center">
			{{ stitle }}
		</div>
		<div class="w-1/3 flex flex-row justify-end">
		
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
				<div v-if="liwaData.action == 'add'">
					<FormKit
						name="mainID"
						label="網頁程式名稱*"
						type="text"
						placeholder="請設定網頁程式名稱"
						help="請設定網頁程式名稱(如 About, QnA等...)"
						validation="required"
					/>					
				</div>
				<FormKit
					name="stitle"
					label="網頁標題*"
					type="text"
					placeholder="請輸入標題"
					help="輸入網頁的標題(字數限制150字)"
					validation="required"
				/>
				<div class="w-full h-[450px]">
					<div class="w-full h-8 text-sm font-bold text-slate-800">網頁內容</div>
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
		<div v-else class="w-full h-full mx-auto my-0 pt-48">
			<div class="w-full text-center text-3xl font-semibold">暫無資料</div>
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
	.tox .tox-mbtn {
		width: auto;
	}
</style>