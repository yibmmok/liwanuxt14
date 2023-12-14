<script setup lang="ts">
	/*********************************************************
	prog name: 公告明細CRUD, author: James Lin, date: 2022/08/02
	To Do: 發佈日期與下架日期改格式
	**********************************************************/
	import { ref, toRefs, onMounted, computed } from "vue"
	import { useFetch, createFetch, useTitle } from "@vueuse/core"
	import queryString from "query-string"
	import banner from "../../components/banner"
	import liwaMsg from "../../components/liwaMsg.vue"
	import liwa2ColList from "../../components/liwa2ColList.vue"
	import TinyMceEditor from "@tinymce/tinymce-vue"
	import { IconX } from '@iconify-prerendered/vue-bi'	

	const mainID = ref('')
	const progName = ref('公告列表')
	const proglink = ref('/005')
	const detailFlg = ref(true)
	const detailName = ref('')
	const APIsvr = ref('')
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
	const arrItemType = ref([])
	const action = ref('view')

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
		let keydata = {
			'JWT': window.localStorage.getItem('liwaJWT'),
			'mainID': mainID.value
		}
		let sQuery = queryString.stringify(keydata)		
		let url = `${APIsvr.value}/005_haveDetail.php?${sQuery}`
		const data = await useFetch(url, {method: 'GET'}, {refetch: true}).get().json()
		liwaData.value = data.data.value.arrSQL[0]
		// liwaData.value.JWT = window.localStorage.getItem('liwaJWT')
		liwaData.value.mainID = mainID.value
		detailName.value = liwaData.value.shortItems
		stitle.value = detailName.value 
		sContent.value = liwaData.value.items
	}	

	const loadDetail1 = async () => {
		// 取得公告類別列表
		let keydata = {
			'JWT': window.localStorage.getItem('liwaJWT'),
		}
		let sQuery = queryString.stringify(keydata)		
		let url = `${APIsvr.value}/005_haveItemType.php?${sQuery}`
		const detail1 = await useFetch(url, {method: 'GET'}, {refetch: true}).get().json()
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
		arrItemType.value = [...liwaDetail1.value]
	}

	const saveData = async () => {
		if (action.value == 'view') action.value = 'edit'
		liwaData.value.isTop = bTop.value
		liwaData.value.items = tinymce.activeEditor.getContent({format: 'html'})
		liwaData.value.action = action.value
		liwaData.value.JWT = window.localStorage.getItem('liwaJWT')
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
	    const { data } = await useMyFetch('005_edit.php').post().json()
	    let msg = data.value.message
	    if (!msg) {
		    if (liwaData.value.action == 'add') {
		    	mainID.value = data.value.key
		    	window.location.href = '/005/' + mainID.value 
		    } else {
		    		stitle.value = liwaData.value.shortItems	
		    }
		        	
	    } else {
	    		showMsg('存檔錯誤', msg, 1)
	    }
	}

	const bTop = computed(() => {
		return (liwaData.value.isTop == 0)? false: true
	})

	const jumpAdd = () => {
		window.location.href = '/005/add'
	}

	const clearData = () => {
		let tmpData = {
			'action': 'add',
			'mainID': '',
			'pDate': '',
			'offDate': '',
			'itemTypeID': 'liwa1401',
			'itemType': '系統公告',
			'shortItems': '',
			'items': '',
			'isTop': 0,
			'iAuth': 1
		}
		action.value = 'add'
		detailName.value = '新增公告'
		stitle.value = '新增公告'
		liwaData.value = tmpData		
	}

	const renewD1 = (arrD1) => {
		loadDetail1()
		// arrItemType.value = []
		// arrD1.forEach((item) => {
		// 	let objItem = {
		// 		'label': item.itemNM,
		// 		'value': item.mainID
		// 	}
		// 	arrItemType.value.push(objItem)
		// })
		// if (arrD1.length > 0) loadDetail1() 
	}

	onMounted(() => {
		useHead({title:'公告明細'})
		APIsvr.value = window.sessionStorage.getItem('liwaAPIsvr')		
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
			<div class="top-icon add ml-4 -mt-1" @click="jumpAdd()">
				<svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7" fill="#fee" viewBox="-1 -1 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke="#fee" stroke-linejoin="round" stroke-width="6" d="M12 4v16m8-8H4" />
				</svg>
			</div>
		</div>
		<div class="w-1/3 text-center">
			{{ stitle }}
		</div>
		<div class="w-1/3 flex flex-row justify-end">
            <div class="top-icon config -mt-1 mr-4"
                 @click="showConfig()"
            >
				<svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7" viewBox="-1 -1 20 20" fill="#ffeeee">
					<g style="">
					<path fill-rule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM7 13a4 4 0 100-6 4 4 0 000 6z" clip-rule="evenodd" />
					</g>
				</svg>             
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
		          name="shortItems"
		          label="標題*"
		          type="text"
		          placeholder="請輸入標題"
		          help="輸入公告的標題(字數限制150字)"
		          validation="required"
		        />
		        <div class="w-full flex flex-col lg:flex-row mb-4">
		        	<div class="w-full lg:w-1/2 lg:pr-4">
				        <FormKit
				          name="pDate"
				          label="發布日期*"
				          type="datetime-local"
				          placeholder="請設定發布日期"
				          help="請設定發布日期"
				          validation="required"
				        />
		        	</div>
		        	<div class="w-full lg:w-1/2 lg:pr-4">
				        <FormKit
				          name="offDate"
				          label="下架日期*"
				          type="datetime-local"
				          placeholder="請設定下架日期"
				          help="請設定下架日期"
				          validation="required"
				        />
		        	</div>
		        </div>
		        <FormKit
		          v-model="bTop"
		          name="isTop"
		          label=""
		          :options="['置頂']"
		          type="checkbox"
		          help="勾選此選項會設定置頂此公告"
		        />	
		        <div v-if="isConfig == false" class="w-full">
			        <FormKit
			          name="itemTypeID"
			          label="公告類別"
			          type="select"
			          :options="arrItemType"
			        />		        	
		        </div>
				<div class="w-full h-[450px]">
					<div class="w-full h-8 text-sm font-bold text-slate-800">公告內容</div>
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
	<teleport to="body">
		<div v-if="isConfig" 
			class="w-[100vw] h-[100vh] fixed top-0 left-0 bg-transparent z-[500]"
		>
			<div class="w-full md:w-[800px] min-h-[calc(100vh_-_200px)] mx-auto mt-[200px] bg-white relative">
				<liwaTbl
					:tblTitle="'公告類別設定表'"
					:progID="'005_Config'"
					:dataUrl="'005_D1edit.php'"
					:canEdit="true"
					@setList="renewD1"
				/>				
				<div class="w-8 h-8 absolute top-2 right-2 bg-red-600 rounded-full" @click="hideConfig()">
					<IconX class="w-8 h-8 text-white font-bold" />
				</div>					
			</div>
		</div>
	</teleport>
</NuxtLayout>	
</template>