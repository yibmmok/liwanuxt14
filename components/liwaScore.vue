<script setup lang="ts">
	/*********************************************************
	prog name: 物件評分元件, author: James Lin, date: 2022/11/26
	Todo: 1. 傳入參數->progressCSS, 
		  2. 
	**********************************************************/	
	import { ref, reactive, onMounted, computed, watch } from "vue"
	import { useFetch, createFetch, useTitle } from "@vueuse/core"
	import queryString from "query-string"
	import { IconX } from '@iconify-prerendered/vue-bi'
	import gemSysData from "../static/gemSys.json"	

	const emits = defineEmits(["setScore"])
	const APIsvr = ref('')
	const error = ref('')
	const bShowScoreList = ref(false)
	const liwaSel1 = ref([])
	const liwaData = ref([])
	const sDiamondType = ref('')
	const sDiamondColor = ref('')
	const liwaAns = ref([])
	const sGemsys = ref('')

	const state = reactive({
		'gemSys': '',
		'iTotal': 0,
		'D7':[]
	})

	const loadData = async (sValue, iSubTypes) => {
		let keydata = {
			'gemSysItem': sValue,
			'iSubTypes': iSubTypes
		}
		let sQuery = queryString.stringify(keydata)
		let url = `${APIsvr.value}/023_haveTypes.php?${sQuery}`
		const data = await useFetch(url, {method: 'GET'}, {refetch: true}).get().json()
		liwaData.value = data.data.value.arrSQL
		liwaData.value.forEach((m) => {
			let objTmp = '';
			liwaAns.value.push(objTmp)
		})
	}	

	const getTotalScore = () => {
		state.iTotal = 0
		state.D7 = []
		console.log('liwaData =', liwaData.value)
		let i = 0
		liwaData.value.forEach((item) => {
			item.Ans = liwaAns.value[i]
			// let sAns = item.Ans
			let objDetail = {
				'QuesID':item.QuesID,
				'Ques':item.Ques,
				'AnsID':item.Ans
			}
			state.D7.push(objDetail)
			if (item.Ans) {
				let arrOpt = item.arrOption
				const res = arrOpt.filter((n) => n.value == item.Ans)
				state.iTotal += Number(res[0].iScore)
			}
			i++
		})
		if (state.iTotal > 100) state.iTotal = 100	
		state.gemSys = sGemsys.value
		// console.log('state =', state)
		emits("setScore", state)
	}	

	watch(sGemsys, (Val, oldVal) =>{
		if (Val !== oldVal) {
			bShowScoreList.value = false
			let iSubTypes = 0
			if ((Val) && (Val !== 'A')) loadData(Val, iSubTypes)
			bShowScoreList.value = true	
		}
	})

	watch(sDiamondType, (Val, oldVal) => {
		if (Val !== oldVal) {
			if (Val == '白鑽') loadData('A', 1)
		}
	})

	watch(sDiamondColor, (Val, oldVal) => {
		if (Val !== oldVal) {
			if (Val == '天然色') loadData('A', 2)
			else loadData('A', 3)
		}
	})	

	const testProc = () => {
	}

	onMounted(() => {
		APIsvr.value = window.sessionStorage.getItem('liwaAPIsvr')
		// state.gemSys = ''
		liwaSel1.value = gemSysData
	})		

</script>

<template>
<div v-if="error">{{ error }}</div>
<div class="w-full bg-slate-300 px-4 py-2">
	<div class="barPanel h-16 rounded-3xl ml-4 mb-2 px-1 flex flex-row justify-between relative">
		<div v-if="liwaSel1.length > 0" class="w-72 h-16 text-center mx-auto">
			<span class="mt-2 mr-2 float-left ">所屬評分系統: </span>
			<FormKit
				name="gemSys"
				type="select"
				label=""
				outer-class="-pt-1"
				v-model="sGemsys"
				:options="liwaSel1"
			/>
		</div>
		<div class="hidden w-16 w-16 bg-green-600 absolute left-8 top-4 text-white rounded-lg text-center" @click="testProc()">Test</div>
	</div>	
	<div v-if="bShowScoreList" class="w-full mx-auto bg-white p-4 flex flex-col">
		<div v-if="sGemsys == 'A'" class="w-full mx-auto flex flex-row justify-between">
			<div class="w-1/3 ">
				<FormKit 
					type="radio"
					label="鑽石類別"
					v-model="sDiamondType"
					:options="['白鑽', '彩鑽']"
				/>							
			</div>
			<div v-if="sDiamondType == '彩鑽'" class="w-1/3">
				<FormKit 
					type="radio"
					label="天然色/處理色"
					v-model="sDiamondColor"
					:options="['天然色', '處理色']"
				/>							
			</div>
		</div>
		<div class="px-0 py-2 bg-slate-200 rounded-2xl w-full mx-auto">
			<div v-for="(obj, idx) in liwaData" class="w-[calc(100%_-_4rem)] flex flex-col">
				<div v-if="obj.stitle" class="w-full h-8 mt-4 pl-4 text-blue-500 font-bold">  == {{ obj.stitle }} ==</div>
				<div class="w-[calc(100%_-_4rem)] mx-auto">
					<FormKit
						type="radio"
						:label="obj.Ques"
						v-model="liwaAns[idx]"
						:options="obj.arrOption"
					/>							
				</div>
			</div>
			<div class="w-[96%] h-20 bg-white mx-auto mt-4 py-2">
				<fieldset>
					<legend>物件評分結果</legend>
					<div class="w-72 h-16 mx-auto my-0 text-blue-600 text-center font-bold">
						<div class="w-20 h-10 bg-purple-100 rounded-lg text-center leading-10 float-left cursor-pointer" @click="getTotalScore()">評分</div>
						<span class="text-2xl">{{ state.iTotal }}</span>
					</div>
				</fieldset>
			</div>
		</div>
	</div>
</div>	
</template>

<style scope>
	.formkit-fieldset {
		max-width:100%;
	}

	.formkit-options {
		display:flex;
		flex-direction:row;
		flex-wrap:wrap;
	}

	.formkit-option {
		min-width:33%;

	}
</style>