<script setup lang="ts">
	import { ref, reactive, onMounted } from "vue"
	import { useStorage, useTitle, useTimestamp, useFetch } from "@vueuse/core"
	import * as d3 from 'd3'
	import queryString from "query-string"

	const APIsvr = ref('')
	const progName = ref('團隊儀表板')
	const detailFlg = ref(false)
	const detailKey = ref('')
	const actvIdx = ref('')

	const barChart = ref(null)
	const pieChart = ref(null)
	const lineChart = ref(null)
	const legendPie = ref([])
	const legendBar = ref([])
	const legendLine = ref([])
	const barData = ref({})
	const pieData = ref({})
	const lineData = ref({})
	const lineLegendNM = ref(['北區', '中區', '南區'])

	const loadBarData = async () => {
		let keydata = {
			'JWT':window.localStorage.getItem('liwaJWT')
		}
		let sQuery = queryString.stringify(keydata)
		let url = `${APIsvr.value}/P01_haveBar.php?${sQuery}`
		const dataBar = await useFetch(url, {method: 'GET'}, {refetch: true}).get().json()
		barData.value = dataBar.data.value.arrSQL	
		barData.value.forEach((m) => m.value = parseInt(m.value))
		if (barData.value.length > 0) drawHBarChart(400, 500, barData.value, '模組名稱', '筆')
	}

	const loadPieData = async () => {
		let keydata = {
			'JWT':window.localStorage.getItem('liwaJWT')
		}
		let sQuery = queryString.stringify(keydata)
		let url = `${APIsvr.value}/P01_havePie.php?${sQuery}`
		const dataPie = await useFetch(url, {method: 'GET'}, {refetch: true}).get().json()
		pieData.value = dataPie.data.value.arrSQL	
		if (pieData.value.length > 0) drawPieChart(400, 400, pieData.value)
	}

	const loadLineData = async () => {
		let keydata = {
			'JWT':window.localStorage.getItem('liwaJWT')
		}
		let sQuery = queryString.stringify(keydata)
		let url = `${APIsvr.value}/P01_haveLine.php?${sQuery}`
		const dataLine = await useFetch(url, {method: 'GET'}, {refetch: true}).get().json()
		lineData.value = dataLine.data.value.arrSQL	
		lineData.value.forEach((n) => n.value = parseInt(n.value))
	}	

	const drawBarChart = (w1, h1, arrData, xUnit, yUnit) => {
		const dataB = arrData
		// 圖表尺寸
		const margin = { top: 30, right: 30, bottom: 50, left: 60 }
		const width = w1 - margin.left + margin.right
		const height = h1 - margin.top - margin.bottom
		// 顏色
		const color = d3.scaleOrdinal()
		    .range(d3.schemeCategory10)
		// x 軸比例尺
		const x = d3.scaleBand()
			.domain(dataB.map(d => d.label))
			.range([0, width])
			.padding(0.1)
		// y 軸比例尺
		const y = d3.scaleLinear()
			.domain([0, d3.max(dataB, d => d.value)])
			.nice()
			.range([height, 0])		
		// X 軸
		const xAxis = d3.axisBottom(x)
		// Y 軸
		const yAxis = d3.axisLeft(y)	
		// SVG 元素
		const svg = d3.select(barChart.value)
			.append('svg')
			.attr('width', width + margin.left + margin.right)
			.attr('height', height + margin.top + margin.bottom +80)
			.append('g')
			.attr('transform', `translate(${margin.left},${margin.top+80})`)
		// 加入 X 軸
		svg.append('g')
			.attr('class', 'x-axis')
			.attr('transform', `translate(0, ${height})`)
			.call(xAxis)
			.append('text')
			.attr('x', width / 2)
			.attr('y', 30)
			.attr('fill', '#000')
			.attr('text-anchor', 'middle')
			.text(xUnit)	
			
		// 加入 Y 軸
		svg.append('g')
			.attr('class', 'y-axis')
			.call(yAxis)
			.append('text')
			.attr('transform', 'rotate(-90)')
			.attr('y', -50)
			.attr('x', -height / 2)
			.attr('dy', '0.71rem')
			.attr('fill', '#000')
			.attr('text-anchor', 'middle')
			.text(yUnit)	

		// 繪製長條
		let bars = svg.selectAll('rect')
			.data(dataB)
			.enter()
			.append('g')

		bars.append('rect')
			.attr('class', 'bar')
			.attr('x', d => x(d.label))
			.attr('y', d => y(d.value))
			.attr('width', x.bandwidth())
			.attr('height', d => height - y(d.value))
			.attr('fill', d => {
			  const colorValue = color(d.label);
			  legendBar.value.push({ label: d.label, color: colorValue });
			  return colorValue;
			})		

		bars.append('text')
			.text(d => d.value)
			.attr('x', d => x(d.label) + x.bandwidth() / 2 - 10)
			.attr('y', d => y(d.value) - 5)
			.attr('font-size', '12px')		
	}

	const drawHBarChart = (w1, h1, arrData, xUnit, yUnit) => {
      // 数据
      const dataH = arrData

      // 图表尺寸
      const margin = { top: 30, right: 30, bottom: 30, left: 60 }
      const width = w1 - margin.left - margin.right
      const height = h1 - margin.top - margin.bottom

      // 颜色
      const color = d3.scaleOrdinal()
        .range(d3.schemeCategory10)
      // x 轴比例尺
      const x = d3.scaleLinear()
        .domain([0, d3.max(dataH, d => d.value)])
        .nice()
        .range([0, width])
      // y 轴比例尺
      const y = d3.scaleBand()
        .domain(dataH.map(d => d.label))
        .range([0, height])
        .padding(0.1)
      // X 轴
      const xAxis = d3.axisBottom(x)
      // Y 轴
      const yAxis = d3.axisLeft(y)
      // SVG 元素
      const svg = d3.select(barChart.value)
        .append('svg')
        .attr('width', width + margin.left + margin.right )
        .attr('height', height + margin.top + margin.bottom )
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top-40})`)
      // 添加 X 轴
      svg.append('g')
        .attr('class', 'x-axis')
        .attr('transform', `translate(0, ${height})`)
        .call(xAxis)
        .append('text')
        .attr('x', width / 2)
        .attr('y', 30)
        .attr('fill', '#000')
        .attr('text-anchor', 'middle')
        .text(xUnit)
      // 添加 Y 轴
      svg.append('g')
        .attr('class', 'y-axis')
        .call(yAxis)
        .append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', -50)
        .attr('x', -height / 2)
        .attr('dy', '0.71em')
        .attr('fill', '#000')
        .attr('text-anchor', 'middle')
        .text(yUnit)
      // 绘制长条
      let bars = svg.selectAll('rect')
        .data(dataH)
        .enter()
        .append('g')

      bars.append('rect')
      	.attr('class', 'bar')
        .attr('x', 0)
        .attr('y', d => y(d.label))
        .attr('width', d => x(d.value))
        .attr('height', y.bandwidth())
        .attr('fill', d => {
          const colorValue = color(d.label);
          legendBar.value.push({ label: d.label, color: colorValue });
          return colorValue;
        })        

      bars.append('text')
      	.text(d => d.value)
      	.attr('x', d => x(d.value) + 5)
      	.attr('y', d => y(d.label) + y.bandwidth() / 2)
      	.attr('dy', '0.35em')
	}

	const drawPieChart = (w1, h1, arrData) => {
      // 資料
      const dataP = arrData

      // 圓形圖的尺寸
      const radius = Math.min(w1, h1) / 2

      // 顏色
      const color = d3.scaleOrdinal()
        .range(d3.schemeCategory10)

      // D3 pie 函數
      const pie = d3.pie()
        .value(d => d.value)

      // 弧生成函數
      const arc = d3.arc()
        .innerRadius(0)
        .outerRadius(radius)

      // SVG 元素
      const svg = d3.select(pieChart.value)
        .append('svg')
        .attr('width', w1)
        .attr('height', h1)
        .append('g')
        .attr('transform', `translate(${w1 / 2},${h1 / 2})`)        

      // 圓形圖的片段
      const arcs = svg.selectAll('arc')
        .data(pie(dataP))
        .enter()
        .append('g')
        .attr('class', 'arc')

      // 繪製圓形圖
      arcs.append('path')
        .attr('d', arc)
        .attr('fill', d => {
          const colorValue = color(d.data.label);
          legendPie.value.push({ label: d.data.label, color: colorValue })
          return colorValue
        });

      // 加入文字標籤
      arcs.append('text')
        .attr('transform', d => `translate(${arc.centroid(d)})`)
        .attr('text-anchor', 'middle')
        .text(d => d.data.label)    
  }	

	const drawlineChart = (w1, h1, arrData, xUnit, yUnit) => {
      // 資料
      const dataL = arrData

      // 圖表尺寸
      const margin = { top: 80, right: 30, bottom: 50, left: 60 }
      const width = w1 - margin.left - margin.right
      const height = h1 - margin.top - margin.bottom

      // 顏色
      const color = d3.scaleOrdinal()
        .range(d3.schemeCategory10)

      // x 軸比例尺
      const x = d3.scaleBand()
        .domain(dataL.map(d => d.label))
        .range([0, width])
        .padding(0.1)

      // y 軸比例尺
      const y = d3.scaleLinear()
        .domain([0, d3.max(dataL, d => Math.max(d.NArea, d.MArea, d.SArea))])
        .nice()
        .range([height, 0])

      // X 軸
      const xAxis = d3.axisBottom(x)

      // Y 軸
      const yAxis = d3.axisLeft(y)

      // SVG 元素
      const svg = d3.select(lineChart.value)
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`)  

      // 加入 X 軸
      svg.append('g')
        .attr('class', 'x-axis')
        .attr('transform', `translate(0, ${height})`)
        .call(xAxis)
        .append('text')
        .attr('x', width / 2 )
        .attr('y', 30)
        .attr('fill', '#000')
        .attr('text-anchor', 'middle')
        .text(xUnit)

      // 加入 Y 軸
      svg.append('g')
        .attr('class', 'y-axis')
        .call(yAxis)
        .append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', -40)
        .attr('x', -height / 2)
        .attr('dy', '0.5em')
        .attr('fill', '#000')
        .attr('text-anchor', 'middle')
        .text(yUnit)
      let iCount = 0
      // 繪製折線
      Object.keys(dataL[0]).forEach(key => {
        if (key !== 'label') {
          svg.append('path')
            .datum(dataL)
            .attr('fill', 'none')
            .attr('stroke', color(key))
            .attr('stroke-width', 2)
            .attr('d', d3.line()
              .x(d => x(d.label) + x.bandwidth() / 2)
              .y(d => y(d[key]))
            )
          let sNM = lineLegendNM.value[iCount]
          legendLine.value.push({ label: sNM, color: color(key) });
          iCount = iCount + 1
        } 
      })
  }

  onMounted(() => {
  	useHead({title:'表單庫'})
  	APIsvr.value = window.sessionStorage.getItem('liwaAPIsvr')

  	loadBarData()
  	loadPieData()
  	loadLineData()

  	// console.log('barData0 =', barData.value)
		// if (barData.value.length > 0) {
		// 	console.log('barData =', barData.value)
		// 	drawBarChart(400, 400, barData.value)
		// }
		// drawPieChart(400, 400, pieData.value)
	// drawlineChart(480,480, lineData.value)    	
  })	
 
