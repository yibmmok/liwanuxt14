<script setup lang="ts">
	/*********************************************************
	prog name: 關於我, author: James Lin, date: 2022/08/10
	主功能: 變更使用者profile, 重設密碼, 

	**********************************************************/	
	import { ref, reactive, onMounted } from "vue"
	import { useStorage, useFetch, createFetch } from "@vueuse/core"
	import queryString from "query-string"
	import TinyMceEditor from "@tinymce/tinymce-vue"

	const debug = ref(1)
	const mainID = ref('')
	const step = ref('A01')
	const liwaData = ref([])
	const liwa004 = ref([])
	const APIsvr = ref('')
	const submitted = ref(false)
	const submitted2 = ref(false)
	const newpass1 = ref('')
	//圖檔處理變數
	const imgInput = ref(null)
	const imgInput2 = ref(null)
	const gender1 = ref('')	
	//個人簡介變數
	const sContent = ref('')
	const liwaEditor = ref(null)
	const isEditor = ref(true)
	const isMsg = ref(false)

	const setActive = (sID) => {
		let sGroup = sID.substr(0, 1)
		step.value = sID
	}

	// 圖檔處理 starts
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

	const iconSrc = computed(() => {
		let AA = ''
		if (liwaData.value.picpath !== undefined) {
			let iconHead = liwaData.value.picpath.substr(0, 5)
			if (iconHead !== 'data:') {
				// 使用者未變更圖檔
				if (iconHead !== '/sysp') {
					// 圖檔先前已變更, 存在imgSvr內
					AA = window.sessionStorage.getItem('liwaImgsvr') + liwaData.value.picpath
				} else {
					// 圖檔為預設
					AA = (liwaData.value.gender == '先生') ? window.sessionStorage.getItem('liwaImgsvr') + '/syspics/man-icon.png': window.sessionStorage.getItem('liwaImgsvr') + '/syspics/woman-icon.png'	
				}
				// liwaData.value.picpath = AA
			} else {
				// 使用者已變更 icon, iconSrc設為已變更的圖檔(data:)
				AA = liwaData.value.picpath
			}
		}
		return AA
	})
	// 圖檔處理 ends

	// liwaEditor starts
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
				imgInput2.value.addEventListener('change', (e) => {
					const file = e.target.files[0]
					const reader = new FileReader()
					reader.onload = (e) => {
						callback(e.target.result, { alt: ''})
					}
					reader.readAsDataURL(file)
				})
				imgInput2.value.click()
			}
		},
	})
	// liwaEditor ends

	const loadData = async () => {
		let keydata = {
			'JWT': window.localStorage.getItem('liwaJWT')
		}
		let sQuery = queryString.stringify(keydata)		
		let url = `${APIsvr.value}/A04_haveDetail.php?${sQuery}`
		const data = await useFetch(url, {method: 'GET'}, {refetch: true}).get().json()
		liwaData.value = data.data.value.arrSQL[0]
		liwaData.value.action = 'edit'
		liwaData.value.mainID = liwaData.value.userID
		sContent.value = liwaData.value.userBrief
	}	

	const loadData004 = async () => {
		let keydata = {
			'JWT': window.localStorage.getItem('liwaJWT')
		}
		let sQuery = queryString.stringify(keydata)		
		let url = `${APIsvr.value}/Profile_haveSites.php?${sQuery}`
		const data004 = await useFetch(url, {method: 'GET'}, {refetch: true}).get().json()
		liwa004.value = data004.data.value.arrSQL

	}

	const saveData = async () => {
		//  若 iconSrc.substr(0, 5)=='', liwaData.value.picpath = iconSrc
		let picHead = iconSrc.value.substr(0, 5)
		if (picHead == 'data:') liwaData.value.picpath = iconSrc.value
		if (sContent.value) {
			liwaData.value.userBrief = sContent.value
		}
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
	    const { data } = await useMyFetch('A04_edit.php').post().json()
	 	let msg = data.value.message
	 	if (msg) {
	 		showMsg('系統訊息 - 存檔錯誤', msg, 2)
	 	} else {
	 		let sKey = data.value.key
	 		console.log('sKey =', sKey)
	 		if (sKey) {
	 			window.localStorage.setItem('liwaJWT', sKey)
	 			window.location.href = '/Profile'
	 		}
	 	}
	}	

	const resetPSWD = async () => {
		let passData = { 
			"JWT": window.localStorage.getItem('liwaJWT'),
			"usermail": liwaData.value.usermail,
			"pswd": newpass1.value 
		}
		let datastr = JSON.stringify(passData)
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
	    const { data } = await useMyFetch('sys_resetPSWD.php').post().json()
	    let msg = data.value.message
	    if (msg) {
	    	showMsg('系統訊息', '密碼重設錯誤 -'+msg, 2)
	    } else {
	    	let sKey = data.value.key
	    	showMsg('系統訊息', sKey, 2)
	    }
	}

	const setA03 = async (idx) => {
		// 先取得 siteID
		let nuSiteID = liwa004.value[idx].siteID
		let keydata = {
			'JWT':window.localStorage.getItem('liwaJWT'),
			'siteID': nuSiteID
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
		const { data } = await useMyFetch('sys_setSiteID.php').post().json()
		let sKey = data.value.key
		window.localStorage.setItem('liwaJWT', sKey)
		window.location.href=`/A03`
	}

	// 訊息對話盒相關 starts
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
	// 設定對話盒相關 ends

	onMounted(() => {
		useHead({title:'我的管理中心'})
		APIsvr.value = window.sessionStorage.getItem('liwaAPIsvr')
		loadData()
		loadData004()
	})
</script>

<template>
<NuxtLayout name="default">	
	<div class="w-full bg-slate-200 px-4 py-2">
		<div class="w-full flex flex-row justify-start">
			<div class="w-full lg:w-[320px] p-2 border-[0.125rem] border-slate-400">
				<div class="actItem">我的雲系統<div class="btnGT" @click="setActive('A01')">&gt;</div></div>
				<div class="actItem">基本資料設定<div class="btnGT" @click="setActive('A02')">&gt;</div></div>
				<div class="actItem mb-4">變更密碼<div class="btnGT" @click="setActive('A03')">&gt;</div></div>
			</div>
			<div class="hidden lg:block w-[calc(100vw_-_350px)] min-h-[calc(100vh_-_130px)] ml-4 border-[0.125rem] border-slate-300 bg-gray-100">
				<section v-show="step=='A01'">
					<div class="w-full py-2 text-lg text-center text-white bg-slate-800">已加入的雲系統列表</div>
					<div class="w-full min-h-[380px] bg-white border-2 border-slate-300 overflow-x-hidden overflow-y-auto">
						<div v-for="(object, index) in liwa004" class="w-full py-2 px-8 border-y-2 border-y-dashed border-y-slate-400 flex flex-row cursor-pointer" @click="setA03(index)">
							<img :src="object.logoPic" width="48" />
							<div class="px-4 py-2 text-slate-800">{{ object.compName }}</div>					
						</div>				
					</div>
				</section>
				<section v-show="step=='A02'">
					<div class="w-full h-full mx-auto my-0 lg:max-w-[1024px] bg-white">
						<div class="w-full bg-white mx-auto my-2 rounded-xl pb-1">
							<FormKit 
							form-class="px-4 py-2 bg-gray-200 rounded-2xl w-full"
							type="form"
							v-model="liwaData"
							:form-class="submitted? 'hidden': 'block'"
							style="margin: 1rem auto;"
							submit-label="存檔"
							@submit="saveData()"
							>
								<div class="w-full h-[200px] mb-8">
									<img 
										class="mx-auto border-2 w-[200px] h-full"
										:src="iconSrc" 
										width="200" 
										:alt="liwaData.username" 
										@click="callDialog"
									/>	
									<p class="w-full max-w-full text-center text-red-600 text-sm">頭像: 請上傳 200 X 200 px照片</p>
								</div>
								<div class="w-full flex flex-col lg:flex-row">
									<div class="w-full lg:w-1/2">
										<FormKit
								          name="username"
								          label="姓名*"
								          type="text"
								          placeholder="請輸入姓名"
								          help="可輸入中英文名字(字數限制100字)"
								          validation="required"
								        />							
									</div>
									<div class="w-full lg:w-1/2 ml-8 mt-8">
										<span>{{ liwaData.gender }}</span>
									</div>				
								</div>
						        <FormKit
						          name="nickname"
						          label="暱稱*"
						          type="text"
						          placeholder="請設定暱稱"
						          help="可輸入中英文名字(字數限制100字)"
						          validation="required"
						        />
						        <div class="w-full my-4">
						        	<span class="mr-4 font-bold text-sm text-slate-700">所屬群組</span>
						        	<span class="text-lg">{{ liwaData.uGroupName }}</span>
						        </div>
						        <FormKit
						          name="usermail"
						          label="Email*"
						          type="email"
						          help="請設定Email"
						          validation="required|email"
						        />
						        <FormKit
						          name="birthday"
						          label="生日"
						          type="date"
						          min="1960-01-01"
						          help="請輸入生日日期"
						        />
						        <FormKit
						          name="mobile*"
						          label="手機"
						          type="tel"
						          placeholder="xxxx-xxxxxx"
						          help="手機格式範例:0912-123456"
						          validation="matches:/^[0-9]{4}-[0-9]{6}$/"
						        />	
						        <div class="w-full my-4">
						        	<span class="mr-4 font-bold text-sm text-slate-700">會員資格</span>
						        	<span class="text-lg">{{ liwaData.roles }}</span>
						        </div>
								<div class="w-full h-[450px]">
									<div class="w-full h-8 text-sm font-bold text-slate-800">個人簡介</div>
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

				</section>
				<section v-show="step=='A03'">
					<div class="w-full lg:w-[768px] h-[82vh] mx-auto my-1 bg-white px-4 py-2">
						<FormKit 
					        form-class="px-4 py-2 bg-yellow-200 rounded-2xl w-11/12"
					        type="form"
					        :form-class="submitted2? 'hidden': 'block'"
					        style="margin: 1rem auto;"
					        submit-label="存檔"
					        @submit="resetPSWD"
					    >		    
					        <FormKit
					          name="newpass"
					          label="密碼"
					          type="password"
					          help="請輸入密碼, 必須8字元以上, 必須含英文大小寫字元及數字"
					          validation="required|alphanumeric:latin|length:8"
					          :validation-messages="{
					            length: '密碼長度必須8字元以上',
					          }"
					          v-model="newpass1"
					        />
					        <FormKit
					          name="newpass_confirm"
					          label="密碼確認"
					          type="password"
					          help="確認密碼"
					          validation="required|confirm"
					          validation-visibility="live"
					        />
						</FormKit>
					</div>
				</section>				
			</div>			
		</div>		
	</div>

	<div class="invisible">
		<input 
			ref="imgInput" 
			class="w-11/12 h-8 bg-grey-100 hidden" 
			type="file" 
			accept="image/*" 
			@change.stop="handleImage"
		/>		
	</div>	
	<div class="invisible">
		<input 
			ref="imgInput2" 
			class="w-11/12 h-8 bg-grey-100 hidden" 
			type="file" 
			accept="image/*" 
		/>		
	</div>
	<Teleport to="body">
		<div
			v-if="isMsg" 
			class="w-full h-[150vh] absolute top-[100px] left-0 bg-slate-100 z-[500]"
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
	.formkit-option {
		width:50%;
		float:left;
	}

	.actItem {
		max-width:300px;
		line-height:4rem;
		border:1px solid #888;
		padding-left:1rem;
		position:relative;
		background-color: white;
	}

	.btnGT {
		width:3rem;
		height:3rem;
		position:absolute;
		top: 0rem;
		right:0px;
		text-align:center;
		font-size:1.5rem;
		cursor:pointer;
	}
</style>