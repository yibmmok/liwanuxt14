<script setup lang="ts">
	/*********************************************************
	prog name: liwaConfigList, author: James Lin, date: 2022/08/22
	主功能: 測試 config的設定資料的CRUD

	**********************************************************/		
	import { ref, computed, onMounted, toRefs } from "vue"
	import { useFetch, createFetch, useTitle } from "@vueuse/core"

	const action = ref('view')
	const siteID = ref('')
	const liwaData = ref([])
	const keydata = ref({})
	const itemName = ref('') // 處理中的項目名稱
	const actvTab = ref(0)

	// const props = defineProps({
	// 	arrOptions: {
	// 		type: Array,
	// 		required: true,
	// 		default:[]
	// 	}
	// })

	// const { arrOptions } = toRefs(props)

	const arrOptions = ref([
		{tabName:'公告類別', class:'', prog:'005D1_edit.php'},
		{tabName:'討論區類別', class:'', prog:'008D2_edit.php'},
	])

	const emits = defineEmits(["hideConfig"])

	const hideConfig1 = () => {
		emits("hideConfig")
	}	

	const setTabName = (idx) => {
		actvTab.value = idx
		arrOptions.value.forEach((obj) => {
			obj.class=''
		})
		// actvTab設定為active
		arrOptions.value[idx].class = 'active'
		loadData()
	}

	const itemadd = () => {
		let tmpdata = {
			'label': '',
			'value': '',
			'isShow': '1'
		}
		liwaData.value.push(tmpdata)
		action.value = 'add'
	}

	const loadData = async () => {
		keydata.value = {
			siteID: siteID.value,
			action: 'view'
		}
		let datastr = JSON.stringify(keydata.value)

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
	    // const { data } = await useMyFetch('005D1_edit.php').post().json()
	    const { data } = await useMyFetch(apiName.value).post().json()
	    liwaData.value = data.value.arrSQL
	}

	const setMainID = (idx) => {
		liwaData.value[idx].isShow = '1'
		itemName.value = liwaData.value[idx].label
		action.value = 'edit'
	}

	const itemDelete = async (sID) => {
		keydata.value = {
			siteID: siteID.value,
			itemTypeID: sID,
			action: 'delete'
		}
		let datastr = JSON.stringify(keydata.value)
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
	    // const { data } = await useMyFetch('005D1_edit.php').post().json()
	    const { data } = await useMyFetch(apiName.value).post().json()
	    let msg = data.value.message
	    if (!msg) {
	    	loadData()
	    }		
	}

	const closeBox = (idx) => {
		liwaData.value[idx].isShow = '0'
		itemName.value = ''
		if (action.value == 'add') {
			// 刪除 liwaData最後一筆
			liwaData.value.pop()
		}
		action.value = 'view'
	}

	const saveD1 = async (idx) => {
		keydata.value = {
			siteID: siteID.value,
			itemTypeID: liwaData.value[idx].value,
			itemType: itemName.value,
			action: action.value
		}
		let datastr = JSON.stringify(keydata.value)
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
	    // const { data } = await useMyFetch('005D1_edit.php').post().json()
	    const { data } = await useMyFetch(apiName.value).post().json()
	    let msg = data.value.message
	    if (!msg) {
	    	loadData()
	    }
	    action.value = 'view'
	}

	const apiName = computed(() => {
		return arrOptions.value[actvTab.value].prog
	})

	const actvTabName = computed(() => {
		return arrOptions.value[actvTab.value].tabName
	})

	onMounted(() => {
		siteID.value = window.sessionStorage.getItem('liwaSiteID')
		if (apiName.value) loadData()
	})

</script>