</script>

<template>
<NuxtLayout name="default">	
<banner
	:progname="progName"
	:detailflg="detailFlg"
	:detailkey="detailKey"
></banner>
	<div class="w-full mb-4 flex flex-col lg:flex-row flex-wrap">
	  <div class="w-[500px] h-[500px] ml-8 mt-2 border-2 border-zinc-300 relative" >
	    <div ref="barChart" class="mt-[30px]"></div>
	    <div class="w-[150px] absolute top-2 right-2 flex flex-row flex-wrap justify-end">
	      <div v-for="(item, index) in legendBar" :key="index" class="mr-1 flex flex-row justify-between">
	        <div :style="{ backgroundColor: item.color }" class="w-4 h-4 mr-1"></div>
	        <div class="text-sm">{{ item.label }}</div>
	      </div>
	    </div>
	  </div>
		<div class="w-[500px] h-[500px] ml-8 mt-2 border-2 border-zinc-300 relative" >
		  <div ref="pieChart" class="mt-[30px] mx-auto w-[400px]"></div>
		  <div class="w-[200px] absolute top-2 right-2 flex flex-row flex-wrap justify-end">
		    <div v-for="(item, index) in legendPie" :key="index" class="mr-1 flex flex-row justify-between">
		      <div :style="{ backgroundColor: item.color }" class="w-4 h-4 mr-1"></div>
		      <div class="text-sm text-zinc-500">{{ item.label }}</div>
		    </div>
		  </div>
		</div>
		<div class="w-[500px] h-[500px] ml-8 mt-2 border-2 border-zinc-300 relative" >
		  <div ref="lineChart" class="mt-[30px] w-[480px]"></div>
		  <div class="w-[200px] absolute top-2 right-2 flex flex-row flex-wrap justify-end">
		    <div v-for="(item, index) in legendLine" :key="index" class="mr-1 flex flex-row justify-between">
		      <div :style="{ backgroundColor: item.color }" class="w-4 h-4 mr-1"></div>
		      <div class="text-sm">{{ item.label }}</div>
		    </div>
		  </div>
		</div>		
	</div>
</NuxtLayout>
</template>

<style scoped>
.legend-label {
  font-size: 12px;
}	
</style>
