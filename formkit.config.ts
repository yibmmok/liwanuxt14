import { zh } from '@formkit/i18n'
import { DefaultConfigOptions } from '@formkit/vue'

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
}

export default config