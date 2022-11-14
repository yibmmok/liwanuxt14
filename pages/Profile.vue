<script setup lang="ts">
	/*********************************************************
	prog name: 關於我, author: James Lin, date: 2022/08/10
	主功能: 變更使用者profile, 重設密碼, 

	**********************************************************/	
	import { ref, reactive, onMounted } from "vue"
	import { useStorage, useFetch, createFetch } from "@vueuse/core"
	import TinyMceEditor from "@tinymce/tinymce-vue"

	const mainID = ref('')
	const tabClass1 = ref('')
	const tabClass2 = ref('')
	const isProfile = ref(false)
	const liwaData = ref({})
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

	const toggleActiveTab = (iNum) => {
		console.log('liwaData_toggle =', liwaData.value)
		if (iNum == 1) {
			isProfile.value = true
			tabClass1.value = 'underline decoration-red-300 decoration-[4px]'
			tabClass2.value = ''
			loadData()
		} else if (iNum == 2) {
			isProfile.value = false
			tabClass1.value = ''
			tabClass2.value = 'underline decoration-red-300 decoration-[4px]'
		} else {
			tabClass1.value = ''
			tabClass2.value = ''
		}
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
		mainID.value = window.sessionStorage.getItem('liwaUserID')
		let url= window.sessionStorage.getItem('liwaAPIsvr') + "/A04_haveDetail.php?siteID=" + window.sessionStorage.getItem('liwaSiteID') + "&userID=" + mainID.value
		const data = await useFetch(url, {method: 'GET'}, {refetch: true}).get().json()
		liwaData.value = data.data.value.arrSQL[0]
	console.log('liwaData =', liwaData.value)
		liwaData.value.action = 'edit'
		liwaData.value.mainID = mainID.value
		liwaData.value.siteID = window.sessionStorage.getItem('liwaSiteID')
		liwaData.value.userID = mainID.value
		liwaData.value.makerName = window.sessionStorage.getItem('liwaUserName')
		// stitle.value = detailName.value 
		sContent.value = liwaData.value.userBrief
	}	

	const saveData = async () => {
		//  若 iconSrc.substr(0, 5)=='', liwaData.value.picpath = iconSrc
		let picHead = iconSrc.value.substr(0, 5)
		if (picHead == 'data:') liwaData.value.picpath = iconSrc.value
		if (sContent.value) {
			liwaData.value.userBrief = sContent.value
		}

		let datastr = JSON.stringify(liwaData.value)
	console.log('datastr =', datastr)

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
	    const { data } = await useMyFetch('A04_edit.php').post().json()	
	 	console.log('data =', data.value)
	}	

	const resetPSWD = async () => {
		let passData = { 
			"siteID": window.sessionStorage.getItem('liwaSiteID'),
			"mainID": window.sessionStorage.getItem('liwaUserID'),
			"username": window.sessionStorage.getItem('liwaUserName'),
			"pswd": newpass1.value 
		}
		let datastr = JSON.stringify(passData)
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
	    const { data } = await useMyFetch('sys_resetPSWD.php').post().json()

	}

	definePageMeta({
	  title: `關於我`,
	})

	onMounted(() => {
		loadData()
		isProfile.value = true
		toggleActiveTab(1)
	})
</script>

<template>
	<!-- <div class="w-full bg-gradient-to-r from-indigo-900 to-violet-200 px-4 py-2"> -->
	<div class="w-full bg-slate-200 px-4 py-2">
		<div class="max-w-lg w-full mx-auto flex flex-row justify-start">
			<div class="w-1/2 h-8 text-center text-slate-700 cursor-pointer"
			:class="tabClass1"
			@click="toggleActiveTab(1)"
			>關於我</div>
			<div class="w-1/2 h-8 text-center text-slate-700 cursor-pointer"
			:class="tabClass2"
			@click="toggleActiveTab(2)"
			>改變密碼</div>
		</div>
		<div v-if="isProfile">
			<div class="w-full h-full mx-auto my-0 lg:max-w-lg bg-white">
				<div class="w-full bg-white mx-auto my-2 rounded-xl pb-1">
					<FormKit 
					form-class="px-4 py-2 bg-yellow-200 rounded-2xl w-11/12"
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
							<p class="w-full text-center text-red-600 text-sm">頭像: 請上傳 200 X 200 px照片</p>
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
		</div>
		<div class="w-full h-full bg-slate-200" v-else>
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
</template>