<script setup lang="ts">
	/*********************************************************
	prog name: 會員明細CRUD, author: James Lin, date: 2020/04/19

	**********************************************************/
	import { ref, reactive, onMounted, computed } from "vue"
	import { useFetch, createFetch, useTitle } from "@vueuse/core"
	import banner from "../../components/banner"
	import liwaMsg from "../../components/liwaMsg.vue"
	import { IconPlusLg, IconFilePerson } from '@iconify-prerendered/vue-bi'

	const mainID = ref('')
	const progName = ref('會員列表')
	const proglink = ref('/041')
	const detailFlg = ref(true)
	const detailName = ref('')
	const siteID = ref('')
	const liwaData = ref({})
	const stitle = ref('')
	const submitted = ref(false)
	const imgInput = ref(null)
	const isMsg = ref(false)
	const isConfig = ref(false)	

	const loadData = async () => {
		let url= window.sessionStorage.getItem('liwaAPIsvr') + "/041_haveDetail.php?siteID="+siteID.value+"&mainID=" + mainID.value
		const data = await useFetch(url, {method: 'GET'}, {refetch: true}).get().json()
		liwaData.value = data.data.value.arrSQL[0]
		liwaData.value.action = 'edit'
		liwaData.value.mainID = mainID.value
		liwaData.value.siteID = window.sessionStorage.getItem('liwaSiteID')
		liwaData.value.userID = window.sessionStorage.getItem('liwaUserID')
		liwaData.value.makerName = window.sessionStorage.getItem('liwaUserName')
		detailName.value = liwaData.value.memberNM
		stitle.value = detailName.value + ' 的資料'
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
		window.location.href = '/041/add'
	}

	const clearData = () => {
		let tmpData = {
			'action':'add',
			'siteID': window.sessionStorage.getItem('liwaSiteID'),
			'userID': window.sessionStorage.getItem('liwaUserID'),
			'makerName':window.sessionStorage.getItem('liwaUserName'),
			'mainID': '',
			'username': '',
			'nickname': '',
			'gender': '先生',
			'uGroupID': '',
			'uGroupName': '',
			'iAuth': 1,
			'isTop': 0,
			'usermail': '',
			'birthday': '',
			'zip': '',
			'addr': '',
			'phone': '',
			'mobile': '',
			'originSiteID': window.sessionStorage.getItem('liwaSiteID'),
			'picpath': '../static/man-icon.png',
			'iconPath': '../static/man-icon.png',
			'roles': '正式成員',
			'iSites': 0,
			'iStatus': 0
		}
		detailName.value = '新增會員'
		stitle.value = '新增會員'
		liwaData.value = tmpData
	}

	const saveData = async () => {
		let datastr = JSON.stringify(liwaData.value)
	// console.log('datastr =', datastr)
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
	    const { data } = await useMyFetch('041_edit.php').post().json()
	    if (!data.value.message) {
		    mainID.value = data.value.key
		    if (liwaData.value.action == 'add') {
		    	window.location.href = '/041/' + mainID.value
		    }
		    liwaData.value.action = 'view'	
	    } else {
	    	showMsg('存檔錯誤', data.value.message, 1)
	    }
	}

	const setSuspend = () => {
		liwaData.value.roles = -1
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
		let iconHead = liwaData.value.picpath.substr(0, 5)
		let AA = liwaData.value.picpath
		if (iconHead !== 'data:') {
			AA = (liwaData.value.gender == '先生') ? window.sessionStorage.getItem('liwaImgsvr') + '/syspics/man-icon.png': window.sessionStorage.getItem('liwaImgsvr') + '/syspics/woman-icon.png'
			liwaData.value.picpath = AA
		}
		return AA
	})

	// 訊息對話盒及設定對話盒相關 ends

	const memberRole = computed(() => {
		return (liwaData.value.roles == 1)? '正式會員':'停權會員'
	})

	onMounted(() => {
		siteID.value = window.sessionStorage.getItem('liwaSiteID')
    	let compName = window.sessionStorage.getItem('liwaSiteName')
    	const title = useTitle(compName+`- 會員明細`)
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

	definePageMeta({
	  title: '會員明細',
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
			<div class="top-icon add -mt-1 pl-[0.125rem] pt-[0.125rem]" @click="setSuspend()">
				<IconFilePerson class="w-7 h-7 text-white font-bold"/>
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
				<fieldset class="border-[1px] border-slate-500 rounded-lg p-2 mb-4">
					<legend>基本設定</legend>
					<div class="w-full h-[200px] mb-8">
						<img 
							class="mx-auto border-2 w-[200px] h-full"
							:src="iconSrc" 
							width="200" 
							:alt="liwaData.nickname" 
							@click="callDialog"
						/>	
						<p class="w-full text-center text-red-600 text-sm">頭像: 請上傳 200 X 200 px照片</p>
					</div>
					<div class="w-full flex flex-col lg:flex-row">
						<div class="w-full lg:w-1/2">
							<FormKit
					          name="memberNM"
					          label="姓名*"
					          type="text"
					          placeholder="請輸入姓名"
					          help="可輸入中英文名字(字數限制100字)"
					          validation="required"
					        />							
						</div>
						<div class="w-full lg:w-1/2 ml-8 mt-2">
					        <FormKit
					          name="gender"
					          label="稱謂"
					          type="radio"
					          :options="['先生', '小姐']"
					          help="請選擇性別"
					        />
						</div>				
					</div>
<!-- 					        <FormKit
			          name="nickNM"
			          label="暱稱*"
			          type="text"
			          placeholder="請設定暱稱"
			          help="可輸入中英文暱稱(字數限制100字)"
			          validation="required"
			        /> -->
			        <div class="w-full my-4">
			        	<span class="mr-4 font-bold text-sm text-slate-700">聯絡手機</span>
			        	<span class="text-lg">{{ liwaData.mobile }}</span>
			        </div>
			        <div class="w-full my-4">
			        	<span class="mr-4 font-bold text-sm text-slate-700">會員類別</span>
			        	<span class="text-lg">{{ memberRole }}</span>
			        </div>			        
			        <FormKit
			          name="birthday"
			          label="生日/公司設定日*"
			          type="date"
			          min="1960-01-01"
			          help="請輸入生日/公司設定日期"
			          validation="required"
			        />
			        <FormKit
			          name="memberMail"
			          label="Email"
			          type="email"
			          help="請設定聯絡Email"
			        />							
				</fieldset>
				<fieldset class="border-[1px] border-slate-500 rounded-lg p-2 mb-4">
					<legend>買家設定</legend>
		        	<FormKit
			          name="uniqID"
			          label="身份證字號/統一編號*"
			          type="text"
			          help="請設定身份證字號/統一編號"
			          validation="required"
			        />
			        <div class="flex flex-col lg:flex-row justify-start lg:justify-between">
			        	<div class="w-full lg:w-16">
					        <FormKit
					        	name="zip"
					        	label="郵遞區號"
					        	type="text"
					        />		        		
			        	</div>
				        <div class="w-full lg:w-[calc(100%_-_4rem)]">
					        <FormKit
					        	name="addr"
					        	label="地址"
					        	type="text"
					        />				        	
				        </div>       	
			        </div>
			        <div class="w-full text-sm font-bold mt-2">
				        <FormKit
				        	name="scores"
				        	label="會員積分"
				        	type="number"
				        	validation="number"
				        />	
					</div>
			        <div class="w-full text-sm font-bold mt-2">
				        <FormKit
				        	name="grade"
				        	label="會員等級"
				        	type="number"
				        	validation="number|between:0,8"
				        />	
					</div>		
				</fieldset>
				<fieldset class="border-[1px] border-slate-500 rounded-lg p-2 mb-4">
					<legend>賣家設定</legend>
					<div class="w-full text-sm">須完整填寫下表資料後才能開通賣家權限:</div>
			        <FormKit
			        	name="bankID"
			        	label="銀行代碼"
			        	type="text"
			        />	
			        <FormKit
			        	name="bankname"
			        	label="往來銀行"
			        	type="text"
			        />	
			        <FormKit
			        	name="branch"
			        	label="所屬分行"
			        	type="text"
			        />	
			        <FormKit
			        	name="acctName"
			        	label="銀行戶名"
			        	type="text"
			        /> 
					<FormKit
			        	name="acctNo"
			        	label="銀行帳戶"
			        	type="text"
			        />	
				</fieldset>
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
	.formkit-option {
		width:50%;
		float:left;
	}
</style>