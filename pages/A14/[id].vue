<script setup lang="ts">
	/*********************************************************
	prog name: 物件明細, author: James Lin, date: 2022/09/01
	Todo: 1. 串資料庫
	**********************************************************/
	import { ref, toRefs, onMounted, computed } from "vue"
	import { useFetch, createFetch, useTitle } from "@vueuse/core"
	import banner from "../../components/banner"
	import liwaMsg from "../../components/liwaMsg.vue"
	// import ConfigA14 from "../../components/A14/ConfigA14.vue"
	import TinyMceEditor from "@tinymce/tinymce-vue"
	import { IconPlusLg, IconSearch, IconTrash, IconCheck, IconDash, IconGearFill, IconStar, IconStarFill, IconX } from '@iconify-prerendered/vue-bi'

	const mainID = ref('')
	const progName = ref('文章列表')
	const proglink = ref('/A14')
	const detailFlg = ref(true)
	const detailName = ref('')
	const uGroups = ref([])
	const tmpData = ref({})
	const liwaData = ref({})
	const liwaDetail1 = ref([])
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
		let url= window.sessionStorage.getItem('liwaAPIsvr') + "/A14_haveDetail.php?siteID=" + window.sessionStorage.getItem('liwaSiteID') + "&mainID=" + mainID.value
		const data = await useFetch(url, {method: 'GET'}, {refetch: true}).get().json()
		liwaData.value = data.data.value.arrSQL[0]
		liwaData.value.action = 'edit'
		liwaData.value.mainID = mainID.value
		liwaData.value.siteID = window.sessionStorage.getItem('liwaSiteID')
		liwaData.value.userID = window.sessionStorage.getItem('liwaUserID')
		liwaData.value.makerName = window.sessionStorage.getItem('liwaUserName')
		detailName.value = liwaData.value.title
		stitle.value = detailName.value 
		sContent.value = liwaData.value.sContent
	}	

	const loadDetail1 = async () => {
		// 取得文章類別列表
		let url1 = window.sessionStorage.getItem('liwaAPIsvr') + "/A14_haveItemType.php?siteID="+window.sessionStorage.getItem('liwaSiteID')
		const detail1 = await useFetch(url1, {method: 'GET'}, {refetch: true}).get().json()
		let arrDetail1 = detail1.data.value.arrSQL
		let arrTmp = []
		for (let i=0; i<arrDetail1.length; i++) {
			let objItem = {
				label:arrDetail1[i].label,
				value:arrDetail1[i].value,
				iAuth:arrDetail1[i].iAuth
			}
			arrTmp.push(objItem)
		}
		liwaDetail1.value = arrTmp
	}

	const saveData = async () => {
		liwaData.value.sContent = tinymce.activeEditor.getContent({format: 'html'})
		let datastr = JSON.stringify(liwaData.value)
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
	    const { data } = await useMyFetch('A14_edit.php').post().json()
	    let msg = data.value.message
	    if (!msg) {
		    if (liwaData.value.action == 'add') {
		    	mainID.value = data.value.key
		    	window.location.href = '/A14/' + mainID.value 
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
		window.location.href = '/A14/add'
	}

	const clearData = () => {
		let tmpData = {
			'action': 'add',
			'siteID': window.sessionStorage.getItem('liwaSiteID'),
			'userID': window.sessionStorage.getItem('liwaUserID'),
			'makerName':window.sessionStorage.getItem('liwaUserName'),
			'mainID': '',
			'title': '',
			'itemTypeID': 'liwa1401',
			'author':'',
			'unit':'',	
			'pDate': '',
			'offDate': '',
			'picpath':'/static/NoPic.png',
			'altName':'',
			'sContent': ''
		}
		detailName.value = '新增文章'
		stitle.value = '新增文章'
		liwaData.value = tmpData		
	}	

	const picSrc = computed(() => {
		let picHead = liwaData.value.picpath.substr(0, 5)
		let setPic = (liwaData.value.action == 'add')? '/static/NoPic.png': window.sessionStorage.getItem('liwaImgsvr')+'/'+liwaData.value.picpath
		let AA = (picHead == 'data:')? liwaData.value.picpath: setPic
		return AA
	})	

	onMounted(() => {
    	const title = useTitle(`文章明細`)
		// 取得 mainID, 由mainID取得
		const route = useRoute()
		mainID.value = route.params.id
		//	由 mainID 取得資料
		loadDetail1()
		if (mainID.value !== 'add') {
			loadData() 
		} else {
			clearData()
		}

	})	

	definePageMeta({
	  title: '文章明細',
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
<main class="w-full h-full flex flex-col justify-center items-center bg-slate-200">
	<div class="barPanel w-[95%] h-12 rounded-3xl mt-2 ml-4 mb-2 px-1 flex flex-row justify-between">
		<div class="w-1/3 flex flex-row">
			<div class="top-icon add ml-4 -mt-1" @click="jumpAdd()">
				<IconPlusLg class="w-7 h-7 text-green-400 font-bold" />
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
		        <FormKit
		          name="title"
		          label="標題*"
		          type="text"
		          placeholder="請輸入標題"
		          help="輸入文章的標題(字數限制150字)"
		          validation="required"
		        />
		        <FormKit
		          name="author"
		          label="作者*"
		          type="text"
		          placeholder="請輸入作者姓名"
		          help="輸入文章的作者姓名"
		          validation="required"
		        />	
		        <FormKit
		          name="unit"
		          label="所屬單位"
		          type="text"
		          placeholder="請輸入作者所屬單位"
		          help="輸入文章的作者所屬單位"
		        />			        	        
		        <div class="w-full flex flex-col lg:flex-row mb-4">
		        	<div class="w-full lg:w-1/2 lg:pr-4">
				        <FormKit
				          name="pDate"
				          label="發表日期*"
				          type="datetime-local"
				          placeholder="請設定發表日期"
				          help="請設定發表日期"
				          validation="required"
				        />
		        	</div>
		        	<div class="w-full lg:w-1/2 lg:pr-4">
				        <FormKit
				          name="offDate"
				          label="下架日期"
				          type="datetime-local"
				          placeholder="請設定下架日期"
				          help="請設定下架日期"
				        />
		        	</div>
		        </div>	 
		        <FormKit
		        	name="itemTypeID"
		        	label="文章分類"
		        	type="select"
		        	help="請設定文章分類"
		        	:options="liwaDetail1"
		        />
		        <p class="font-bold text-sm my-2">文章主圖</p>
				<div class="w-full h-[200px] bg-white pt-6">
					<img 
					class="mx-auto border-2 w-[200px]"
					:src="picSrc" 
					width="200" 
					:alt="liwaData.altName" 
					@click="callDialog"
					/>
				</div>
		        <FormKit
		          name="altName"
		          label="圖片說明*"
		          type="text"
		          placeholder="請輸入圖片說明文字"
		          help="輸入文章的圖片說明文字"
		          validation="required"
		        />	

				<div class="w-full h-[450px]">
					<div class="w-full h-8 text-sm font-bold text-slate-800">文章內容</div>
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
		<div
			v-if="isMsg" 
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
		<div
			v-if="isConfig" 
			class="w-full h-full absolute top-[130px] left-0 bg-slate-100 z-[500]"
		>
<!-- 			<ConfigA14
				@hideConfig="hideConfig"
			></ConfigA14> -->
		</div>
	</Teleport>	
	<div class="invisible">
		<input 
			id="imgInput" 
			ref="imgInput" 
			class="w-11/12 h-8 bg-grey-100 hidden" 
			type="file" 
			accept="image/*" 
			@change.stop="handleImage" 
		/>		
	</div>	
</template>