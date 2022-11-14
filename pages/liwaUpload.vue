<script setup lang="ts">
	/*********************************************************
	prog name: 上傳檔案測試, author: James Lin, date: 2022/11/13
	Todo: 1. 串資料庫 
		  2. 
	**********************************************************/	
	import { ref, onMounted } from "vue"	
	const dropArea = ref(null)
	const progressBar = ref(null)
	const uploadProgress = ref([])		
	const array1 = ref(['dragenter', 'dragover', 'dragleave', 'drop'])
	const array2 = ref(['dragenter', 'dragover'])
	const array3 = ref(['dragleave', 'drop'])

	const preventDefaults = (e) => {
		e.preventDefault()
		e.stopPropagation()
	}

	const highlight = (e) => {
		dropArea.value.classList.add('highlight')
	}

	const unhighlight = (e) => {
		dropArea.value.classList.remove('highlight')
	}

	const handleDrop = (e) => {
		let dt = e.dataTransfer
		let files = dt.files

		handleFiles(files)
	}
/*
	const handleFiles = (files) => {
		let allfiles = [...files]
		console.log('files length =', allfiles.length)
		// initialProgress(files.length)
		// files.forEach(uploadFile)
		// files.forEach(previewFile)
	}
*/
	const handleFiles = (element) => {
		let files = element.target.files
		console.log('files length =', files.length)
		initialProgress(files.length)
		// files.forEach(uploadFile)
		for(let i=0; i<files.length; i++) {
			uploadFile(files[i], i)
		}
	}	

	const initialProgress = (numFiles) => {
		progressBar.value.value = 0
		for(let i = numFiles; i > 0; i--) {
			uploadProgress.value.push(0)
		}
	}

	const updateProgress = (fileNumber, percent) => {
		uploadProgress.value[fileNumber] = percent
		let total = uploadProgress.value.reduce((tot, curr) => tot + curr, 0) / uploadProgress.value.length
		progressBar.value.value = total
	}		

	const previewFile = (file) => {
		let reader = new FileReader()
		reader.readAsDataURL(file)
		reader.onload = () => {
			let img = document.createElement('img')
			img.src = reader.result
			document.getElementById('gallery').appendChild(img)
		}
	}

	const uploadFile = (file, i) => {
		let url = window.sessionStorage.getItem('liwaAPIsvr')+'/testUpload.php' // 上傳檔案的api
		let xhr = new XMLHttpRequest()
		let formData = new FormData()
		xhr.open('POST', url, true)
		xhr.setRequestHeader('X-Request-with', 'XMLHttpRequest')

		// Update progress (can be used to show progress indicator)
		xhr.upload.addEventListener("progress", (e) => {
			updateProgress(i, (e.loaded * 100.0 / e.total) || 100)
		})

		xhr.addEventListener('readystatechange', (e) => {
			if (xhr.readyState == 4 && xhr.status == 200) {
				updateProgress(i, 100)  // <- Add this
			} else if (xhr.readyState == 4 && xhr.status !== 200) {
				// Error, Inform the user
			}
		})

		// formData.append('upload_preset', 'ujpu6gyk')
		formData.append('file', file)
		xhr.send(formData)
	}		

	onMounted(() => {
		array1.value.forEach(eventName => {
				dropArea.value.addEventListener(eventName, preventDefaults, false)
				// document.querySelector('#drop-area').addEventListener(eventName, preventDefaults, false)
				document.body.addEventListener(eventName, preventDefaults, false)
		})

		array2.value.forEach(eventName => {
			dropArea.value.addEventListener(eventName, highlight, false)
		})

		array3.value.forEach(eventName => {
			dropArea.value.addEventListener(eventName, unhighlight, false)
		})			
	})

</script>

<template>
<div id="drop-area" ref="dropArea" class="w-[480px] mx-auto my-[50px] border-2 border-slate-300 border-dashed rounded-2xl p-16">
		<form class="mb-12">
			<p>Upload multiple files with the file dialog or by dragging and dropping images onto the dashed region</p>
			<input type="file" id="fileinput" multiple accept="image/*" @change="handleFiles">
			<label class="button" for="fileinput">Select some files</label>
	</form>
	<progress id="progress-bar" ref="progressBar" class="w-11/12 h-4" max="100" value="0"></progress>
	<div id="gallery" class="mt-2"></div>		
</div>	
</template>

<style scoped>
	.highlight {
	  border-color: purple;
	}

	p {
	  margin-top: 0;
	}

	#gallery img {
	  width: 150px;
	  margin-bottom: 10px;
	  margin-right: 10px;
	  vertical-align: middle;
	}	
</style>