<script setup lang="ts">
	/*********************************************************
	prog name: 系統程式明細CRUD, author: James Lin, date: 2022/10/27

	**********************************************************/
	import { ref, reactive, onMounted, computed } from "vue"
	import { useFetch, createFetch, useTitle } from "@vueuse/core"
	import queryString from "query-string"
	import banner from "../../components/banner"
	import liwaMsg from "../../components/liwaMsg.vue"
	import { IconPlusLg, IconFilePerson } from '@iconify-prerendered/vue-bi'

	const mainID = ref('')
	const progName = ref('系統程式列表')
	const proglink = ref('/001')
	const detailFlg = ref(true)
	const detailName = ref('')
	const siteID = ref('')
	const liwaData = ref([])
	const liwaDetail1 = ref([])
	const liwaDetail2 = ref([])
	const stitle = ref('')
	const submitted = ref(false)
	const imgInput = ref(null)
	const isMsg = ref(false)
	const isConfig = ref(false)	
	const action = ref('view')
	const APIsvr = ref('')
	const imgSvr = ref('')

	const loadData = async () => {
		let keydata = {
			'JWT': window.localStorage.getItem('liwaJWT'),
			'mainID': mainID.value
		}
		let sQuery = queryString.stringify(keydata)		
		let url = `${APIsvr.value}/001_haveDetail.php?${sQuery}`
		const data = await useFetch(url, {method: 'GET'}, {refetch: true}).get().json()
		liwaData.value = data.data.value.arrSQL[0]
		action.value = 'edit'
		liwaData.value.mainID = mainID.value
		liwaData.value.JWT = window.localStorage.getItem('liwaJWT')
		let res = liwaDetail1.value.filter((m) => m.label == '信仲科技')
		liwaData.value.ownerID = res[0].value
		detailName.value = liwaData.value.progName
		stitle.value = detailName.value + ' 的資料'
	}

	const loadDetail1 = async () => {
		let keydata = {
			'JWT': window.localStorage.getItem('liwaJWT'),
			'mainID': mainID.value
		}
		let sQuery = queryString.stringify(keydata)		
		let url = `${APIsvr.value}/001_haveOwner.php?${sQuery}`
		const data = await useFetch(url, {method: 'GET'}, {refetch: true}).get().json()
		liwaDetail1.value = data.data.value.arrSQL
	}

	const loadDetail2 = async () => {
		let keydata = {
			'JWT': window.localStorage.getItem('liwaJWT'),
			'mainID': mainID.value
		}
		let sQuery = queryString.stringify(keydata)		
		let url = `${APIsvr.value}/001_haveExportpath.php?${sQuery}`
		const data = await useFetch(url, {method: 'GET'}, {refetch: true}).get().json()
		liwaDetail2.value = data.data.value.arrSQL	
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
			liwaData.value.imgPath = e.target.result
		}
		reader.readAsDataURL(fileObject)
	}

	const jumpAdd = () => {
		window.location.href = '/001/add'
	}

	const clearData = () => {
		let tmpData = {
			'action': 'add',
			'JWT': window.localStorage.getItem('liwaJWT'),
			'mainID':'',
			'progID':'',
			'progName':'',
			'LMName':'',
			'groupName':'',
			'imgPath':'/syspics/forms.png',
			'exportPath':'',
			'authLimit':1,
			'lang':'tw',
			'ownerID':'',
			'owner':'',
			'slink':''
		}
		action.value = 'add'
		detailName.value = '新增系統模組'
		stitle.value = '新增系統模組'
		liwaData.value = tmpData
	}	

	const saveData = async () => {
		if (action.value == 'view') {
			action.value = 'edit'
		}
		liwaData.value.action = action.value
		let iLength = imgSvr.value.length
		liwaData.value.imgPath = iconSrc.value.substr(iLength)
		liwaData.value.ownerID = liwaDetail1.value[0].value
		if (liwaData.value.groupName == '') liwaData.value.groupName = 'forms'
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
	    const { data } = await useMyFetch('001_edit.php').post().json()
	    if (!data.value.message) {
		    mainID.value = data.value.key
		    if (liwaData.value.action == 'add') {
		    	window.location.href = '/001/' + mainID.value
		    }
		    liwaData.value.action = 'view'
		   	action.value = 'view'	
	    } else {
	    	showMsg('存檔錯誤', data.value.message, 1)
	    }	    
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
	// 訊息對話盒及設定對話盒相關 ends

	const iconSrc = computed(() => {
		let AA = '/syspics/forms.png'
		// 若 imgPath為data: 開頭, 不加 liwaImgsvr
		let iconHead = liwaData.value.imgPath.substr(0, 5)
		if (iconHead !== 'data:') {

			switch (liwaData.value.groupName) {
				case 'forms':
					AA = '/syspics/forms.png'
					break
				case 'config':
					AA = '/syspics/config.png'
					break
				case 'reports':
					AA = '/syspics/reports.png'
					break
				case '自訂':
					AA = '/syspics/NoPic.png'
					break
			}			
		} else {
			AA = liwaData.value.imgPath
		}
		return window.sessionStorage.getItem('liwaImgsvr')+AA
	})

	onMounted(() => {
		useHead({title:'系統程式明細'})
		APIsvr.value = window.sessionStorage.getItem('liwaAPIsvr')
		// 取得 mainID, 由mainID取得
		const route = useRoute()
		mainID.value = route.params.id
		loadDetail1()
		loadDetail2()		
		//	由 mainID 取得資料
		if (mainID.value == 'add') {
			clearData()
		} else {
			loadData() 
		}
		imgSvr.value = window.sessionStorage.getItem('liwaImgsvr')
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
<div class="w-full h-full flex flex-col justify-center items-center bg-slate-200">
	<div class="barPanel w-[95%] h-12 rounded-3xl mt-2 ml-4 mb-2 px-1 flex flex-row justify-between">
		<div class="w-1/3 flex flex-row">
			<div class="top-icon add ml-4 -mt-1" @click="jumpAdd()">
				<IconPlusLg class="w-7 h-7 text-white font-bold" />
			</div>
		</div>
		<div class="w-1/3 text-center">
			{{ stitle }}
		</div>
		<div class="w-1/3 flex flex-row justify-end">
			<!-- 設定按鈕 -->
		</div>
	</div>
	<div class="w-full lg:w-[768px]">
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
		          name="progID"
		          label="程式ID*"
		          type="text"
		          help="請輸入程式ID"
		          validation="required"
		        />
		        <FormKit
		          name="progName"
		          label="程式名稱*"
		          type="text"
		          help="請輸入程式模組名稱"
		          validation="required"
		        />
		        <FormKit
		          name="LMName"
		          label="表單庫名稱*"
		          type="text"
		          help="請輸入表單庫名稱"
		          validation="required"
		        />
		        <FormKit
		          name="slink"
		          label="模組路徑*"
		          type="text"
		          help="請輸入模組路徑"
		          validation="required"
		        />
				<FormKit
		          name="authLimit"
		          label="程式權限下限*"
		          type="number"
		          min="1"
		          max="9"
		          help="請設定權限下限"
		          validation="required|between:0,9"
		        />	
		        <FormKit
		          name="ownerID"
		          label="所屬團隊*"
		          type="select"
		          help="請設定模組所屬團隊"
		          :options="liwaDetail1"
		        />		        		
		        <FormKit
		          name="exportPath"
		          label="匯出檔案路徑*"
		          type="select"
		          help="請選擇本模組的匯出檔案路徑"
		          :options="liwaDetail2"
		        />
		        <FormKit
		          name="lang"
		          label="語言"
		          type="text"
		          help="請輸入tw"
		        />
		        <FormKit
		          name="groupName"
		          label="表單庫圖示*"
		          type="select"
		          help="請設定表單庫圖示"
		          :options="['forms', 'config', 'reports', '自訂']"
		        />
				<div class="w-full h-[200px] mb-8">
					<img 
						class="mx-auto border-2 w-[200px] h-full"
						:src="iconSrc" 
						width="200" 
						@click="callDialog"
					/>	
					<p class="w-full text-center text-red-600 text-sm">自訂圖示: 請上傳 200 X 200 px照片</p>
				</div>		        
			</FormKit>
		</div>
	</div>
</div>	

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
<teleport to="body">
	<div v-if="isMsg" 
   		class="w-full h-[100vh] fixed top-0 left-0 bg-slate-100 z-[500]"
  	>
		<liwaMsg 
		  	v-if="isMsg"
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