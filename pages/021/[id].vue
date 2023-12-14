<script setup lang="ts">
	/*********************************************************
	prog name: 物件明細CRUD, author: James Lin, date: 2020/04/19
	TODO: 完成存檔功能中加收費項目
	**********************************************************/
	import { ref, reactive, onMounted, computed, watch } from "vue"
	import { useFetch, createFetch, useTitle, useNow, useDateFormat } from "@vueuse/core"
	import queryString from "query-string"
	import banner from "../../components/banner"
	import liwaMsg from "../../components/liwaMsg.vue"
	import liwaUpload from "../../components/liwaUpload"
	import liwaScore from "../../components/liwaScore"
	import TinyMceEditor from "@tinymce/tinymce-vue"
	import liwaTbl from "../../components/liwaTbl"
	import liwaCalcTbl from "../../components/liwaCalcTbl"
	import { IconPlusLg, IconPersonPlusFill, IconGearFill, IconX, IconTrashFill, IconChevronContract, IconArrowRightCircleFill, IconAirplane } from '@iconify-prerendered/vue-bi'
	import gemSysData from "../../static/gemSys.json"

	const debug = ref(false)
	const mainID = ref('')
	const progName = ref('物件管理')
	const proglink = ref('/021')
	const detailFlg = ref(true)
	const detailName = ref('')
	const APIsvr = ref('')
	const liwaData = ref({})  // 主要物件檔
	const liwaD5 = ref([])	// 物件的來源產地選項
	const liwaD6 = ref([])	// 物件的寶石類別選項
	const liwaD7 = ref([])	// 物件的評分問題及選項
	const liwaD8 = ref([])	// 物件的金流資料

	const liwaDelPics = ref([]) // 用來刪除D3 附件用
	const liwaDelPDF = ref([]) // 用來刪除D4 附件用
	const liwaPics = ref([])    // 用來顯示物件圖檔用
	const liwaPDF = ref([])		// 用來顯示物件證書圖檔用
	const bNoBG = ref(false)

	const mainConfig = ref('')
	const action = ref('view')	// 上架模式的行動值
	const iScoreSet = ref(-1)	
	const bNuScore = ref(false)
	const bShowScoreOption = ref(true) // 是否顯示「顯示評分」選項
	const stitle = ref('')
	const submitted = ref(false)
	const step = ref('賣家設定')
	const stepNames = ref(['賣家設定', '基本資料', '設定評分', '上傳附圖及證書', '斡旋出價記錄'])
	const substep = ref('賣方作業')
	const substepNames = ref([{"Name":"賣方作業", "Class":"bg-red-700 text-white"},{"Name":"買方作業", "Class":"bg-gray-200 text-black"}, {"Name":"交易處理", "Class":"bg-gray-200 text-black"}])
	const sGemSys = ref('鑽石')
	const arrGemSys = ref([])
	const arrGemType = ref([])
	const arrOrigin = ref([])
	const arrStatus = ref([{'label':'上架', 'value':1}, {'label':'下架', 'value':0}, {'label':'斡旋', 'value':2}, {'label':'成交', 'value':9}
	])

	const sContent = ref('')  // 物件簡介編輯
	const imgInput = ref(null)  // 用於 tinyMCE編輯, 合約拍照圖
	const imgSellerContract = ref(null)	// 存放賣方合約圖形物件
	const sellerContractSrc = ref('') // 賣方合約圖形暫存物件
	const imgBiderContract = ref(null)	// 存放賣方合約圖形物件
	const biderContractSrc = ref('') // 賣方合約圖形暫存物件

	const isMsg = ref(false)  // 顯示訊息對話盒
	const isConfig = ref(false)	// 顯示設定對話盒
	const configStep = ref('產地設定')  // 設定對話盒的tabs
	const configStepNames = ['產地設定', '寶石種類設定', '收費項目設定', '倉位設定', '儲位設定']
	const mainBoxCSS = ref('block')

	const isB4Deal = ref(false)  // 顯示待成交對話盒
	const isB4DealTbl = ref(false)
	const liwaB4Deal = ref([])	// 待成交作業主要資料
	const sellerMailConfig = ref('')
	const biderMailConfig = ref('')
	const payMailConfig = ref('')
	const sWHID = ref('')	// 主要倉庫ID
	const sWHNM = ref('')	// 主要倉庫名稱
	const sStoreID = ref('')  // 主要儲位ID
	const storeNM = ref('')	// 主要儲位名稱
	const arrWH = ref([])	// 倉庫選項值
	const liwaStores = ref([])  //  主要儲位選項值

	const qryMember = ref('') // 查詢會員欄位
	const isMemberDlg = ref(false)
	const isMemberList = ref(false)
	const qry041MParam= ref('')

	const InitVal = ref({
		height: 400,
		language:"zh_TW",
		menubar: true,
		content_style:"../../assets/css/tinyMCE.css",
	    plugins: [
	    	'emoticons', 'fullscreen', 'lists', 'link', 'image', 'help', 'wordcount'
	    ],
	    fullscreen_native: true,
	    toolbar: 'fullscreen | undo redo | blocks |  forecolor backcolor | indent outdent | emoticons | link image | bold italic | help',
	    file_picker_callback: function(callback, value, meta) {
		  	if (meta.filetype == 'image') {
				imgInput.value.addEventListener('change', (e) => {	
					const file = e.target.files[0]
					const reader = new FileReader()
					reader.onload = (e) => {
						callback(e.target.result, { alt: ''})
					}
					reader.readAsDataURL(file)
				})
				imgInput.value.click()
			}
		},
	})	

	const handleImage = (e) => {
		let selectedImage = e.target.files[0]
		const reader = new FileReader()
		reader.onload = (e) => {
			sellerContractSrc.value = e.target.result
			liwaData.value.sellerContractPath = e.target.result
		}
		reader.readAsDataURL(selectedImage)
	}

	const handleImageB = (e) => {
		let selectedImage = e.target.files[0]
		const reader = new FileReader()
		reader.onload = (e) => {
			biderContractSrc.value = e.target.result
			liwaB4Deal.value.biderContractPath = e.target.result
		}
		reader.readAsDataURL(selectedImage)
		// console.log('liwaB4Deal =', liwaB4Deal.value)
	}	

	const loadData = async () => {
		let keydata = {
			'JWT': window.localStorage.getItem('liwaJWT'),
			'mainID': mainID.value
		}
		let sQuery = queryString.stringify(keydata)		
		let url = `${APIsvr.value}/021_haveDetail.php?${sQuery}`
		const data = await useFetch(url, {method: 'GET'}, {refetch: true}).get().json()
		liwaData.value = data.data.value.arrSQL[0]
		liwaData.value.action = 'view'
		liwaData.value.mainID = mainID.value
		liwaData.value.JWT = window.localStorage.getItem('liwaJWT')
		sGemType.value = liwaData.value.gemType
		detailName.value = liwaData.value.prodNM
		stitle.value = detailName.value + ' 的資料'
		sContent.value = liwaData.value.mktgDescp
		switch (Number(liwaData.value.hideScore)) {
			case -1:
				liwaData.value.lblHideScore = ''
				break;
			case 0:
				liwaData.value.lblHideScore = '顯示'
				break;
			case 1:
				liwaData.value.lblHideScore = '隱藏'
				break;
		}

		iScoreSet.value = liwaData.value.hideScore
		sWHID.value = liwaData.value.WHID
		sWHNM.value = liwaData.value.WHNM
		sStoreID.value = liwaData.value.storeID
		sellerContractSrc.value = liwaData.value.sellerContractPath
		// console.log('liwaData =', liwaData.value, 'iScoreSet =', iScoreSet.value)
	}

	const loadD3 = async () => {
		let keydata = {
			'JWT': window.localStorage.getItem('liwaJWT'),
			'mainID': mainID.value
		}
		let sQuery = queryString.stringify(keydata)		
		let url = `${APIsvr.value}/021_haveD3.php?${sQuery}`
		const dataD3 = await useFetch(url, {method: 'GET'}, {refetch: true}).get().json()
		liwaPics.value = dataD3.data.value.arrSQL
	}

	const loadD4 = async () => {
		let keydata = {
			'JWT': window.localStorage.getItem('liwaJWT'),
			'mainID': mainID.value
		}
		let sQuery = queryString.stringify(keydata)		
		let url = `${APIsvr.value}/021_haveD4.php?${sQuery}`
		const dataD4 = await useFetch(url, {method: 'GET'}, {refetch: true}).get().json()	
		liwaPDF.value = dataD4.data.value.arrSQL	
	}	

	const loadD5 = async () => {
		let keydata = {
			'JWT': window.localStorage.getItem('liwaJWT'),
		}
		let sQuery = queryString.stringify(keydata)		
		let url = `${APIsvr.value}/021_haveD5.php?${sQuery}`
		const dataD5 = await useFetch(url, {method: 'GET'}, {refetch: true}).get().json()	
		liwaD5.value = dataD5.data.value.arrSQL
		arrOrigin.value = [...liwaD5.value]
	}	

	const loadD6 = async () => {
		let keydata = {
			'JWT': window.localStorage.getItem('liwaJWT'),
		}
		let sQuery = queryString.stringify(keydata)		
		let url = `${APIsvr.value}/021_haveGemType.php?${sQuery}`
		const dataD6 = await useFetch(url, {method: 'GET'}, {refetch: true}).get().json()	
		liwaD6.value = dataD6.data.value.arrSQL
		arrGemType.value = [...liwaD6.value]
	}

	const loadD7 = async () => {
		let keydata = {
			'JWT': window.localStorage.getItem('liwaJWT'),
			'mainID': mainID.value
		}
		let sQuery = queryString.stringify(keydata)		
		let url = `${APIsvr.value}/021_haveD7.php?${sQuery}`
		const dataD7 = await useFetch(url, {method: 'GET'}, {refetch: true}).get().json()	
		liwaD7.value = dataD7.data.value.arrSQL
		if (liwaD7.value.length > 0) liwaData.value.D7 = [...liwaD7.value]
		// 評分後顯示分數
		if (bNuScore.value) iScoreSet.value = 0
	}

	// 載入 D8
	const loadD8 = async () => {
		let keydata = {
			'JWT': window.localStorage.getItem('liwaJWT'),
			'params': mainConfig.value,
			'action':'view'
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
	    const { data } = await useMyFetch('021_haveRevu.php').post().json()
	    if (data.value.arrSQL.length > 0) {
			liwaD8.value = data.value.arrSQL[0]		    	
	    }
	}

	const jumpAdd = () => {
		window.location.href = '/021/add'
	}

	const clearData = () => {
		let tmpData = {
			'action':'add',
			'JWT': window.localStorage.getItem('liwaJWT'),
			'mainID': '',
			'prodNM': '',
			'origin': '',
			'dealType': '',
			'color': '',
			'gemSys': 'A',
			'gemTypeID': '',
			'gemType': '',
			'material': '',
			'objForm': '',
			'sellPrice': 0,
			'expDate': '',
			'descp': '[材質]:\n[顏色]:\n[切割]:\n[尺寸]:   mm\n[重量]:  克\n',
			'mktgDescp':'',
			'certiMemo': '',
			'score': 0,
			'hideScore':-1,
			'lblHideScore':'顯示',
			'status': 1,
			'sellerID':'',
			'WHID':'',
			'storeID':'',
			'remainBargain': 3,
			'D3':liwaPics,
			'D4':liwaPDF,
			'D7':[],
			'D8':[]
		}
		action.value = 'add'
		detailName.value = '新增物件'
		stitle.value = '新增物件'
		iScoreSet.value = -1
		liwaData.value = tmpData
		isMemberDlg.value = true
	}

	//  設定 memberDlg starts
	const findMember = () => {
		if (qryMember.value) {
			isMemberList.value = false
			let keydata = {
				'qryData': qryMember.value
			}
			qry041MParam.value = JSON.stringify(keydata)
			isMemberList.value = true
		}
	}

	const toggleMemberDlg = () => {
		if (isMemberDlg.value == true) {
			qryMember.value = ''
			isMemberList.value = false
			qry041MParam.value = ''
		}
		isMemberDlg.value = !isMemberDlg.value
	}

	const setSellerID = (sID) => {
		liwaData.value.sellerID = sID
		qryMember.value = ''
		isMemberList.value = false
		qry041MParam.value = ''
		isMemberDlg.value = false
	}

	//  設定 memberDlg ends

	const UploadSellerContract = () => {
		imgSellerContract.value.click()
	}

	const UploadBiderContract = () => {
		imgBiderContract.value.click()
	}	

	const setScore = (state) => {
		// console.log('state =', state)
		// 只有未評分才重新設定評分
		liwaData.value.gemSys = state.gemSys
		liwaData.value.score = state.iTotal	
		liwaD7.value = []
		liwaD7.value = [...state.D7]
		liwaData.value.D7 = [...state.D7]
		bNuScore.value = true
	}

	const saveData = async () => {
		if (!(['A','C','D'].includes(liwaData.value.gemSys))) liwaData.value.gemSys = 'B'
		if (action.value == 'add') {
			liwaData.value.mainID = mainID.value
		}
		if (action.value == 'view') {
			action.value = 'edit'
		}
		if (action.value == 'edit')	{
			liwaData.value.D3 = liwaPics.value
			liwaData.value.D4 = liwaPDF.value
			liwaData.value.delD3 = liwaDelPics.value
			liwaData.value.delD4 = liwaDelPDF.value
		}
		// 若該物件本次已新評分過, 設定 hideScore
		if (liwaData.value.lblHideScore == '隱藏') 
			iScoreSet.value = 1
		else 
			iScoreSet.value = 0
			
		liwaData.value.action = action.value	
		liwaData.value.JWT = window.localStorage.getItem('liwaJWT')
		liwaData.value.mktgDescp = sContent.value
		liwaData.value.hideScore = iScoreSet.value
		liwaData.value.bNoBG = bNoBG.value
		liwaData.value.D8 = [...liwaD8.value]
		let datastr = JSON.stringify(liwaData.value)		
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
	    const { data } = await useMyFetch('021_edit.php').post().json()	    
	    if (!data.value.message) {
		    if (liwaData.value.action == 'add') {
		    	mainID.value = data.value.key
		    	window.location.href = '/021/' + mainID.value
		    } else {
		    	if (bNuScore.value) {
		    		loadD7()
		    		bNuScore.value = false
		    	}
		    }
		    liwaData.value.action = 'view'
		    showMsg('系統訊息', '存檔已完成', 2)
		    // alert('存檔已完成')	
	    } else {
	    	showMsg('存檔錯誤', data.value.message, 1)
	    }
	}

	const setMainPic = async (sPath) => {
		let iSrcLength = window.sessionStorage.getItem('liwaImgsvr').length
		let sPicPath = sPath.slice(iSrcLength)
		let keyData = {
			'JWT': window.localStorage.getItem('liwaJWT'),
			'prodID':mainID.value,
			'picpath': sPicPath
		}
		let datastr = JSON.stringify(keyData)	
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
	    const { data } = await useMyFetch('021_setMainPic.php').post().json()
	    if (!data.value.message) {
	    	liwaData.value.picpath = sPath
	    }
	}

	const printSellerContract = async () => {
		let keydata = {
			'JWT': window.localStorage.getItem('liwaJWT'),
			'sellerID': liwaData.value.sellerID,
			'prodID': mainID.value
		}
		let sQuery = queryString.stringify(keydata)		
		let url = `${APIsvr.value}/021_printSellerContract.php?${sQuery}`
		const data_ContractS = await useFetch(url, {method: 'GET'}, {refetch: true}).get().json()	
		let sMsg = data_ContractS.data.value.message
		if (sMsg) {
			showMsg('系統訊息', '產生賣家合約失敗, 請通知系統管理員', 2)
		} else {
			let sKey = data_ContractS.data.value.key
			window.open(APIsvr.value+sKey, '_blank')
		}
	}

	// 訊息對話盒及設定對話盒相關 starts	
	const objMsg = ref({
		title: '',
		body: '',
		modalType: ''
	})

	const showMsg = (sTitle, sBody, iType = 1) => {
  		objMsg.value.title = sTitle
  		objMsg.value.body = sBody
  		objMsg.value.modalType = iType
  		isMsg.value = true
	}

	const hideMsg = () => {
		isMsg.value = false
	}

	const confirmOK = () => {
		alert("Press the Confirm button")
		isMsg.value = false
	}
	
	const showConfig = () => {
		mainBoxCSS.value = 'hidden'
		isConfig.value = true
	}

	const hideConfig = () => {
		isConfig.value = false
		mainBoxCSS.value = 'block'
		if (action.value !== 'add') window.location.href = '/021/'+mainID.value
	}
	// 訊息對話盒及設定對話盒相關 ends

	const sGemType = computed(() => {
		let AA = ''
		if (liwaD6.value.length > 0) {
			let sID = liwaData.value.gemTypeID
			let res = liwaD6.value.filter((n) => n.value == sID)
			if (res.length > 0) {
				AA = res[0].label
			}
		}
		return AA
	})

	const sNuProdNM = computed(() => {
		let AA = ''
		
		AA = liwaData.value.origin + liwaData.value.dealType + liwaData.value.color + sGemType.value + liwaData.value.material + liwaData.value.objForm				
		return AA
	})

	const iStatus = computed(() => {
		let AA = ''
		switch (liwaData.value.status) {
			case 0:
				AA = '下架'
				break
			case 1:
				AA = '上架'
				break
			case 2:
				AA = '斡旋'
				break
			case 9:
				AA = '成交'
				break									
		}
		return AA
	})

	const setFiles = (arrFiles) => {
		if (liwaPics.value.length > 0) {
			// 先刪除 liwaPics 的所有elements
			for (let i=0; i<liwaPics.value.length; i++) {
				liwaPics.value.pop()
			}
		}
		liwaPics.value = [...arrFiles]
		if ((action.value=='add') && (mainID.value == '')) {  // 設定mainID
			let sTmpPath = liwaPics.value[0].substr(5, 13)
			mainID.value = sTmpPath
		}
	}

	const setDelPics = (objDF) => {
		// 將參數傳入 liwaDelPics中
		let sFilePath = objDF.filePath
		liwaDelPics.value.push(objDF.filePath)
		if (liwaPics.value.length > 0) liwaPics.value = []
		liwaPics.value = [...objDF.fileList]
	}

	const setPDFs = (arrFiles) => {
		if (liwaPDF.value.length > 0) {
			// 先刪除 liwaPics 的所有elements
			for (let i=0; i<liwaPDF.value.length; i++) {
				liwaPDF.value.pop()
			}
		}
		liwaPDF.value = [...arrFiles]
		if ((action.value=='add') && (mainID.value == '')) {  // 設定mainID
			let sTmpPath = liwaPDF.value[0].substr(5, 13)
			mainID.value = sTmpPath
		}		
	}

	const setDelPDFs = (objDF) => {
		// 將參數傳入 liwaDelPDF 中
		let sFilePath = objDF.filePath
		liwaDelPDF.value.push(objDF.filePath)
		if (liwaPDF.value.length > 0) liwaPDF.value = []
		liwaPDF.value = [...objDF.fileList]
	}

	const renewD5 = (arrD5) => {
		loadD5()
	}

	const renewD6 = (arrD6) => {
		loadD6()
	}	

	const renewD8 = (arrD8) => {
		// 更新物件收入資料
		liwaD8.value = []
		liwaD8.value = [...arrD8]
	}

	const showTblMsg = (sMsg) => {
		showMsg('錯誤訊息', sMsg, 2)
	}

	const resetScoreSet = async () => {
		// 先清掉 021_D7
		let keydata = {
			'JWT': window.localStorage.getItem('liwaJWT'),
			'mainID': mainID.value
		}
		let sQuery = queryString.stringify(keydata)		
		let url = `${APIsvr.value}/021_clearD7.php?${sQuery}`
		const dataClearD7 = await useFetch(url, {method: 'GET'}, {refetch: true}).get().json()	
		let msg = dataClearD7.data.value.message
		if (!msg) {
			iScoreSet.value = -1
			liwaData.value.gemSys = ''
		} else {
			showMsg('系統訊息', '重設評分錯誤: '+msg, 2)
		}
	}

	/* 以下為 待成交的處理 starts  */	
	const showB4Deal = () => {
		// 載入待成交作業主資料
		loadB4Deal()
	}

	const loadB4Deal = async () => {
		let imgSvr = window.sessionStorage.getItem('liwaImgsvr')
		let keydata = {
			'JWT': window.localStorage.getItem('liwaJWT'),
			'mainID': mainID.value
		}
		let sQuery = queryString.stringify(keydata)		
		let url = `${APIsvr.value}/021_haveB4Deal.php?${sQuery}`
		const dataB4D = await useFetch(url, {method: 'GET'}, {refetch: true}).get().json()
		liwaB4Deal.value = dataB4D.data.value.arrSQL[0]
		// liwaB4Deal.value.action = 'view'
		if (!liwaB4Deal.value.checkLocation) liwaB4Deal.value.checkLocation = '台北市大安區信義路三段162-6號1樓'
		sWHID.value = liwaB4Deal.value.WHID
		sWHNM.value = liwaB4Deal.value.WHNM
		sStoreID.value = liwaB4Deal.value.storeID
		storeNM.value = liwaB4Deal.value.storeNM
		biderContractSrc.value = liwaB4Deal.value.biderContractPath
		let keydata2 = {
			"mainID": mainID.value,
			"memberID": liwaB4Deal.value.sellerID,
			"sendStatus":1
		}
		sellerMailConfig.value = JSON.stringify(keydata2)
		let keydata3 = {
			"mainID": mainID.value,
			"memberID": liwaB4Deal.value.tmpBiderID,
			"sendStatus":2
		}
		biderMailConfig.value = JSON.stringify(keydata3)
		let keydata4 = {
			"mainID": mainID.value,
			"memberID": liwaB4Deal.value.tmpBiderID,
			"sendStatus":3
		}
		payMailConfig.value = JSON.stringify(keydata4)	
		isB4Deal.value = true
		isB4DealTbl.value = true
		// console.log('liwaB4Deal in loadB4Deal =', liwaB4Deal.value)
	}

	const loadWH = async () => {
		let keydata = {
			'JWT': window.localStorage.getItem('liwaJWT'),
		}
		let sQuery = queryString.stringify(keydata)		
		let url = `${APIsvr.value}/021_haveWH.php?${sQuery}`
		const dataDWH = await useFetch(url, {method: 'GET'}, {refetch: true}).get().json()	
		arrWH.value = dataDWH.data.value.arrSQL
	}

	const loadStores = async (WHID) => {
		let keydata = {
			'JWT': window.localStorage.getItem('liwaJWT'),
			'WHID':WHID
		}
		let sQuery = queryString.stringify(keydata)		
		let url = `${APIsvr.value}/021_haveStores.php?${sQuery}`
		const dataDStores = await useFetch(url, {method: 'GET'}, {refetch: true}).get().json()	
		liwaStores.value = dataDStores.data.value.arrSQL
	}	

	const getActvSubStep = (idx) => {
		substepNames.value.forEach((m) => m.Class="bg-gray-200 text-black")
		substep.value = substepNames.value[idx].Name
		substepNames.value[idx].Class = 'bg-red-700 text-white'
	}

	const resendMember = async (memberID, sendStatus) => {
		isB4DealTbl.value = false
		let keydata = {
			'JWT':window.localStorage.getItem('liwaJWT'),
			'mainID': mainID.value,
			'memberID': memberID,
			'sendStatus': sendStatus
		}
		let sQuery = queryString.stringify(keydata)		
		let url = `${APIsvr.value}/021_sendMember.php?${sQuery}`
		const dataD9A = await useFetch(url, {method: 'GET'}, {refetch: true}).get().json()
		let msg = dataD9A.data.value.message
		if (msg) {
			showMsg('寄信錯誤', msg, 2)
		}
		isB4DealTbl.value = true
	}

	const printBiderContract = async () => {
		let keydata = {
			'JWT': window.localStorage.getItem('liwaJWT'),
			'biderID': liwaB4Deal.value.tmpBiderID,
			'prodID': mainID.value
		}
		let sQuery = queryString.stringify(keydata)		
		let url = `${APIsvr.value}/021_printBiderContract.php?${sQuery}`
		const data_ContractB = await useFetch(url, {method: 'GET'}, {refetch: true}).get().json()	
		let sMsg = data_ContractB.data.value.message
		if (sMsg) {
			showMsg('系統訊息', '產生買家合約失敗, 請通知系統管理員', 2)
		} else {
			let sKey = data_ContractB.data.value.key
			window.open(APIsvr.value+sKey, '_blank')
		}
	}

	const saveDeal = async () => {
		liwaB4Deal.value.JWT = window.localStorage.getItem('liwaJWT')
		liwaB4Deal.value.WHID = sWHID.value
		liwaB4Deal.value.storeID = sStoreID.value
		liwaB4Deal.value.biderContractPath = biderContractSrc.value
		// console.log('liwaB4Deal in saveDeal =', liwaB4Deal.value)	
		let datastr = JSON.stringify(liwaB4Deal.value)
		// console.log('datastr =', datastr)		
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
	    const { data } = await useMyFetch('021_editDeal.php').post().json()
	    let msg = data.value.message
	    if (msg == '') {
			isB4Deal.value = false
			isB4DealTbl.value = false
			showMsg('系統訊息', '存檔成功', 2)
	    } else {
	    	showMsg('存檔錯誤', msg, 2)
	    }
	}

	const arrStores = computed(() => {
		let AA = []
		if (liwaB4Deal.value.WHID) {
			let res = liwaStores.value.filter((m) => m.WHID == liwaB4Deal.value.WHID)
			AA = res
		}
		return AA
	})

	const cancelDeal = async (iMode) => {
		// 取消交易; iMode = 1: 賣家逾期取消; iMode = 2: 買家逾期取消
		let keydata = {
			"JWT":window.localStorage.getItem('liwaJWT'),
			"mainID":mainID.value,
			"iMode":iMode
		}
		let datastr = JSON.stringify(keydata)
	// console.log('datastr =', datastr)		
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
	    const { data } = await useMyFetch('021_cancelDeal.php').post().json()
	    let msg = data.value.message
	    if (!msg) {
	    	window.location.href = `/021/${mainID.value}`
	    } else {
	    	showMsg('系統訊息', '交易取消錯誤: '+ msg + ';請聯絡系統管理員', 2)
	    }
	}
	/* 以下為 待成交的處理 ends  */	

	const setMainID = (sID) => {
		// console.log('sID =', sID)
	}

	const testProc = () => {
		showB4Deal()
	}

	watch(sWHID, (Val, oldVal) => {
		// 若 sWHID的值改變, 設定 liwaStores
		if (Val !== oldVal) {
			let timeout = setTimeout(() => {
				loadStores(Val)
			}, 500)
			liwaData.value.WHID = Val
		}
		if (liwaData.value.storeNM) storeNM.value = liwaData.value.storeNM
	})

	watch(sStoreID, (Val, oldVal) => {
		// 若 sStoreID的值改變, 將值設給 liwaData.storeID
		if (Val !== oldVal) {
			liwaData.value.storeID = Val
		}
	})

	onMounted(() => {
		useHead({title:'物件明細'})
		APIsvr.value = window.sessionStorage.getItem('liwaAPIsvr')
		// 取得 mainID, 由mainID取得
		const route = useRoute()
		mainID.value = route.params.id
		let keydata = {
			"mainID":mainID.value
		}
		mainConfig.value = JSON.stringify(keydata)
		//	由 mainID 取得資料
		loadD5()
		loadD6()
		loadD7()
		loadWH()
		// loadStores()
		if (mainID.value !== 'add') {
			loadD3()
			loadD4()
			// loadD8()
			loadData() 
			// loadWH()
		} else {
			clearData()
			const d = new Date()
			const mainID1 = useDateFormat(useNow(), 'MMDDHHmmss')
			mainID.value = mainID1.value + d.getMilliseconds()		
		}

		arrGemSys.value = gemSysData
	})

	// definePageMeta({
	//   layout: "default",
	//   colorMode: "light"
	// })		

</script>

<template>
<NuxtLayout name="default">
<banner
	v-if="detailName"
	:progname="progName"
	:proglink="proglink"
	:detailflg="detailFlg"
	:detailName="detailName"
></banner>	
<div class="w-full h-full flex flex-col justify-center items-center bg-slate-200">
	<div class="barPanel w-[95%] h-12 rounded-3xl mt-2 ml-4 mb-2 px-1 flex flex-row justify-between">
		<div class="w-1/12 lg:w-1/3 flex flex-row">
			<div class="top-icon add ml-4 -mt-1" @click="jumpAdd()">
				<IconPlusLg class="w-7 h-7 text-white font-bold" />
			</div>
			<div v-if="liwaData.status=='3'" class="top-icon ml-2 -mt-1 " @click="loadB4Deal()">
				<IconChevronContract class="w-7 h-7 text-white font-bold rotate-90" />
			</div>
			<div v-if="debug"
			class="top-icon ml-2 -mt-1" 
			@click="testProc()"
			>
				<IconAirplane class="w-7 h-7 text-white font-bold" />
			</div>			
		</div>
		<div class="w-10/12 lg:w-1/3 text-center">
			{{ stitle }}
		</div>
		<div class="w-1/12 lg:w-1/3 flex flex-row justify-end">
			<!-- 設定按鈕 -->
			<div class="hidden top-icon add ml-4 -mt-1" @click="showConfig()">
				<IconGearFill class="w-7 h-7 text-white font-bold" />
			</div>	
		</div>
	</div>
	<div class="w-full lg:w-[1024px]" :class="mainBoxCSS">
		<div v-if="detailName" class="bg-white m-2 rounded-xl py-1">
			<FormKit 
				form-class="px-4 py-2 bg-white rounded-2xl w-11/12"
				type="form"
				v-model="liwaData"
				:form-class="submitted? 'hidden': 'block'"
				style="margin: 1rem auto;"
				submit-label="存檔"
				@submit="saveData()"
			>
				<ul class="steps flex flex-row">
					<li
				    	v-for="stepName in stepNames"
				    	class="step w-1/5 text-center"
				    	@click="step = stepName"
				    	:data-step-active="step === stepName"
				    >
				    	{{ stepName }}
					</li>
				</ul>
				<div class="form-body">
					<section v-show="step == stepNames[0]">
						<div class="w-full flex flex-col lg:flex-row">
							<div class="w-full lg:w-1/2 flex flex-row justify-between">
								<div class="w-[calc(100%_-_3rem)]">
							        <FormKit
							          name="sellerID"
							          label="賣家ID *"
							          type="text"
							          help="請設定賣家ID"
							          validation="required|number"
							        />
								</div>
								<div class="w-12 h-12 ml-2 mt-6 cursor-pointer" @click="toggleMemberDlg()">
									<IconPersonPlusFill class="w-10 h-10 text-blue-500 font-bold" />
								</div>
							</div>
							<div class="w-full lg:w-1/2 lg:ml-8">
								<FormKit
						          name="sellPrice"
						          label="賣家期望價 *"
						          type="number"
						          placeholder="請輸入賣家期望價"
						          help="賣家期望價(必須大於0)"
						          validation="required|number|min:1"
						        />			
							</div>				
						</div>	
						<div class="w-full flex flex-col lg:flex-row">
							<div class="w-full lg:w-1/2">
						        <FormKit
						          name="status"
						          label="物件狀態 *"
						          type="select"
						          help="請選擇物件狀態"
						          :options="arrStatus"
						          validation="required"
						        />
							</div>
							<div class="w-full lg:w-1/2 lg:ml-8">
						        <FormKit
						          name="expDate"
						          label="刊登到期日 *"
						          type="date"
						          min="1960-01-01"
						          help="請輸入物件刊登到期日"
						          validation="required"
						        />							        
							</div>				
						</div>
						<div class="w-full">
					        <FormKit
					          name="adDateLimit"
					          label="廣告刊登到期日 "
					          type="date"
					          min="1960-01-01"
					          help="請輸入物件廣登刊登到期日"
					        />								
						</div>
						<div v-if="(liwaData.sellerID) && (action!=='add')" class="w-full flex flex-col">
							<div class="w-full flex flex-col lg:flex-row">
								<div class="w-full h-24 lg:w-1/2 px-8 pt-12 flex flex-row">
									<div class="w-36 px-4 py-2 rounded-xl bg-blue-500 text-center text-white cursor-pointer" @click="printSellerContract()">列印賣家合約</div>
								</div>
								<div class="w-full lg:w-1/2 lg:ml-8 flex flex-col">
									<div class="w-full py-2 text-sm text-slate-600"><strong>賣方合約</strong></div>
									<div class="w-[100px] h-[100px] border-2 border-slate-200 ">
										<div v-if="!liwaData.sellerContractPath" @click="UploadSellerContract()">
											<IconPlusLg class="w-[90px] h-[90px] text-slate-200 font-bold"  />
										</div>
										<div v-else>
											<img 
											class="mx-auto py-2"
											:src="sellerContractSrc" 
											height="100" 
											:alt="賣方合約" 
											@click="callDialog"
											/>
										</div>
									</div>
								</div>								
							</div>
							<p class="w-full px-8 my-4 text-slate-500 text-md">*** 設定物件存放位置及驗貨地點(若賣方選擇物件保管再填)  ***</p>
							<div class="w-full flex flex-col lg:flex-row">
								<div v-if="arrWH.length > 0" class="w-full px-8 flex flex-col lg:flex-row">
									<div class="w-full lg:w-1/2 relative">
								        <FormKit
								          label="倉庫名稱"
								          type="liwaDrop"
								          v-model="sWHID"
								          :sVal="sWHNM"
								          :arrOption="arrWH"
								          help="請設定倉庫名稱"
								        />
									</div>
									<div v-if="liwaStores.length > 0" class="w-full lg:w-1/2 lg:ml-8 relative">
										<FormKit
								          label="儲位名稱"
								          type="liwaDrop"
								          v-model="sStoreID"
								          :sVal="storeNM"
								          :arrOption="liwaStores"
								          help="請設定儲位名稱"
								        />
									</div>	
								</div>							
							</div>
						</div>
						<hr class="w-full h-[0.1px] border-b-[0.1px] border-gray-400 border-dotted my-3">
						<!-- 物件收費項目明細 -->
						<liwaCalcTbl
							:tblTitle="'物件收費明細'"
							:progID="'021_fee'"
							:viewUrl="'021_haveRevu.php'"
							:dataUrl="''"
							:params="mainConfig"
							:canEdit="true"
							@setList="renewD8"
							@sendMsg="showTblMsg"
							@setMainID="setMainID"	
						/>  
					</section>
					<section v-show="step == stepNames[1]">
						<div v-if="action !== 'add'" class="w-full text-md flex flex-col lg:flex-row mb-8">
							<div class="w-full lg:w-1/2">
								<div class="w-full border-2 border-gray-200">
									<img :src="liwaData.picpath" height="160">
								</div>
								<div class="w-full text-lg text-center">物件編號: {{ liwaData.prodID }}</div>
							</div>
							<div class="w-full lg:w-1/2 px-2 py-4">
								<div class="w-full h-[calc(100%_-_2rem)] bg-white flex flex-row flex-wrap overflow-x-hidden overflow-y-auto">
									<div v-for="(pic, index) in liwaPics" class="w-24 h-24 m-4 "
									@click="setMainPic(pic)"
									>
										<img :src="pic" class="w-full h-full">
									</div>
								</div>
							</div>
						</div>
						<div v-if="isConfig==false" class="w-full flex flex-col lg:flex-row">
							<div v-if="arrOrigin.length > 0" class="w-full lg:w-1/2 relative">
								<FormKit
						          name="origin"
						          label="產地"
						          type="liwaDrop"
						          help="請選擇物件的產地"
						          :sVal="liwaData.origin"
						          :arrOption="arrOrigin"
						        />
							</div>
							<div class="w-full lg:w-1/2 lg:ml-8">
						        <FormKit
						          name="dealType"
						          label="處理方式"
						          type="text"
						          help="請輸入物件的處理方式"
						        />
							</div>				
						</div>
						<div v-if="isConfig==false" class="w-full flex flex-col lg:flex-row">
							<div class="w-full lg:w-1/2">
								<FormKit
						          name="color"
						          label="顏色"
						          type="text"
						          help="請輸入物件顏色"
						        />
							</div>
							<div v-if="arrGemType.length > 0" class="w-full lg:w-1/2 lg:ml-8 relative">
						        <FormKit
						          name="gemTypeID"
						          label="主石種類"
						          type="liwaCombo"
						          help="請選擇物件主要種類, 可於本欄輸入關鍵字縮小下拉列表選項"
						          :sVal="sGemType"
						          :arrOption="arrGemType"
						        />
							</div>				
						</div>	
						<div class="w-full flex flex-col lg:flex-row">
							<div class="w-full lg:w-1/2">
								<FormKit
						          name="material"
						          label="鑲台配石"
						          type="text"
						          placeholder="請輸入材質"
						          help="請輸入物件材質(如k金)"
						        />
							</div>
							<div class="w-full lg:w-1/2 lg:ml-8">
						        <FormKit
						          name="objForm"
						          label="物件形式"
						          type="text"
						          placeholder="請輸入物件形式"
						          help="請輸入物件形式(如手鐲)"
						        />
							</div>				
						</div>	
						<FormKit
				          name="prodNM"
				          label="物件名稱*"
				          type="text"
				          v-model="sNuProdNM"
				          help="預設為系統自動產生, 亦可以於本欄修改"
				          validation="required"
				        />
						<hr class="w-full h-[0.1px] border-b-[0.1px] border-gray-400 border-dotted my-3">
						<div class="w-full">
							<FormKit
								name="descp"
								label="物件規格"
								type="textarea"
								help="請輸入物件規格"
							/>
						</div>  
						<div class="w-full h-[450px]">
							<div class="w-full h-8 text-sm font-bold text-slate-800">廣告文案</div>
							<div class="w-full h-full">
								<TinyMceEditor api-key="fkoaqldrjeuygn6wbe51uchydhzrhufgs8a9tt6yehn106uo" 
								:init="InitVal"
								ref="liwaEditor"
								v-model="sContent"
								/>
							</div>
						</div> 													
				        <FormKit
				          name="certiMemo"
				          label="鑑定師意見 *"
				          type="textarea"
				          help="請輸入鑑定師意見"
				          validation="required"
				        />
					</section>
					<section v-show="step == stepNames[2]" class="min-h-[calc(100vh_-_30rem)]">
						<div class="w-full my-1 flex flex-row justify-between">
<!-- 							<div v-if="arrGemSys.length > 0" class="w-[300px] mx-auto">
								<FormKit
									name="gemSys"
									label="所屬館別"
									type="select"
									:options="arrGemSys"
									help="設定物件所屬館別, 未評分時, 非屬鑽石、翡翠、軟玉的物件一律歸為彩寶, 評分時依物件大類設定, 以免評分出錯"
								/>								
							</div> -->
							<div v-if="Number(liwaData.status) < 2" class="w-24 h-8 mt-4 px-3 py-1 bg-red-400 text-white rounded-full cursor-pointer" @click="resetScoreSet()">重設評分</div>
						</div>
						<div v-if="iScoreSet==-1" class="w-full my-4">

								<liwaScore 
									@setScore="setScore"
								/>								

						</div>
						<!-- <div v-if="(iScoreSet == 0) || ($iScoreSet == 1)"> -->
						<div v-else>	
							<h2 class="w-full text-2xl font-bold">評分結果:<span class="text-2xl text-blue-500 font-semibold ml-2">{{ liwaData.score }}</span></h2>
							<div v-if="liwaData.score > 0">
								<div v-for="(item, index) in liwaD7"
									class="w-full h-auto my-4 pl-4"
								>
									{{ item.Ques }}:{{ item.Ans }}
								</div>								
							</div>
						</div>
						<!-- 無評分不需顯示以下選項 -->
						<div v-if="bShowScoreOption" class="w-full py-2">
					        <FormKit
					          name="lblHideScore"
					          label="是否隱藏評分"
					          type="radio"
					          outer-class="w-[95%]"
					          :options="['顯示', '隱藏']"
					          help="請選擇是否隱藏評分"
					        />								
						</div>						
					</section>
					<section v-show="step == stepNames[3]">
						<div class="w-full my-8 flex flex-col">
							<liwaUpload 
								:mainID="mainID" 
								:liwaFiles="liwaPics"
								:imgboxCSS="'h-96'"
								:fieldLabel="'上傳附圖'"
								:phpurl="'/testUpload.php'"
								:sAccept="'image/*'"
								@setFiles="setFiles"
								@setDelete="setDelPics"
							/>
							<FormKit 
								label="圖片去背"
								v-model="bNoBG"
								type="checkbox"
								:value="false"
								help="勾選本欄可以將本次新增的圖片去背"
								:wrapper-class="'flex flex-row'"
								:inner-class="'border-0 w-4'"
								:label-class="'ml-2'"
							/>					
						</div>
						<div class="w-full mb-4">
							<liwaUpload 
								:mainID="mainID" 
								:liwaFiles="liwaPDF"
								:imgboxCSS="'h-96'"
								:fieldLabel="'上傳證書'"
								:phpurl="'/testUpload.php'"
								:sAccept="'image/*'"
								@setFiles="setPDFs"
								@setDelete="setDelPDFs"
							/>					
						</div>
					</section>
					<section v-show="step == stepNames[4]">
						<div class="w-full">
							<liwaTbl 
								:tblTitle="'斡旋出價記錄'"
								:progID="'021_haveD1'"
								:viewUrl="'021_haveD1.php'"
								:dataUrl="''"
								:params="mainConfig"
								:canEdit="false"
								@setList="renewD1"
								@sendMsg="showTblMsg"
							/>							
						</div>
						<FormKit
							name="remainBargain"
							label="買方剩餘出價次數"
							type="number"
							min="0"
							max="3"
							help="本次斡旋買方剩餘出價次數, 無必要請勿任意更改本欄位"
						/>
						<div class="w-full mt-4">得標買家會員編號: {{ liwaData.biderID }}</div>
					</section>		
				</div>
			</FormKit>
		</div>
	</div>
</div>
	<div class="invisible">
		<input 
			id="imgInput" 
			ref="imgInput" 
			class="w-11/12 h-8 bg-grey-100 hidden" 
			type="file" 
			accept="image/*"  
		/>		
	</div>
	<div class="invisible">
		<input 
			id="imgSellerContract" 
			ref="imgSellerContract" 
			class="w-11/12 h-8 bg-grey-100 hidden" 
			type="file" 
			accept="image/*" 
			@change.stop="handleImage" 
		/>		
	</div>	
	<div class="invisible">
		<input 
			id="imgBiderContract" 
			ref="imgBiderContract" 
			class="w-11/12 h-8 bg-grey-100 hidden" 
			type="file" 
			accept="image/*" 
			@change.stop="handleImageB" 
		/>		
	</div>		
	<Teleport to="body">
		<div v-if="isB4Deal == true" class="w-full absolute top-[130px] left-0 bg-slate-100 z-[500]">
			<div class="w-full lg:w-[1024px] lg:mx-auto relative" :class="mainBoxCSS">
				<div class="absolute top-2 right-4" @click="isB4Deal = false">
					<IconX class="w-11 h-11 text-red-400 font-bold" />
				</div>
				<div class="w-full mx-auto bg-gray-200 m-2 rounded-xl py-1">
					<div class="w-full h-12 box-border px-2 py-3 text-center text-xl bg-white">待成交作業</div>
					<div class="w-full my-2 p-2 flex flex-row justify-start rounded-lg bg-white">
						<div v-for="(objTab, index) in substepNames" 
							class="w-24 h-12 py-3 text-center border-r-2 border-white cursor-pointer" :class="objTab.Class"
							@click="getActvSubStep(index)"
						>
							{{ objTab.Name }}
						</div>
					</div>
					<div class="w-full mt-2 px-4">
						<FormKit 
							form-class="mx-4 px-4 py-2 box-border bg-white rounded-2xl w-full"
							type="form"
							v-model="liwaB4Deal"
							:form-class="submitted? 'hidden': 'block'"
							style="margin: 1rem auto;"
							submit-label="存檔(待成交作業)"
							@submit="saveDeal()"
						>
							<section v-show="substep == substepNames[0].Name">
								<h1 class="text-xl my-2 ml-8">通知賣家提供物件</h1>
								<div class="w-[calc(100%_-_4rem)] box-border mx-8 mb-8 px-4 text-md text-slate-700 bg-gray-200">
									<p class="py-2">處理步驟:</p>
									<p class="py-1">1. 在期限前通知賣家將物件送來保管供備驗</p>
									<p class="py-1">2. 如果賣家將物件送達後, 登記存放倉位及儲位</p>
									<p class="py-1">3. 如果賣家逾期未送驗, 按下「逾期」按鈕, 取消本次交易。</p>
								</div>								
								<div v-if="isB4DealTbl==true" class="w-full my-2 px-8 box-border">
								<!-- 賣家通知記錄 -->
									<liwaTbl 
										:tblTitle="'賣家通知記錄'"
										:progID="'021_sellerMail'"
										:viewUrl="'021_haveD9.php'"
										:dataUrl="''"
										:params="sellerMailConfig"
										:canEdit="false"
										@setList="renewD9"
										@sendMsg="showTblMsg"
									/>									
								</div>
								<div class="w-full my-4 px-8">
									<div class="w-32 px-4 py-2 bg-blue-600 rounded-xl text-white text-center cursor-pointer" @click="resendMember(liwaData.sellerID, 1)">重發通知信</div>
								</div>
								<div class="w-full px-8 flex flex-col lg:flex-row">
									<div class="w-full lg:w-1/2">
								        <FormKit
								          name="deliverDeadline"
								          label="送驗截止日"
								          type="date"
								          help="請設定送驗截止日"
								        />
									</div>
									<div class="w-full lg:w-1/2 lg:ml-8">
										<FormKit
								          name="deliverDate"
								          label="送驗日期"
								          type="datetime-local"
								          help="請設定送驗日期"
								        />									
									</div>
								</div>
								<p class="w-full px-8 my-4 text-slate-500 text-md">*** 設定物件存放位置及驗貨地點, 用於買家通知信 ***</p>
								<div class="w-full flex flex-col lg:flex-row">
									<div v-if="arrWH.length > 0" class="w-full px-8 flex flex-col lg:flex-row">
										<div class="w-full lg:w-1/2 relative">
									        <FormKit
									          label="倉庫名稱"
									          type="liwaDrop"
									          v-model="sWHID"
									          :sVal="sWHNM"
									          :arrOption="arrWH"
									          help="請設定倉庫名稱"
									        />
										</div>
										<div v-if="liwaStores.length > 0" class="w-full lg:w-1/2 lg:ml-8 relative">
											<FormKit
									          label="儲位名稱"
									          type="liwaDrop"
									          v-model="sStoreID"
									          :sVal="storeNM"
									          :arrOption="liwaStores"
									          help="請設定儲位名稱"
									        />
										</div>		
									</div>
								</div>
								<div class="py-2 px-8">
									<FormKit
							          name="checkLocation"
							          label="驗貨地點"
							          type="text"
							          help="請設定驗貨地點"
							        />
								</div>								
								<p class="w-full px-8 my-4 text-red-500 text-md">***  如果賣家逾期不交付物件, 請直接取消交易!  ***</p>
								<div class="w-full px-8">
									<div class="w-24 my-4 px-4 py-2 rounded-xl bg-orange-500 text-white cursor-pointer" @click="cancelDeal(1)">取消交易</div>
								</div>
								<hr class="mb-8">
							</section>
							<section v-show="substep == substepNames[1].Name">
								<h1 class="text-xl my-2 ml-8">通知買家前來驗貨</h1>
								<div class="w-[calc(100%_-_4rem)] box-border mx-8 mb-8 px-4 text-md text-slate-700 bg-gray-200">
									<p class="py-2">處理步驟:</p>
									<p class="py-1">1. 在期限前通知買家前來檢驗物件</p>
									<p class="py-1">2. 買家來驗貨時, 登記驗貨時間及地點</p>
									<p class="py-1">3. 如果買家逾期未來驗貨, 按下「逾期」按鈕, 取消本次交易。</p>
								</div>	
								<div v-if="isB4DealTbl==true" class="w-full my-2 px-8 box-border">
								<!-- 買家通知記錄 -->
									<liwaTbl 
										:tblTitle="'買家通知記錄'"
										:progID="'021_biderMail'"
										:viewUrl="'021_haveD9.php'"
										:dataUrl="''"
										:params="biderMailConfig"
										:canEdit="false"
										@setList="renewD9"
										@sendMsg="showTblMsg"
									/>									
								</div>
								<div class="w-full my-4 px-8">
									<div class="w-36 px-4 py-2 bg-blue-600 rounded-xl text-white text-center cursor-pointer" @click="resendMember(liwaB4Deal.tmpBiderID, 2)">重發買家通知信</div>
								</div>
								<div class="w-full px-8 flex flex-col lg:flex-row">
									<div class="w-full lg:w-1/2">
								        <FormKit
								          name="checkDeadline"
								          label="驗貨截止日"
								          type="date"
								          help="請設定驗貨截止日"
								        />
									</div>
									<div class="w-full lg:w-1/2 lg:ml-8">
										<FormKit
								          name="checkDate"
								          label="驗貨日期"
								          type="datetime-local"
								          help="請設定驗貨日期"
								        />									
									</div>
								</div>
								<div class="w-full px-8 flex flex-col">
									<div class="w-36 px-4 py-2 rounded-xl bg-blue-500 text-center text-white cursor-pointer" @click="printBiderContract()">列印買家合約</div>
								</div>
								<div class="w-full px-8 flex flex-col lg:flex-row">
									<div class="w-full lg:w-1/2 flex flex-col">
										<div class="w-full py-2 text-sm text-slate-600"><strong>買方合約</strong></div>
										<div class="w-[100px] h-[100px] border-2 border-slate-200 border-dashed">
											<div v-if="!liwaB4Deal.biderContractPath" @click="UploadBiderContract()">
												<IconPlusLg class="w-[90px] h-[90px] text-slate-200 font-bold" />
											</div>
											<div v-else>	
												<img 
													class="mx-auto py-2"
													:src="biderContractSrc"
													height="100" 
													:alt="買方合約" 
												/>	
											</div>
										</div>	
									</div>
									<div class="w-full lg:w-1/2">
								        <FormKit
								          name="biderContractDate"
								          label="買方合約簽訂日"
								          type="date"
								          help="請設定買方合約簽訂時間"
								        />
									</div>									
								</div>								
								<div class="w-full px-8 flex flex-col">
									<p class="w-full pt-4 my-4 text-red-500 text-md">***  如果買家驗貨反悔, 請直接取消交易!  ***</p>
									<div class="w-full py-2">
										<div class="w-32 my-4 px-4 py-2 rounded-xl bg-orange-500 text-center text-white cursor-pointer" @click="cancelDeal(2)">取消交易</div>
									</div>
								</div>	
								<hr class="mb-8">		
							</section>	
							<section v-show="substep == substepNames[2].Name">
								<h1 class="text-xl my-2 ml-8">完成付款及交易</h1>
								<div class="w-[calc(100%_-_4rem)] box-border mx-8 mb-8 px-4 text-md text-slate-700 bg-gray-200">
									<p class="py-2">處理步驟:</p>
									<p class="py-1">1. 設定付款截止日並於買家付款後設定付款日期, 並交付物件</p>
									<p class="py-1">2. 若買家於付款截止日仍未付清餘額, 按下「買家棄標」按鈕</p>
									<p class="py-1">3. 撥款日設定為交貨日後一週, 系統會依撥款日自動撥款。</p>
								</div>									
								<div class="my-4 px-8">待付金額: {{ liwaB4Deal.remainAmt }}</div>
								<div v-if="isB4DealTbl==true" class="w-full my-2 px-8 box-border">
								<!-- 付款通知記錄 -->
									<liwaTbl 
										:tblTitle="'付款通知記錄'"
										:progID="'021_dealMail'"
										:viewUrl="'021_haveD9.php'"
										:dataUrl="''"
										:params="payMailConfig"
										:canEdit="false"
										@setList="renewD9"
										@sendMsg="showTblMsg"
									/>									
								</div>
								<div class="w-full my-4 px-8">
									<div class="w-36 px-4 py-2 bg-blue-600 rounded-xl text-white text-center cursor-pointer" @click="resendMember(liwaB4Deal.tmpBiderID, 3)">重發交易通知信</div>
								</div>								
								<div class="w-full my-4 px-8 flex flex-col lg:flex-row">
									<div class="w-full lg:w-1/2">
								        <FormKit
								          name="payDeadline"
								          label="付款截止日"
								          type="date"
								          help="請設定付款截止日"
								        />
									</div>
									<div class="w-full lg:w-1/2 lg:ml-8">
										<FormKit
								          name="payDate"
								          label="付款日期"
								          type="datetime-local"
								          help="請設定付款日期"
								        />									
									</div>
								</div>	
								<div class="w-full my-4 px-8">
									<div class="w-32 px-4 py-2 rounded-xl bg-orange-500 text-white text-center" @click="cancelDeal(3)">買家棄標</div>
								</div>
								<div class="w-full my-4 px-8 flex flex-col lg:flex-row">
									<div class="w-full lg:w-1/2">
								        <FormKit
								          name="dealDate"
								          label="交貨日"
								          type="datetime-local"
								          help="請設定實際交貨日"
								        />
									</div>
									<div class="w-full lg:w-1/2 lg:ml-8">
										<FormKit
								          name="closeDeadline"
								          label="撥款日期"
								          type="datetime-local"
								          help="如需調整, 請另外設定撥款日期"
								        />									
									</div>
								</div>
								<div class="w-full mt-4 mb-12 px-8 flex flex-col lg:flex-row">
									<div class="w-full lg:w-1/2">
										實際撥款日: {{ liwaB4Deal.closeDate }}
									</div>
									<div class="w-full lg:w-1/2 lg:ml-8">
										最終成交價: {{ liwaB4Deal.donePrice }}
									</div>									
								</div>
								<hr class="mb-8">				
							</section>
						</FormKit>
					</div>
				</div>
			</div>
		</div>
	</Teleport>
	<Teleport to="body">
		<div v-if="isMsg" 
			class="w-full h-full fixed top-0 left-0 bg-slate-100 z-[500]"
		>
			<liwaMsg 
			  	:msgTitle="objMsg.title"
			  	:msgBody="objMsg.body"
			  	:modalType="objMsg.modalType"
			  	@hideMsg="hideMsg"
			  	@confirmOK="confirmOK"
			/> 			
		</div>		
	</Teleport>	
	<Teleport to="body">
		<div v-if="isMemberDlg" class="w-[100vw] absolute top-0 left-0 bg-transparent z-[500]">
			<div class="w-full h-full bg-transparent relative">
				<div class="w-full lg:w-[900px] lg:mx-auto mt-[200px] bg-white">
					<div class="w-full min-h-[50vh] bg-white flex flex-col relative opacity-100 border-2 border-slate-400">
						<div class="w-full h-12 pt-3 text-white text-center bg-violet-800 relative">查詢會員編號</div>
						<div class="w-full h-24 px-8 py-2 flex flex-row justify-between">
							<div class="w-[calc(100%_-_4rem)]">
								<FormKit
									type="text"
									label="會員手機或姓名"
									v-model="qryMember"
									placeholder="請輸入手機或部份姓名"
									help="查詢會員編號, 請輸入會員手機或姓名, 可輸入部份"
									@keyup.stop.enter="findMember()"
								/>
							</div>
						</div>
						<div class="w-[calc(100%_-_5px)] min-h-[240px] px-[1px] border-[0.5px] border-gray-300">
							<div v-if="isMemberList" class="w-full">
								<liwaTbl
									:tblTitle="會員查詢結果列表"
									:progID="'021_haveMember'"
									:viewUrl="'021_have041M.php'"
									:dataUrl="''"
									:params="qry041MParam"
									:canEdit="false"
									@setMainID="setSellerID"
									@sendMsg="showTblMsg"
								/>
							</div>							
						</div>
						<div class="w-8 h-8 bg-white absolute top-2 right-2 cursor-pointer" @click="toggleMemberDlg()">
							<IconX class="w-7 h-7 mt-[2px] ml-[1px] text-red-400 font-bold" />							
						</div>
					</div>
				</div>
			</div>
		</div>
	</Teleport>
</NuxtLayout>
</template>

<style scope>
	@import "../../assets/css/multistep-form.css";

	.formkit-option {
		width:33%;
		float:left;
	}

	.submitClass {
		margin-left: 1rem;
	}


</style>