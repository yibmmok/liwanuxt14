/*********************************************************
prog name: liwasite 各種公用函數, author: James Lin, date: 2023/03/03
函數說明: 
1. setThousandSep: 設定千分位
2. convDateTime: 設定 FormKit的日期轉換
**********************************************************/	
import { ref } from "vue"

export function useLiwaPublic() {
	// 設定千分符號
	const setThousandSep = (str) => {
		let result = ''
		if (str) {
			let pattern = /(\d)(?=(\d{3})+(?!\d))/g
			let repl = "\$1,"
			result = str.replace(pattern, repl)
		} else result = str		
		return result
	}

	// 設定FormKit的日期轉換
	const convDateTime = (str) => {
		// let resStr = ''
		// if (str) {
		// 	resStr = str.replace(/\-/g, '/').replace(/T/, ' ')
		// } else {
		// 	resStr = str
		// }
		// return resStr
		return (str)? str.replace(/\-/g, '/').replace(/T/, ' '): str
	}

	return {setThousandSep, convDateTime }
}