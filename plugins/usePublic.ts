import { defineNuxtPlugin } from '#app'

// export default defineNuxtPlugin(nuxtApp => {
export default defineNuxtPlugin(() => {
	return {
		provide: {
			setLocalStorage: (key = "", val = {}) => {
				window.localStorage.setItem(key, JSON.stringify(val))
			},
			setSessionStorage: (key = "", val = {}) => {
				window.sessionStorage.setItem(key, JSON.stringify(val))
			},			
			getLocalStorage: (key = "") => {
				const obj = JSON.parse(window.localStorage.getItem(key))
				if (!obj) {
					return {}
				}
				return obj
			},
			getSessionStorage: (key = "") => {
				const obj = JSON.parse(window.sessionStorage.getItem(key))
				if (!obj) {
					return {}
				}
				return obj
			},
			rmLocalStorage: (key = "") => {
				window.localStorage.removeItem(key)
			},
			rmSessionStorage: (key = "") => {
				window.sessionStorage.removeItem(key)
			},
			rmallLocalStorage: () => {
				window.localStorage.clear()
			},
			rmallSessionStorage: () => {
				window.sessionStorage.clear()
			} 
		}
	}
})