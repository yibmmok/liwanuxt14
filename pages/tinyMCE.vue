<script setup lang="ts">
import { ref } from "vue"
import TinyMceEditor from "@tinymce/tinymce-vue"

const handleOnChange = () => {
	console.log("The input has changed!")
}
</script>

<template>
<h1 class="text-red-500 text-3xl p-4">Index Page</h1>
<div>
	<TinyMceEditor api-key="fkoaqldrjeuygn6wbe51uchydhzrhufgs8a9tt6yehn106uo" @change="handleOnChange"/>
</div>
</template>
