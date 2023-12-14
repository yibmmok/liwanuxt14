<script setup lang="ts">
	/*********************************************************
	prog name: 單欄列表元件, author: James Lin, date: 2022/12/06
	Todo: 單欄列表元素處理
	**********************************************************/	
	import { ref, reactive, onMounted } from "vue"
	import { useFetch, createFetch } from "@vueuse/core"
	import queryString from "query-string"
	import { IconPlusLg, IconTrashFill, IconX } from '@iconify-prerendered/vue-bi'

	const props = defineProps({
		headCol: {
			type: Array,
			required: true,
			default:[]
		},
		gridTitle: {
			type: String,
			default: ''
		},
		phpurl: {
			type: String,
			required: true,
			default: ''
		},
		mainID: {
			type: String,
			default: ''
		}
	})

	const emits = defineEmits(["hideConfig"])
	const APIsvr = ref('')
	const liwaData = ref([])
	const liwaDetail = ref({
		'keyitem':'',
		'item1':'',
		'item2':'',
	})
	const itemVal = ref('')
	const action = ref('view')

	const state = reactive({
		'headCol': props.headCol,
		'gridTitle': props.gridTitle,
		'phpurl': props.phpurl,
		'mainID':props.mainID
	})

	const loadData = async () => {
		let objItem = {
			'JWT': window.localStorage.getItem('liwaJWT'),
			'mainID':state.mainID,
			'action': action.value
		}
		let datastr = JSON.stringify(objItem)
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
	    const { data } = await useMyFetch(state.phpurl).post().json() 
		liwaData.value = data.value.arrSQL
		console.log('liwaData =', liwaData.value)
		liwaData.value.forEach((item) => {
			item.isShow = 0
			item.trCSS = ''
			item.boxCSS = 'top-12'
		})
	}

	const addD1 = () => {
		let nuNum = liwaData.value.length + 1
		let objItem = {
			'keyitem':'',
			'item1':'匯入',
			'item2':'',
			'isShow':1,
			'trCSS':'h-24',
			'boxCSS':'top-0'
		}
		liwaData.value.push(objItem)
		liwaDetail.value.item1 = '匯入'
		liwaDetail.value.item2 = ''
		action.value = 'add'
	}

	const saveData = async (idx) => {
		let keydata = {
			"action":action.value,
			"JWT":window.localStorage.getItem('liwaJWT'),
			'mainID':state.mainID,
			'keyitem':liwaDetail.value.keyitem,
			"item1":liwaDetail.value.item1,
			"item2":liwaDetail.value.item2
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
	    const { data } = await useMyFetch(state.phpurl).post().json()
	    let msg = data.value.message
	    if (!msg) {
	    	let index = (action.value == 'add')?liwaData.value.length-1:idx
	    	liwaData.value[index].keyitem = liwaDetail.value.keyitem
			liwaData.value[index].item1 = liwaDetail.value.item1
			liwaData.value[index].item2 = liwaDetail.value.item2
			liwaData.value[index].isShow = 0
			liwaData.value[index].trCSS = ''	    	
	    }
	    action.value = 'view'
	    itemVal.value = ''
	}

	const closeBox = (idx) => {
		liwaData.value[idx].isShow = 0
		if (action.value == 'add') {
			liwaData.value.pop()
		}
		action.value = 'view'
		liwaData.value[idx].trCSS = ''
	}

	const itemDelete = async (idx) => {
		action.value = 'delete'
		let keydata = {
			"action":action.value,
			"JWT":window.localStorage.getItem('liwaJWT'),
			"mainID":state.mainID,
			"keyitem":liwaData.value[idx].keyitem
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
	    const { data } = await useMyFetch(state.phpurl).post().json()
	    let msg = data.value.message
	    if (!msg) {
	    	liwaData.value.splice(idx, 1)
	    	liwaDetail.value.item1 = ''
	    	liwaDetail.value.item2 = ''
	    }
		action.value = 'view'
	}

	const closeDlg = () => {
		emits('hideConfig')
	}

	onMounted(() => {
		APIsvr.value = window.sessionStorage.getItem('liwaAPIsvr')
		loadData()

	})		

</script>

<template>
<div class="w-full h-[calc(100vh_-_200px)] bg-gray-100">
	<div class="w-full h-full mx-auto my-0 bg-white relative">
		<!-- 先設定 Title & btnAdd -->
		<div class="barPanel w-full h-12 mt-2 px-1 flex flex-row justify-between relative border-2 border-slate-300">
			<div class="w-full text-center">{{ state.gridTitle }}</div>
			<div class="top-icon Dadd absolute left-2 top-2 pl-[.125rem] pt-[.125rem]" @click="addD1()">
				<IconPlusLg class="w-7 h-7 text-slate-100 font-bold" />
			</div>				
		</div>
		<div class="w-12 h-12 absolute top-1 right-1" @click="closeDlg()">
			<IconX class="w-11 h-11 text-red-300 font-bold" />
		</div>
		<div class="w-full h-[calc(100vh_-_11rem)] lg:h-[calc(100vh_-_16rem)] overflow-x-hidden overflow-y-auto border-2 border-slate-400 pb-8">
			<table class="w-full divide-x divide-y divide-gray-200 bg-white ">
				<thead>
					<tr class="w-full bg-emerald-500">
						<th v-for="(thead, index) in state.headCol" class="w-1/3 text-white py-4">{{ thead }}</th>
					</tr>
				</thead>
				<tbody v-if="liwaData.length > 0">
					<tr class="w-full relative odd:bg-white even:bg-slate-200"
						v-for="(item, index) in liwaData"
						:key="index"
						:data-id="item.keyitem"
					>						
						<td scope="row" class="w-1/3 pt-3 pl-2 border-b-2 border-b-slate-300 ">
							<div class="w-full text-center">
								{{ item.item1 }}
							</div>
						</td>						
						<td scope="row" class="w-1/3 pt-3 pl-2 border-b-2 border-b-slate-300 ">
							<div class="w-full pl-8 text-right">
								{{ item.item2 }}
							</div>
						</td>
						<td scope="row" class="w-1/3 pt-3 pl-2 border-b-2 border-b-slate-300 ">
							<div class="w-full flex flex-row justify-end">
								<div class="w-12 h-12" @click="itemDelete(index)">
									<IconTrashFill class="w-11 h-11 text-red-400 font-bold"/>
								</div>								
							</div>
						</td>						
						<div v-if="item.isShow==1" class="absolute w-full h-auto left-0 bg-white z-50" 
						:class="item.boxCSS"
						>
							<div class="w-full bg-yellow-200 relative">
								<FormKit
									form-class="px-4 py-2 bg-yellow-200 rounded-2xl w-11/12"
									type="form"
									v-model="liwaDetail"
									:form-class="submitted? 'hidden': 'block'"
									style="margin: 1rem auto;"
									submit-label="存檔"
									@submit="saveData(index)"
								>
									<div class="w-full flex flex-col lg:flex-row">
										<div class="w-1/5 mt-1">
											<p class="mt-1 mb-1 text-sm font-bold">日期</p>
											<p>{{ liwaDetail.keyitem }}</p>
										</div>
										<div class="w-2/5">
									        <FormKit
									          name="item1"
									          :label="state.headCol[0]"
									          type="text"
									          help="只能輸入「匯入」或「匯出」"
									          validation="required|matches:匯入,匯出"
									        />
										</div>
										<div class="w-2/5">
									        <FormKit
									          name="item2"
									          :label="state.headCol[1]"
									          type="text"
									          validation="required"
									        />
										</div>
									</div>
								</FormKit>
								<div class="w-8 h-12 absolute bottom-4 right-10" @click="closeBox(index)">
									<IconX class="w-7 h-7 text-red-400 font-bold" 
									/>
								</div>
							</div>
						</div>
					</tr>
				</tbody>
			</table>
		</div>
	</div>
</div>	
</template>