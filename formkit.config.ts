import { zh } from '@formkit/i18n'
import { DefaultConfigOptions, createInput } from '@formkit/vue'
import liwaDrop from "./components/liwaDrop.vue"
import liwaCombo from "./components/liwaCombo.vue"
import { generateClasses } from '@formkit/themes'
import { applicationIcons, ethereum } from '@formkit/icons'

const config: DefaultConfigOptions = {
	locales: { zh },
	locale: 'zh',
	messages: {
		zh: {
			validation: {
				required({ name }) {
					return `${name} 欄不得空白.`
				}
			}
		}
	},
	inputs: {
		liwaDrop: createInput(liwaDrop, {
			props: ['sVal', 'arrOption'],
		}),
		liwaCombo: createInput(liwaCombo, {
			props: ['sVal', 'arrOption'],
		}),		
	},
	classes: generateClasses({
  	      text: {
        	// outer: 'mb-5',
        	// label: 'block mb-1 font-bold text-sm',
        	// inner: 'max-w-md border border-gray-400 rounded-lg mb-1 overflow-hidden focus-within:border-blue-500',
        	// input: 'w-full h-10 px-3 border-none text-base text-gray-700 placeholder-gray-400',
        	// help: 'text-xs text-gray-500',
        	// messages: 'list-none p-0 mt-1 mb-0',
        	// message: 'text-red-500 mb-1 text-xs'
      		}		
	}),
	icons: {
		...applicationIcons, // spread an entire group of icons
		ethereum, // or add single icons
	}
}

export default config
