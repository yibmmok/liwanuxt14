<script setup lang="ts">
	/*********************************************************
	prog name: 會員明細CRUD, author: James Lin, date: 2020/04/19

	**********************************************************/
	import { ref, reactive, onMounted, computed } from "vue"
	import { useFetch, createFetch, useTitle } from "@vueuse/core"
	import queryString from "query-string"
	import banner from "../../components/banner"
	import liwaMsg from "../../components/liwaMsg.vue"
	// import liwa2ColSelect from "../../components/liwa2ColSelect.vue"
	import liwaTbl from "../../components/liwaTbl.vue"
	import { IconPlusLg, IconFilePerson, IconGearFill, IconX } from '@iconify-prerendered/vue-bi'

	const mainID = ref('')
	const progName = ref('會員列表')
	const proglink = ref('/041')
	const detailFlg = ref(true)
	const detailName = ref('')
	const step = ref('基本資料')
	const stepNames = ['基本資料', '個人帳戶']

	const APIsvr = ref('')
	const liwaData = ref({})
	const stitle = ref('')
	const submitted = ref(false)
	const imgInput = ref(null)
	const isMsg = ref(false)
	const isConfig = ref(false)
	const isOffuser = ref(false)
	const offDateLimit = ref('')
	const offReason = ref('')
	const action = ref('view')
	const configParam = ref({})
	const arrBank = ref([])
	const sBankNM = ref('')
	
	const loadData = async () => {
		let keydata = {
			'JWT': window.localStorage.getItem('liwaJWT'),
			'mainID': mainID.value
		}
		let sQuery = queryString.stringify(keydata)		
		let url = `${APIsvr.value}/041_haveDetail.php?${sQuery}`
		const data = await useFetch(url, {method: 'GET'}, {refetch: true}).get().json()
		liwaData.value = data.data.value.arrSQL[0]
		liwaData.value.action = 'edit'
		liwaData.value.mainID = mainID.value
		sBankNM.value = liwaData.value.bankname
		offDateLimit.value = liwaData.value.offDateLimit
		detailName.value = liwaData.value.memberNM
		stitle.value = detailName.value + ' 的資料'
	}

	const loadBank = async () => {
		let keydata = {
			'JWT': window.localStorage.getItem('liwaJWT'),
			'zone':'tw'
		}
		let sQuery = queryString.stringify(keydata)		
		let url = `${APIsvr.value}/041_haveBanks.php?${sQuery}`
		const dataBank = await useFetch(url, {method: 'GET'}, {refetch: true}).get().json()
		arrBank.value = dataBank.data.value.arrSQL
		console.log('arrBank =', arrBank.value)
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
		let imgSvr = window.sessionStorage.getItem('liwaImgsvr')
		action.value = 'add'
		let tmpData = {
			'JWT': window.localStorage.getItem('liwaJWT'),
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
			'picpath': imgSvr + '/syspics/man-icon.png',
			'iconPath': imgSvr + '/syspics/man-icon.png',
			'scores':0,
			'grade':0,
			'bankID':'',
			'bankname':'',
			'branch':'',
			'acctName':'',
			'acctNo':'',
			'roles': '1',
			'iSites': 1,
			'iStatus': 0
		}
		detailName.value = '新增會員'
		stitle.value = '新增會員'
		liwaData.value = tmpData
	}

	const saveData = async () => {
		if (action.value == 'view') action.value = 'edit'
		liwaData.value.bankname = sBankNM.value
		liwaData.value.action = action.value
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
	    const { data } = await useMyFetch('041_edit.php').post().json()
	    if (!data.value.message) {
		    mainID.value = data.value.key
		    if (liwaData.value.action == 'add') {
		    	window.location.href = '/041/' + mainID.value
		    }
		    action.value = 'view'	
	    } else {
	    	showMsg('存檔錯誤', data.value.message, 1)
	    }
	}

	const setSuspend = async () => {
		//開啟
		isOffuser.value = true
	}

	const hideOffDialog = () => {
		isOffuser.value = false
	}

	const submitSuspend = async () => {
		// 設定會員停權, 由crontab 復權
		let keydata = {
			"JWT": window.localStorage.getItem('liwaJWT'),
			"mainID": mainID.value,
			"offDateLimit": offDateLimit.value,
			"offReason": offReason.value
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
	    const { data } = await useMyFetch('041_setOffDateLimit.php').post().json()		
	    if (!data.value.message) {
	    	isOffuser.value = false
	    	let sKey = data.value.key
	    	if (sKey) liwaData.value.roles = 1 
	    	else liwaData.value.roles = -1
	    	isOffuser.value = false
	    } else {
	    	isOffuser.value = false
	    	showMsg('設定失敗', data.value.message, 2)
	    }
	}

	const setDetail = (arrD3) => {
		console.log('arrD3 =', arrD3)
	}

	const sendMsg = (sMsg) => {
		showMsg('錯誤訊息', sMsg, 2)
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
		useHead({title:'會員明細'})
		APIsvr.value = window.sessionStorage.getItem('liwaAPIsvr')		
		// 取得 mainID, 由mainID取得
		const route = useRoute()
		loadBank()
		mainID.value = route.params.id
		// console.log('mainID=', mainID.value)
		//	由 mainID 取得資料
		if (mainID.value !== 'add') {
			loadData() 
		} else {
			clearData()
		}
		configParam.value = {"mainID":mainID.value}
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
			<div class="top-icon add -mt-1 pl-[0.125rem] pt-[0.125rem]" @click="setSuspend()">
				<IconFilePerson class="w-7 h-7 text-white font-bold"/>
			</div>
		</div>
		<div class="w-1/3 text-center">
			{{ stitle }}
		</div>
		<div class="w-1/3 flex flex-row justify-end">
			<!-- 設定按鈕 -->
			<div class="hidden top-icon add ml-4 -mt-1" @click="showConfig()">
				<IconGearFill class="w-7 h-7 text-white font-bold" />
			</div>	
		</div>
	</div>	
	<div v-if="detailName" class="w-full lg:w-[900px]">
		<ul class="w-full steps flex flex-row">
			<li
		    	v-for="stepName in stepNames"
		    	class="step w-1/2 text-center"
		    	@click="step = stepName"
		    	:data-step-active="step === stepName"
		    >
		    	{{ stepName }}
			</li>
		</ul>
		<section v-show="step == stepNames[0]">
			<div class="bg-white m-2 rounded-xl py-1">
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
						<div class="w-full h-[200px] mb-8 relative">
							<img 
								class="mx-auto border-2 w-[200px] h-full"
								:src="iconSrc" 
								width="200" 
								:alt="liwaData.nickname" 
								@click="callDialog"
							/>	
							<p class="w-full text-center text-red-600 text-sm">頭像: 請上傳 200 X 200 px照片</p>
							<div v-if="Number(liwaData.roles) == -1" class="w-full h-[200px] bg-transparent absolute top-4 left-0">
								<img
									class="mx-auto w-[200px] h-[200px]"
									src="//imgsvr.jewelrytrade.center/syspics/suspend.png"
									width="200"
								/>
							</div>
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
	<!-- 				<FormKit
				          name="nickNM"
				          label="暱稱*"
				          type="text"
				          placeholder="請設定暱稱"
				          help="可輸入中英文暱稱(字數限制100字)"
				          validation="required"
				        /> -->
				        <div class="w-full my-4">
				        	<div v-if="action == 'add'">
				        		<FormKit
				        			name="mobile"
				        			label="聯絡手機*"
				        			type="text"
				        			placeholder="請設定聯絡手機"
				        			help="手機格式範例:0910123456"
				        			validation="required"
				        		/>
				        	</div>
				        	<div v-else>
					        	<span class="mr-4 font-bold text-sm text-slate-700">聯絡手機</span>
					        	<span class="text-lg">{{ liwaData.mobile }}</span>
				        	</div>
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
				          label="Email *"
				          type="email"
				          help="請設定聯絡Email"
				          validation="required"
				        />	
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
						<div class="w-full text-sm">須完整填寫下表資料後才能開通賣家權限:</div>
						<div v-if="arrBank.length > 0" class="w-full relative">
					        <FormKit
					        	name="bankID"
					        	label="往來銀行 *"
					        	type="liwaCombo"
					        	:sVal="sBankNM"
					        	:arrOption="arrBank"
					        	validation="required"
					        />							
						</div>
<!-- 				        <FormKit
				        	name="bankname"
				        	label="往來銀行 *"
				        	type="text"
				        	validation="required"
				        />	 -->
				        <FormKit
				        	name="branch"
				        	label="所屬分行 *"
				        	type="text"
				        	validation="required"
				        />	
				        <FormKit
				        	name="acctName"
				        	label="銀行戶名 *"
				        	type="text"
				        	validation="required"
				        /> 
						<FormKit
				        	name="acctNo"
				        	label="銀行帳戶 *"
				        	type="text"
				        	validation="required"
				        />	
					</fieldset>
				</FormKit>
			</div>			
		</section>		
		<section v-show="step == stepNames[1]">
			<liwaTbl
				:tblTitle="'會員個人帳戶明細'"
				:progID="'041_Config'"
				:viewUrl="'041_D3edit.php'"
				:dataUrl="'041_D3edit.php'"
				:params="configParam"
				:canEdit="true"
				@setList="setDetail"
				@sendMsg="sendMsg"		
			/>			
		</section>
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
			<div class="w-full h-full bg-transparent relative">
				<div class="md:w-[800px] mx-auto mt-[200px] lg:mt-[130px] bg-white relative">
					<div class="w-8 h-8 absolute top-2 right-2 bg-red-600 rounded-full z-50" @click="hideConfig()">
						<IconX class="w-8 h-8 text-white font-bold" />
					</div>
				</div>
			</div>
		</div>
	</Teleport>
	<Teleport to="body">
		<div v-if="isOffuser"
			class="w-[100vw] h-[100vh] absolute top-[200px] lg:top-[130px] left-0 bg-transparent z-[500]"
		>
			<div class="w-full h-full bg-transparent relative">				
				<div class="sm:m-full md:w-[600px] mx-auto mt-[200px] lg:mt-[130px] box-content bg-gray-100 border-2 border-gray-400 relative">
					<div class="w-full py-2 bg-gray-700 text-white text-center">設定會員停權作業</div>
					<div class="w-full h-[50vh] flex flex-col p-12">
						<div class="w-full py-2">
							<FormKit
								label="停權結束日*"
								type="datetime-local"
								v-model="offDateLimit"
								help="請設定本使用者的停權結束日, 如要取消停權, 請設定為今日以前的日期"
								validation="required"
							/>					
						</div>
						<div class="w-full py-2 min-h-[240px]">
							<FormKit
								label="停權原因*"
								type="textarea"
								v-model="offReason"
								help="請輸入停權原因"
								validation="required"
							/>								
						</div>
						<div class="w-full py-2 flex flex-row">
							<div class="px-4 py-2 mr-4 bg-blue-500 text-white rounded-lg" @click="submitSuspend()">設定</div>
							<div class="p-2 bg-transparent rounded-full" @click="hideOffDialog()">
								<IconX class="w-8 h-8 text-red-600 font-bold" />
							</div>	
						</div>
					</div>
				</div>
			</div>		
		</div>
	</Teleport>	
</NuxtLayout>	
</template>

<style scope>
	.formkit-option {
		width:50%;
		float:left;
	}
</style>