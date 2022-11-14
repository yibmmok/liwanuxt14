<script setup lang="ts">
	/*********************************************************
	prog name: 會員合約, author: James Lin, date: 2022/09/26
	Todo: 1. 串資料庫
	**********************************************************/
	import { ref, onMounted, computed } from "vue"
	import { useFetch, createFetch, useTitle } from "@vueuse/core"
	import banner from "../components/banner"
	import liwaMsg from "../components/liwaMsg.vue"
	import TinyMceEditor from "@tinymce/tinymce-vue"

	const progName = ref('會員合約')
	const proglink = ref('/Wterms_edit')
	const detailFlg = ref(false)
	const detailName = ref('會員合約')	

	const sContent = ref('')
	const liwaEditor = ref(null)
	const isMsg = ref(false)
	const liwaData = ref({})
	const submitted = ref(false)
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
	    toolbar: 'fullscreen | undo redo | blocks |  forecolor backcolor | indent outdent | emoticons | link | bold italic | help',
	})	


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
	// 圖檔處理 starts

	const loadData = async () => {
		let APIsvr = window.sessionStorage.getItem('liwaAPIsvr')
		let url = `${APIsvr}/`
	}

	const saveData = async () => {

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
	// 設定對話盒及設定對話盒相關 ends

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
	<div class="barPanel w-[95%] h-12 rounded-3xl mt-2 ml-4 mb-2 px-1 text-center">網頁編輯 - 會員合約</div>
	<div class="w-full lg:max-w-[900px] lg:h-[calc(100vh_-_12rem)]">
		<div class="bg-white m-2 rounded-xl py-1">
			<div class="w-full">
				<div class="w-full h-8 text-sm font-bold text-slate-800">網頁內容</div>
				<div class="w-full h-full">
					<TinyMceEditor api-key="fkoaqldrjeuygn6wbe51uchydhzrhufgs8a9tt6yehn106uo"
					:init="InitVal"
					ref="liwaEditor"
					v-model="liwaData.parag1"
					@change="handleOnChange"/>
					<div class="w-full my-4 px-4">
						<div class="w-24 py-3 px-5 rounded text-lg text-white bg-sky-500 font-bold text-center" @click="saveData">儲存</div>
					</div>					
				</div>
			</div>
		</div>
	</div>
</div>	
</template>