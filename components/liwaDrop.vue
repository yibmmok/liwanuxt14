<script setup lang="ts">
	import { ref, onMounted } from "vue"
	import { useElementBounding, useWindowSize } from "@vueuse/core"
	import { IconCaretDownFill } from '@iconify-prerendered/vue-bi'

	const isShow = ref(false)
	const arrOption = ref([])
	const keyID = ref('')
	const HeightLimit = ref(200)
	const listPos = ref('top-[2.25rem]')
	const props = defineProps({
	  context: {
	    type: Object as PropType<FormKitFrameworkContext & { sVal: string,  arrOption: []}>,
	    required: true
	  }
	})

	const showValue = ref('')

	const inputVal = ref<HTMLInputElement | null>(null)
	const context = toRef(props, 'context')

	const handleInput = (e) => {
		props.context.node.input(e.target.value)
	}

	const toggleMenu = () => {
		const { x, y, top, bottom, width, height } = useElementBounding(inputVal.value)	
		if (bottom.value > HeightLimit.value) {
			listPos.value = "-top-[7.25rem]"
		} else {
			listPos.value = "top-[4.3rem]"
		}
		isShow.value = !isShow.value
	}

	const getItems = (sValue, sID) => {
		showValue.value = sValue
		props.context.node.input(sID)
		keyID.value = sID
		isShow.value = false	
	}

	onMounted(() => {
		showValue.value = props.context.sVal
		arrOption.value = props.context.arrOption
		const { height } = useWindowSize()
		HeightLimit.value = height.value * 3/4
	})
</script>

<template>
	<input 
		ref="inputVal"
		class="w-[87%] py-2 outline-0 text-md pl-3"
		:value="showValue"
		:data-ID="keyID"
		readonly="readonly"
		@click="toggleMenu"
	/>
	<div v-if="isShow==true" 
		class="w-full h-36 py-1 absolute left-2 bg-white text-md outline-1 z-[100]"
		:class="listPos"
	>
		<div class="w-full h-36 overflow-x-hidden overflow-y-auto">
			<ul class="w-[95%] py-1 border-2 border-slate-300">
				<li v-for="(item, index) in arrOption" 
					class="w-full py-2 pl-2 border-b-2 border-b-slate-300 bg-slate-50 cursor-pointer lg:hover:bg-slate-500"
					@click="getItems(item.label, item.value)"
				>{{ item.label }}
				</li>
			</ul>			
		</div>
			
	</div>
	<div class="w-[20px] py-2 absolute top-6 right-4"
		@click="toggleMenu"
	>
		<IconCaretDownFill class="w-7 h-7 text-slate-600 font-bold"/>
	</div>


</template>