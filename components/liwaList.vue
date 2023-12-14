<script setup lang="ts">
	/*********************************************************
	prog name: 單欄列表元件, author: James Lin, date: 2022/12/06
	Todo: 單欄列表元素處理
	**********************************************************/	
	import { ref, reactive, onMounted } from "vue"
	import { useFetch, createFetch } from "@vueuse/core"
	import queryString from "query-string"
	import { IconPlusLg, IconTrashFill, IconX, IconCloudArrowUpFill } from '@iconify-prerendered/vue-bi'

	const props = defineProps({
		listTitle: {
			type: String,
			default: ''
		},		
		progID: {
			type: String,
			required: true,
			default: ''
		},	
		dataUrl: {
			type: String,
			required: true,
			default: ''
		},
		params: {
			type:String,
			default: ''
		}		
	})

	const emits = defineEmits(["sendMsg", "setList"])
	const APIsvr = ref('')
	const liwaData = ref([])
	const liwaHead = ref([])
	const liwaSchema = ref({})	
	const liwaObject = ref({})

	const paramstr = ref('')
	const itemVal = ref('')
	const action = ref('view')

	const orderCol = ref('')
	const sortIndex = ref(0)
	const sortDir = ref('asc')	
	const isEdit = ref(false)
	const boxCSS = ref('')
	const iTotal = ref(0)	

	const state = reactive({
		'listTitle': props.listTitle,
		'progID': props.progID,
		'dataUrl': props.dataUrl,
		'params': props.params
	})

	const loadData = async () => {
		let objItem = {
			'JWT': window.localStorage.getItem('liwaJWT'),
			'params': paramstr.value,
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
	    const { data } = await useMyFetch(state.dataUrl).post().json() 
	    if (data.value.arrSQL.length > 0) {
			liwaData.value = data.value.arrSQL
			liwaData.value.forEach((item) => {
				item.isShow = 0
			})				    	
	    }
    	liwaSchema.value = data.value.arrSchema[0]
    	iTotal.value = liwaData.value.length
    	emits('setList', liwaData.value) 
	}

	const loadHead = async () => {
		let keydata = {
			'JWT': window.localStorage.getItem('liwaJWT'),
			'progID':state.progID
		}
		let sQuery = queryString.stringify(keydata)
		let url = `${APIsvr.value}/sys_haveHead.php?${sQuery}`
		const data = await useFetch(url, {method: 'GET'}, {refetch: true}).get().json()	
		liwaHead.value = data.data.value.arrSQL
		console.log('liwaHead =', liwaHead.value)
		liwaHead.value.forEach((m) => m.sort = 0)
	}	

	const addD1 = () => {
		let objItem = (state.dataUrl)? {
			'mainID':'',
			'itemNM':'',
			'isShow':1,
		} : {
			'itemNM':'',
			'isShow':1,			
		}
		liwaData.value.push(objItem)
		console.log('liwaData =', liwaData.value)
		action.value = 'add'
		itemVal.value = ''
		isEdit.value = true
	}

	const saveData = async (idx) => {
		if (state.dataUrl) {
			let keydata = {
				"action":action.value,
				"JWT":window.localStorage.getItem('liwaJWT'),
				"itemNM":itemVal.value
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
		    const { data } = await useMyFetch(state.dataUrl).post().json()
		    let msg = data.value.message
		    if (!msg) {
		    	if (action.value == 'add') {
		    		liwaData.value[idx].mainID = data.value.key
		    	}
				liwaData.value[idx].itemNM = itemVal.value
				liwaData.value[idx].isShow = 0	
		    }
		    emits('setList', liwaData.value)			
		} else {
			liwaData.value[idx].itemNM = liwaObject.value.itemNM
			liwaData.value[idx].isShow = 0	
			console.log('liwaData =', liwaData.value)			
		}
	    action.value = 'view'
	    itemVal.value = ''
	}

	const setOrder = (idx) => {
		// 用來對liwaData的資料排序
		// 若 sortIndex == idx, 直接排序, 若否, 先將所有欄位 sort設為0
		if (idx !== sortIndex.value) {
			liwaHead.value.forEach((m) => m.sort = 0)
		}
		let iSort = liwaHead.value[idx].sort
		if (iSort < 2) {
			liwaData.value.sort((a, b) => { 
				if (Object.values(b)[idx] < Object.values(a)[idx]) return -1
			})	
			iSort = 2
		} else {
			liwaData.value.sort((a, b) => { 
				if (Object.values(a)[idx] < Object.values(b)[idx]) return -1
			})		
			iSort --
		}
		liwaHead.value[idx].sort = iSort
		sortIndex.value = idx
	}	

	const setMainID = (idx) => {
		//將 liwaData.value[idx] 的值設給 liwaObject
		let iLength = Object.keys(liwaData.value[idx]).length
		let str = ''
		for (let i=0; i<iLength; i++) {
			str += (i == iLength -1)? '"'+ Object.keys(liwaData.value[idx])[i] + '":"'+ Object.values(liwaData.value[idx])[i] +'"': '"'+ Object.keys(liwaData.value[idx])[i] + '":"'+Object.values(liwaData.value[idx])[i]+'",'
		}
		str = '{' + str + '}'
		liwaObject.value = JSON.parse(str)
		boxCSS.value = 'top-[4.25rem] z-50'
		action.value='edit'
		isEdit.value = true
		liwaData.value[idx].isShow = '1'
	}

	const closeBox = (idx) => {
		liwaData.value[idx].isShow = 0
		if (action.value == 'add') {
			liwaData.value.pop()
		}
		action.value = 'view'
		isEdit.value == false
	}

	const exportList = () => {
		emits('setList', liwaData.value)
	}

	const itemDelete = async (idx) => {
		if (state.dataUrl) {
			action.value = 'delete'
			let keydata = {
				"action":action.value,
				"JWT":window.localStorage.getItem('liwaJWT')
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
		    const { data } = await useMyFetch(state.dataUrl).post().json()
		    let msg = data.value.message
		    if (!msg) {
		    	liwaData.value.splice(idx, 1)
		    }
		    emits('setList', liwaData.value)
		} else {
			liwaData.value.splice(idx, 1)
		}
		action.value = 'view'
	}

	onMounted(() => {
		APIsvr.value = window.sessionStorage.getItem('liwaAPIsvr')
		loadHead()
		if (state.dataUrl) {
			let datastr = JSON.stringify(state.params)
			paramstr.value = (datastr)? datastr: ''			
			loadData()
		}
	})		

</script>

<template>
<div class="w-full min-h-[360px] bg-gray-100">
	<div class="w-full mx-auto my-0 bg-white relative">
		<!-- 先設定 Title & btnAdd -->
		<div class="w-full h-12 pt-3 text-white text-center bg-violet-800 relative">
			<div class="w-full text-center">{{ state.listTitle }}</div>
			<div class="top-icon Dadd absolute left-2 top-2 pl-[.125rem] pt-[.125rem]" @click="addD1()">
				<IconPlusLg class="w-7 h-7 text-slate-100 font-bold" />
			</div>	
			<div v-if="!state.dataUrl" class="top-icon Dadd absolute right-2 top-2 pl-[.125rem] pt-[.125rem]" @click="exportList()">
				<IconCloudArrowUpFill class="w-7 h-7 text-slate-100 font-bold" />
			</div>							
		</div>
		<div class="w-full min-h-[360px] overflow-x-hidden overflow-y-auto border-2 border-slate-400 pb-8">
			<table class="w-full divide-x divide-y divide-gray-200 bg-white " :class="tableCSS">
				<thead class="w-full bg-white ring-1 ring-gray-200">
					<th v-for="(item, index) in liwaHead" class="thPanel relative text-white bg-violet-900" :class="item.headCSS">
						<div v-if="item.isOrder == 1" class="flex flex-row justify-between">
							<div class="w-[calc(100%_-_2rem)] py-2" @click="setOrder(index)">
								{{ item.colNM }}
							</div>
							<div v-if="item.sort > 0" class="w-8">
				        		<div v-if="item.sort==1">
				        			<!-- 昇冪排列 -->
				        			<IconCaretUpFill class="w-7 h-7 absolute right-1 top-3 text-yellow-300 font-bold" />
				        		</div>
				        		<div v-if="item.sort==2">
				        			<!-- 降冪排列 -->
				        			<IconCaretDownFill class="w-7 h-7 absolute right-1 top-3 text-yellow-300 font-bold" />
				        		</div>
							</div>
						</div>
						<div v-else>
							<div class="w-full">
								{{ item.colNM }}
							</div>						
						</div>
					</th>
				</thead>
				<tbody>
					<tr 
						class="odd:bg-white even:bg-slate-200 relative"
						v-for="(object, index) in liwaData"
						:key="index"
					>
						<td scope="col" class="border-b py-2 text-sm font-medium text-gray-500 uppercase tracking-wider" :class="liwaHead[index1-1].headCSS" v-for="index1 in liwaHead.length">
							<div class="w-full border-r-2 odd:border-r-gray-300 even:border-r-slate-800 cursor-pointer flex flex-row justify-between" 
								@click="setMainID(index)">
								<!-- 資料主體 -->
								<div class="py-2" :class="liwaHead[index1-1].bodyCSS">
									{{ Object.values(object)[index1-1] }}
								</div>
								<div class="w-12 h-12 pt-[0.125rem] pr-[0.125rem] " @click="itemDelete(index)">
									<IconTrashFill class="w-7 h-7 text-red-300 font-bold" />
								</div>								
							</div>
						</td>
						<div v-if="object.isShow == '1'" class="w-full py-0 absolute left-0 bg-transparent flex flex-col" :class="boxCSS">
							<div v-if="isEdit" class="w-full relative">
								<FormKit 
								form-class="px-0 py-2 bg-violet-100 "
								type="form"
								v-model="liwaObject"
								:form-class="submitted? 'hidden': 'block'"
								submit-label="存檔"
								@submit="saveData(index)"
								>
									<div class="w-full px-0 py-2 flex flex-row">
										<div v-for="index1 in liwaHead.length" :class="liwaHead[index1-1].headCSS">
											<div v-if="(liwaHead[index1-1].canEdit=='0') && action=='edit'" class="pt-6 pb-6 " :class="liwaHead[index1-1].bodyCSS">
												{{ Object.values(object)[index1-1] }}
											</div>
											<div v-else class="py-0">
												<div v-if="liwaHead[index1-1].fieldType == 'liwaDrop'" class="w-full text-left px-2 relative" >
													<FormKit 
														:name="liwaHead[index1-1].colField"
														:label="liwaHead[index1-1].colNM"
														:type="liwaHead[index1-1].fieldType"
														:arrOption="setArrOptions(liwaHead[index1-1].colField)"
														:sVal="get_sVal(liwaHead[index1-1].valField, index)"
													/>
												</div>
												<div v-else class="w-full text-left px-2">
													<FormKit 
														:name="liwaHead[index1-1].colField"
														:label="liwaHead[index1-1].colNM"
														:type="liwaHead[index1-1].fieldType"
													/>
												</div>
											</div>
										</div>						
									</div>	
								</FormKit>
								<div class="w-10 h-10 mx-2 my-2 absolute left-[8rem] bottom-[1.5rem]">
									<IconX class="w-10 h-10 text-red-500 font-bold" @click.stop="closeBox(index)"/>
								</div>									
							</div>
						</div>
					</tr>
				</tbody>
			</table>
		</div>
	</div>
</div>	
<div class="w-full border-2 border-slate-300 text-right">Total: {{ iTotal }}</div>
</template>