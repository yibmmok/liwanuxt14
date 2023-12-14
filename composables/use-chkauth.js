	/*********************************************************
	prog name: 檢查程式的權限, author: James Lin, date: 2023/01/22
	Todo: 1. 傳入參數->progress
	**********************************************************/	

import { useFetch, createFetch } from "@vueuse/core"
import queryString from "query-string"

export async function useChkauth(progID) {
	return new Promise((resolve, reject) => {
		let APIsvr = window.sessionStorage.getItem('liwaAPIsvr')
		let keydata = {
			'JWT': window.localStorage.getItem('liwaJWT'),
			'progID':progID
		}
		let sQuery = queryString.stringify(keydata)	
		let url = `${APIsvr}/sys_chkAuth.php?${sQuery}`
	
		useFetch(url, {method: 'GET'}, {refetch: true}).get().then((res) => { 
			// let datastr = res.data.value
			let objTmp = JSON.parse(res.data.value)
			if (objTmp.status === 'success') {
				resolve(res.data)
			} else {
				reject('回傳失誤')
			}
		})
	})
}