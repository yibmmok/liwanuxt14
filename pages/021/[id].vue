<script setup lang="ts">
	/*********************************************************
	prog name: 物件明細CRUD, author: James Lin, date: 2020/04/19

	**********************************************************/
	import { ref, reactive, onMounted, computed } from "vue"
	import { useFetch, createFetch, useTitle } from "@vueuse/core"
	import banner from "../../components/banner"
	import liwaMsg from "../../components/liwaMsg.vue"
	import liwaUpload from "../../components/liwaUpload"
	import liwaScore from "../../components/liwaScore"
	import TinyMceEditor from "@tinymce/tinymce-vue"
	import { IconPlusLg, IconAirplane } from '@iconify-prerendered/vue-bi'
	import gemSysData from "../../static/gemSys.json"

	const mainID = ref('')
	const progName = ref('物件列表')
	const proglink = ref('/021')
	const detailFlg = ref(true)
	const detailName = ref('')
	const siteID = ref('')
	const liwaData = ref({})
	const liwaD5 = ref([])
	const liwaD6 = ref([])
	const liwaPics = ref([])
	const liwaPDF = ref([])
	const action = ref('view')
	const stitle = ref('')
	const submitted = ref(false)
	const step = ref('基本資料')
	const stepNames = ['基本資料', '設定評分', '上傳附圖及證書']
	const sGemSys = ref('鑽石')
	const arrGemSys = ref([])
	const arrGemType = ref([])
	const arrOrigin = ref([])
	const arrStatus = ref([{'label':'上架', 'value':1}, {'label':'下架', 'value':0}, {'label':'斡旋', 'value':2}, {'label':'成交', 'value':9}
	])
	const imgInput = ref(null)
	const isMsg = ref(false)
	const isConfig = ref(false)		

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
		let url= window.sessionStorage.getItem('liwaAPIsvr') + "/021_haveDetail.php?siteID="+siteID.value+"&mainID=" + mainID.value
		const data = await useFetch(url, {method: 'GET'}, {refetch: true}).get().json()
		liwaData.value = data.data.value.arrSQL[0]
		liwaData.value.action = 'view'
		liwaData.value.mainID = mainID.value
		liwaData.value.siteID = window.sessionStorage.getItem('liwaSiteID')
		liwaData.value.userID = window.sessionStorage.getItem('liwaUserID')
		liwaData.value.makerName = window.sessionStorage.getItem('liwaUserName')
		sGemType.value = liwaData.value.gemType
		detailName.value = liwaData.value.prodNM
		stitle.value = detailName.value + ' 的資料'
	}

	const loadD3 = async () => {
		let url= window.sessionStorage.getItem('liwaAPIsvr') + "/021_haveD3.php?siteID="+siteID.value+"&mainID=" + mainID.value
		const dataD3 = await useFetch(url, {method: 'GET'}, {refetch: true}).get().json()
		liwaPics.value = dataD3.data.value.arrSQL
	}

	const loadD4 = async () => {
		let url= window.sessionStorage.getItem('liwaAPIsvr') + "/021_haveD4.php?siteID="+siteID.value+"&mainID=" + mainID.value	
		const dataD4 = await useFetch(url, {method: 'GET'}, {refetch: true}).get().json()	
		liwaPDF.value = dataD4.data.value.arrSQL	
	}	

	const loadD5 = async () => {
		let url= window.sessionStorage.getItem('liwaAPIsvr') + "/021_haveD5.php?siteID="+siteID.value	
		const dataD5 = await useFetch(url, {method: 'GET'}, {refetch: true}).get().json()	
		liwaD5.value = dataD5.data.value.arrSQL
		arrOrigin.value = [...liwaD5.value]
	}	

	const loadD6 = async () => {
		let url= window.sessionStorage.getItem('liwaAPIsvr') + "/021_haveGemType.php?siteID="+siteID.value
		const dataD6 = await useFetch(url, {method: 'GET'}, {refetch: true}).get().json()	
		liwaD6.value = dataD6.data.value.arrSQL
		arrGemType.value = [...liwaD6.value]
	}	

	const jumpAdd = () => {
		window.location.href = '/021/add'
	}

	const clearData = () => {
		let tmpData = {
			'action':'add',
			'siteID': window.sessionStorage.getItem('liwaSiteID'),
			'userID': window.sessionStorage.getItem('liwaUserID'),
			'makerName':window.sessionStorage.getItem('liwaUserName'),
			'mainID': '',
			'prodNM': '',
			'origin': '',
			'dealType': '',
			'color': '',
			'gemSys': 'A',
			'gemTypeID': '',
			'gemType': '',
			'material': '',
			'objForm': '',
			'sellPrice': 0,
			'expDate': '',
			'descp': '',
			'certiMemo': '',
			'score': 0,
			'status': 1,
			'sellerID':'',
			'D3':liwaPics,
			'D4':liwaPDF
		}
		action.value = 'add'
		detailName.value = '新增物件'
		stitle.value = '新增物件'
		liwaData.value = tmpData
	}

	const setScore = (state) => {
		liwaData.value.gemSys = state.gemSys
		liwaData.value.score = state.iTotal
		console.log('liwaData =', liwaData.value)
	}

	const saveData = async () => {
		let datastr = JSON.stringify(liwaData.value)
	console.log('datastr =', datastr)
/*	
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
	    const { data } = await useMyFetch('021_edit.php').post().json()
	    if (!data.value.message) {
		    mainID.value = data.value.key
		    if (liwaData.value.action == 'add') {
		    	window.location.href = '/021/' + mainID.value
		    }
		    liwaData.value.action = 'view'	
	    } else {
	    	showMsg('存檔錯誤', data.value.message, 1)
	    }
*/	    
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

	const sGemType = computed(() => {
		let AA = ''
		if (liwaD6.value.length > 0) {
			let sID = liwaData.value.gemTypeID
			let res = liwaD6.value.filter((n) => n.value == sID)
			if (res.length > 0) {
				AA = res[0].label
			}
		}
		return AA
	})

	const sNuProdNM = computed(() => {
		let AA = ''
		
		AA = liwaData.value.origin + liwaData.value.dealType + liwaData.value.color + sGemType.value + liwaData.value.material + liwaData.value.objForm	
		// AA = liwaData.value.Step1.origin + liwaData.value.Step1.dealType + liwaData.value.Step1.color + sGemType.value + liwaData.value.Step1.material + liwaData.value.Step1.objForm			
		console.log('sNuProdNM =', AA)
		return AA
	})

	// 訊息對話盒及設定對話盒相關 ends

	const iStatus = computed(() => {
		let AA = '';
		switch (liwaData.value.status) {
			case 0:
				AA = '下架'
				break
			case 1:
				AA = '上架'
				break
			case 2:
				AA = '斡旋'
				break
			case 9:
				AA = '成交'
				break									
		}
		return AA
	})

	const setFiles = (arrFiles) => {
		if (liwaPics.value.length > 0) {
			// 先刪除 liwaPics 的所有elements
			for (let i=0; i<liwaPics.value.length; i++) {
				liwaPics.value.pop()
			}
		}
		liwaPics.value = [...arrFiles]
	}	

	const setPDFs = (arrFiles) => {
		if (liwaPDF.value.length > 0) {
			// 先刪除 liwaPics 的所有elements
			for (let i=0; i<liwaPDF.value.length; i++) {
				liwaPDF.value.pop()
			}
		}
		liwaPDF.value = [...arrFiles]
	}	

	const camel2title = (str) => str
	  .replace(/([A-Z])/g, (match) => ` ${match}`)
	  .replace(/^./, (match) => match.toUpperCase())
	  .trim()	

	const testProc = () => {
		console.log('liwaData =', liwaData.value, ';sNuProdNM', sNuProdNM)

	}

	onMounted(() => {
		siteID.value = window.sessionStorage.getItem('liwaSiteID')
    	let compName = window.sessionStorage.getItem('liwaSiteName')
    	const title = useTitle(compName+`- 物件明細`)
		// 取得 mainID, 由mainID取得
		const route = useRoute()
		mainID.value = route.params.id
		//	由 mainID 取得資料
		if (mainID.value !== 'add') {
			loadData() 
			loadD3()
			loadD4()
			
		} else {
			clearData()
		}
		loadD5()
		loadD6()
		arrGemSys.value = gemSysData
	})

	definePageMeta({
	  title: '物件明細',
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
<div class="w-full h-full flex flex-col justify-center items-center bg-slate-200">
	<div class="barPanel w-[95%] h-12 rounded-3xl mt-2 ml-4 mb-2 px-1 flex flex-row justify-between">
		<div class="w-1/3 flex flex-row">
			<div class="top-icon add ml-4 -mt-1" @click="jumpAdd()">
				<IconPlusLg class="w-7 h-7 text-white font-bold" />
			</div>
			<div class="top-icon add ml-4 -mt-1" @click="testProc()">
				<IconAirplane class="w-7 h-7 text-white font-bold" />
			</div>			
		</div>
		<div class="w-1/3 text-center">
			{{ stitle }}
		</div>
		<div class="w-1/3 flex flex-row justify-end">
			<!-- 設定按鈕 -->

		</div>
	</div>
	<div class="w-full lg:w-[1024px]">
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
				<ul class="steps">
					<li
				    	v-for="stepName in stepNames"
				    	class="step"
				    	@click="step = stepName"
				    	:data-step-active="step === stepName"
				    >
				    	{{ stepName }}
					</li>
				</ul>
				<div class="form-body">
					<section v-show="step == '基本資料'">
						<div v-if="action !== 'add'" class="w-full h-12 text-md">
							物件編號: {{ liwaData.prodID }}
						</div>	
						<div class="w-full flex flex-col lg:flex-row">
							<div class="w-full lg:w-1/2">
						        <FormKit
						          name="sellerID"
						          label="賣家ID *"
						          type="text"
						          help="請設定賣家ID"
						          validation="required|number"
						        />
							</div>
							<div class="w-full lg:w-1/2 lg:ml-8">
								<FormKit
						          name="sellPrice"
						          label="賣家期望價 *"
						          type="number"
						          placeholder="請輸入賣家期望價"
						          help="賣家期望價(必須大於0)"
						          validation="required|number|min:1"
						        />									
							</div>				
						</div>	
						<div class="w-full flex flex-col lg:flex-row">
							<div class="w-full lg:w-1/2">
						        <FormKit
						          name="status"
						          label="物件狀態 *"
						          type="select"
						          help="請選擇物件狀態"
						          :options="arrStatus"
						          validation="required"
						        />
							</div>
							<div class="w-full lg:w-1/2 lg:ml-8">
						        <FormKit
						          name="expDate"
						          label="刊登到期日 *"
						          type="date"
						          min="1960-01-01"
						          help="請輸入物件刊登到期日"
						          validation="required"
						        />							        
							</div>				
						</div>
						<hr class="w-full h-[0.1px] border-b-[0.1px] border-gray-400 border-dotted my-3">
						<div class="w-full flex flex-col lg:flex-row">
							<div v-if="arrOrigin.length > 0" class="w-full lg:w-1/2 relative">
								<FormKit
						          name="origin"
						          label="產地"
						          type="liwaDrop"
						          help="請選擇物件的產地"
						          :sVal="''"
						          :arrOption="arrOrigin"
						        />
							</div>
							<div class="w-full lg:w-1/2 lg:ml-8">
						        <FormKit
						          name="dealType"
						          label="處理方式"
						          type="text"
						          help="請輸入物件的處理方式"
						        />
							</div>				
						</div>
						<div class="w-full flex flex-col lg:flex-row">
							<div class="w-full lg:w-1/2">
								<FormKit
						          name="color"
						          label="顏色"
						          type="text"
						          help="請輸入物件顏色"
						        />
							</div>
							<div v-if="arrGemType.length > 0" class="w-full lg:w-1/2 lg:ml-8 relative">
						        <FormKit
						          name="gemTypeID"
						          label="主要種類"
						          type="liwaCombo"
						          help="請選擇物件主要種類, 可於本欄輸入關鍵字縮小下拉列表選項"
						          :sVal="sGemType"
						          :arrOption="arrGemType"
						        />
							</div>				
						</div>	
						<div class="w-full flex flex-col lg:flex-row">
							<div class="w-full lg:w-1/2">
								<FormKit
						          name="material"
						          label="材質"
						          type="text"
						          placeholder="請輸入材質"
						          help="請輸入物件材質(如k金)"
						        />
							</div>
							<div class="w-full lg:w-1/2 lg:ml-8">
						        <FormKit
						          name="objForm"
						          label="物件形式"
						          type="text"
						          placeholder="請輸入物件形式"
						          help="請輸入物件形式(如手鐲)"
						        />
							</div>				
						</div>	
						<FormKit
				          name="prodNM"
				          label="物件名稱*"
				          type="text"
				          v-model="sNuProdNM"
				          help="預設為系統自動產生, 亦可以於本欄修改"
				          validation="required"
				        />
						<hr class="w-full h-[0.1px] border-b-[0.1px] border-gray-400 border-dotted my-3">
						<div class="w-full h-[450px]">
							<div class="w-full h-8 text-sm font-bold text-slate-800">物件說明</div>
							<div class="w-full h-full">
								<TinyMceEditor api-key="fkoaqldrjeuygn6wbe51uchydhzrhufgs8a9tt6yehn106uo" 
								:init="InitVal"
								ref="liwaEditor"
								v-model="sContent"
								/>
							</div>
						</div>  							
				        <FormKit
				          name="certiMemo"
				          label="鑑定師意見 *"
				          type="textarea"
				          help="請輸入鑑定師意見"
				          validation="required"
				        />
					</section>
					<section v-show="step == '設定評分'">
						<div class="w-full my-4">
							<!-- 設定物件評分 -->
							<h2>設定評分</h2>
							<liwaScore 
								@setScore="setScore"
							/>						
						</div>						
					</section>
					<section v-show="step == '上傳附圖及證書'">
						<div class="w-full my-8">
							<liwaUpload 
								:mainID="mainID" 
								:liwaFiles="liwaPics"
								:imgboxCSS="'h-96'"
								:fieldLabel="'上傳附圖'"
								:phpurl="'/testUpload.php'"
								:sAccept="'image/*'"
								@setFiles="setFiles"
							/>					
						</div>
						<div class="w-full mb-4">
							<liwaUpload 
								:mainID="mainID" 
								:liwaFiles="liwaPDF"
								:imgboxCSS="'h-96'"
								:fieldLabel="'上傳證書'"
								:phpurl="'/testUpload.php'"
								:sAccept="'.pdf'"
								@setFiles="setPDFs"
							/>					
						</div>
					</section>				
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
	<liwaMsg 
	  	v-if="isMsg"
	  	:msgTitle="objMsg.title"
	  	:msgBody="objMsg.body"
	  	:modalType="objMsg.modalType"
	  	@hideMsg="hideMsg"
	  	@confirmOK="confirmOK"
	/>  
	<liwaConfig
	  	v-if="isConfig"
	  	@hideConfig="hideConfig"
	/>		
</template>

<style scope>
	@import "../../assets/css/multistep-form.css";

	.formkit-option {
		width:50%;
		float:left;
	}
</style>