<template>
	<div class="w-full h-full bg-white">
		<div v-if="arrOptions > 1" class="w-full md:w-[600px] h-16 mx-auto bg-slate-100">
			<ul class="w-[calc(100%_-_40px)] inline-flex px-1 pt-2 ">
		    	<li v-for="(tab, index) in arrOptions" class="w-36 h-12 px-4 pt-2 font-semibold text-gray-800 rounded-t opacity-50 border-2 border-slate-500 " :class="tab.class" @click="setTabName(index)">{{ tab.tabName }}</li>				
			</ul>
		</div>
		<div class="w-full md:w-[600px] h-[80vh] mx-auto border-2 border-slate-500 overflow-x-hidden overflow-y-auto">
			<div class="w-full h-12 pt-2 bg-slate-300 border-2 border-slate-200 text-md text-center relative">{{ actvTabName }}列表
				<div class="w-8 h-8 pt-1 bg-red-200 rounded-full absolute top-1 left-1" @click="itemadd()">+</div>
	            <div class="absolute w-8 h-8 top-2 right-2 bg-transparent cursor-pointer" @click.prevent="hideConfig1()">
	              <svg
	                class="w-6 h-6 float-left"
	                fill="red"
	                stroke="red"
	                viewBox="0 0 24 24"
	                xmlns="http://www.w3.org/2000/svg"
	              >
	                <path
	                  stroke-linecap="round"
	                  stroke-linejoin="round"
	                  stroke-width="2"
	                  d="M6 18L18 6M6 6l12 12"
	                ></path>
	              </svg>              
	            </div>					
			</div>
			<div class="w-full relative" v-for="(item, index) in liwaData" :key="item.value">
				<div class="w-full h-12 pt-3 pl-2 border-b-2 border-b-slate-300 flex flex-row"
				>
					<div class="w-[calc(100%_-_3rem)] h-12" @click="setMainID(index)">{{ item.label }}</div>
					<div class="w-12 h-12 " @click="itemDelete(item.value)">
						<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="30px" height="30px" viewBox="0 0 458.5 458.5" style="enable-background:new 0 0 458.5 458.5;" xml:space="preserve">
							<g style="fill:#F33;stroke:#F33;stroke-width:12px;stroke-linecap:round;stroke-linejoin:round;">
								<path d="M382.078,57.069h-89.78C289.128,25.075,262.064,0,229.249,0S169.37,25.075,166.2,57.069H76.421 c-26.938,0-48.854,21.916-48.854,48.854c0,26.125,20.613,47.524,46.429,48.793V399.5c0,32.533,26.467,59,59,59h192.508 c32.533,0,59-26.467,59-59V154.717c25.816-1.269,46.429-22.668,46.429-48.793C430.933,78.985,409.017,57.069,382.078,57.069z M229.249,30c16.244,0,29.807,11.673,32.76,27.069h-65.52C199.442,41.673,213.005,30,229.249,30z M354.503,399.501 c0,15.991-13.009,29-29,29H132.995c-15.991,0-29-13.009-29-29V154.778c12.244,0,240.932,0,250.508,0V399.501z M382.078,124.778 c-3.127,0-302.998,0-305.657,0c-10.396,0-18.854-8.458-18.854-18.854S66.025,87.07,76.421,87.07h305.657 c10.396,0,18.854,8.458,18.854,18.854S392.475,124.778,382.078,124.778z"/>
								<path d="M229.249,392.323c8.284,0,15-6.716,15-15V203.618c0-8.284-6.715-15-15-15c-8.284,0-15,6.716-15,15v173.705 C214.249,385.607,220.965,392.323,229.249,392.323z"/>
								<path d="M306.671,392.323c8.284,0,15-6.716,15-15V203.618c0-8.284-6.716-15-15-15s-15,6.716-15,15v173.705 C291.671,385.607,298.387,392.323,306.671,392.323z"/>
								<path d="M151.828,392.323c8.284,0,15-6.716,15-15V203.618c0-8.284-6.716-15-15-15c-8.284,0-15,6.716-15,15v173.705 C136.828,385.607,143.544,392.323,151.828,392.323z"/>
							</g>
						</svg>						
					</div>
				</div>
				<div v-if="item.isShow!=='0'" class="w-full h-32 border-2 border-slate-600 p-2 flex flex-row bg-yellow-200 absolute top-0 left-0">
					<div class="w-[calc(100%_-_12rem)]">
						<FormKit
							name="label"
							label="名稱"
							type="text"
							v-model="itemName"
							placeholder="請輸入選項名稱"
							help="請輸入選項名稱"
							validation="required"
						/>				
					</div>
					<div class="w-[11rem] p-4 flex flex-row">
						<div class="w-24 h-12 rounded-lg bg-blue-500 text-white text-center mt-1 pt-2 cursor-pointer"
						@click="saveD1(index)"
						>存檔</div>
						<div class="w-20 h-20 bg-transparent mt-3 ml-6"
						@click.prevent.stop="closeBox(index)"
						>
							<svg
							  class="w-8 h-8 float-left"
							  fill="red"
							  stroke="red"
							  viewBox="0 0 24 24"
							  xmlns="http://www.w3.org/2000/svg"
							>
								<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="5"
								d="M6 18L18 6M6 6l12 12"
								></path>
							</svg>					
						</div>							
					</div>

				</div>
			</div>
		</div>
	</div>
</template>

<style scoped>
	.active {
		background-color:#333;
		color:#DDD;
	}
</style>