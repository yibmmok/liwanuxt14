<script setup lang="ts">
import { ref, onMounted } from "vue"
import TinyMceEditor from "@tinymce/tinymce-vue"

	const imgInput = ref(null)

	const imgSvr = ref('')
	const sContent = ref('')

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
	    images_upload_url:'uploadtest.php',
	    images_upload_base_path:imgSvr.value+'/tmp/',
	    images_upload_handler: function(fileHere, success, fail) {
	    	let ajax = new XMLHttpRequest()
	    	ajax.withCredentials = false
	    	ajax.open('post', 'uploadtest.php')
	    	ajax.upload.onprogress = (e) => {
	    		progress(e.loaded / e.total * 100) // 待檢查
	    	}
	    	ajax.onload = () => {
	    		if (ajax.status == 200) {
	    			if ( (!JSON.parse(ajax.responseText)) || (typeof JSON.parse(ajax.responseText).filepath != 'string') ) {
	    				fail('Invalid: <code>'+ajax.responseText+'</code>')
	    				return
	    			}
	    			success(JSON.parse(ajax.responseText).filepath)
	    		} else {
	    			fail('Upload error: <code>'+ajax.status+'</code>')
	    			return
	    		}
	    	}
	    	let fileInfo = new FormData()
	    	fileInfo.append('file', fileHere.blob(), fileHere.filename())
	    	ajax.send(fileInfo)
	    },
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
			liwaData.value.iconPath = e.target.result
		}
		reader.readAsDataURL(fileObject)
	}	

const handleOnChange = () => {
	console.log("The input has changed!")
}

onMounted(() => {
	imgSvr.value = window.sessionStorage.getItem('liwaImgsvr')
})
</script>

<template>
<h1 class="text-red-500 text-3xl p-4">Index Page</h1>
<div>
	<TinyMceEditor api-key="fkoaqldrjeuygn6wbe51uchydhzrhufgs8a9tt6yehn106uo" 
	:init="InitVal"
	ref="liwaEditor"
	v-model="sContent"
	@change="handleOnChange"/>
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
</template>
