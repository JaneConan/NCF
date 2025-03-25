﻿var app = new Vue({
  el: '#app',
  data() {
    return {
      isExpandAll: true,
      loading: false,
      refreshTable: true,
      xncfStat: {},
      xncfOpeningList: {},
      chartData: [],
      todayLogData: [],
      // 添加动画控制变量
      shakeAllModules: false,
      glowUpgradeableModules: false
    };
  },
  mounted() {
    this.getXncfStat();
    this.getXncfOpening();
    this.fetchChartData();
    this.fetchTodayLogData();
    // 添加鼠标事件监听
    this.initializeHoverEffects();
  },
  methods: {
    async fetchChartData() {
      try {
        let response = await service.get('/api/Senparc.Areas.Admin/StatAppService/Areas.Admin_StatAppService.GetLogs');
        if (response.data && response.data.data && response.data.data.logs) {
          this.chartData = response.data.data.logs;
          this.initChart();
        } else {
          console.error('Invalid API response:', response);
        }
      } catch (error) {
        console.error('Error fetching chart data:', error);
      }
    },
    async fetchTodayLogData() { // 新增获取今日日志数据的方法  
      try {
        let response = await service.get('/api/Senparc.Areas.Admin/StatAppService/Areas.Admin_StatAppService.GetTodayLog');
        if (response.data && response.data.data && response.data.data.items) {
          this.todayLogData = response.data.data.items;
          this.todayDate = response.data.data.date;
          this.initChart(); // 确保图表在获取到数据后更新  
        } else {
          console.error('Invalid API response:', response);
        }
      } catch (error) {
        console.error('Error fetching today log data:', error);
      }
    },
    initChart() {
      let chart1 = document.getElementById('firstChart');
      let chartOption1 = {
        title: {
          text: '日志统计',
          subtext: '近 14 天'
        },
        xAxis: {
          type: 'category',
          data: this.chartData.map(item => item.date)
        },
        yAxis: {
          type: 'value',
          axisLabel: {
            formatter: '{value} 条'
          }
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        legend: {
          data: ['常规日志', '异常日志']
        },
        series: [
          {
            name: '常规日志',
            type: 'line',
            stack: '总量',
            areaStyle: { color: '#91c7ae' }, // 添加区域填充颜色  
            data: this.chartData.map(item => item.normalLogCount),
            color: '#91c7ae'
          },
          {
            name: '异常日志',
            type: 'line',
            stack: '总量',
            areaStyle: { color: '#d48265' }, // 添加区域填充颜色  
            data: this.chartData.map(item => item.exceptionLogCount),
            color: '#d48265'
          }
        ]
      };
      let chartInstance1 = echarts.init(chart1);
      chartInstance1.setOption(chartOption1);

      // 添加点击事件监听器  
      chartInstance1.on('click', params => {
        if (params.componentType === 'series') {
          let date = params.name;
          window.location.href = `/Admin/SenparcTrace/DateLog?date=${date}`;
        }
      });

      // 准备今日日志数据  
      let todayLogData = this.todayLogData.map(item => ({
        name: item.senparcTraceType,
        value: item.count
      }));

      let chart2 = document.getElementById('secondChart');
      let chartOption2 = {
        title: {
          text: '今日日志统计',
          subtext: '动态数据',
          left: 'center'
        },
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b}: {c} ({d}%)'
        },
        legend: {
          orient: 'vertical',
          left: 'left',
          data: this.todayLogData.map(item => item.senparcTraceType) // 自动输出所有类别  
        },
        series: [{
          name: '日志类型',
          type: 'pie',
          radius: '50%',
          data: todayLogData,
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }]
      };
      let chartInstance2 = echarts.init(chart2);
      chartInstance2.setOption(chartOption2);
      // 添加点击事件监听器    
      chartInstance2.on('click', params => {
        if (params.componentType === 'series') {
          window.location.href = `/Admin/SenparcTrace/DateLog?date=${this.todayDate}`;
        }
      });

    },
    //XNCF 统计状态  
    async getXncfStat() {
      let xncfStatData = await service.get('/Admin/Index?handler=XncfStat');
      this.xncfStat = xncfStatData.data.data;
    },
    //开放模块数据  
    async getXncfOpening() {
      let xncfOpeningList = await service.get('/Admin/Index?handler=XncfOpening');
      this.xncfOpeningList = xncfOpeningList.data.data;
    },
    //点击打开模块
    navigateTo(uid) {
      window.location.href = '/Admin/XncfModule/Start/?uid=' + uid;
    },
    getOpenDetail(rowIndex, menus) {
      console.log(`rowIndex --- ${JSON.stringify(rowIndex)}`)
      console.log(`menus --- ${JSON.stringify(menus)}`)
      var menuInfo = menus[rowIndex]
      window.location.href = menuInfo.url
    },
    // 添加新方法处理悬停效果
    initializeHoverEffects() {
      // 获取统计项元素 - 修正选择器
      const installedModulesStat = document.querySelector('.xncf-stat-item');
      const updateModulesStat = document.querySelectorAll('.xncf-stat-item')[1];

      // 已安装模块统计项的鼠标事件
      if (installedModulesStat) {
        installedModulesStat.addEventListener('mouseenter', () => {
          this.triggerShakeAnimation();
        });
      }

      // 待更新模块统计项的鼠标事件
      if (updateModulesStat) {
        updateModulesStat.addEventListener('mouseenter', () => {
          this.triggerGlowAnimation();
        });
      }
    },

    // 触发抖动动画
    triggerShakeAnimation() {
      const moduleCards = document.querySelectorAll('#xncf-modules-area .box-card');
      moduleCards.forEach(card => {
        // 添加随机延迟
        const delay = Math.random() * 200; // 0-200ms的随机延迟
        setTimeout(() => {
          card.classList.add('shake-animation');
          // 动画结束后移除类
          setTimeout(() => {
            card.classList.remove('shake-animation');
          }, 800); // 与动画持续时间匹配
        }, delay);
      });
    },

    // 触发发光/淡化动画
    triggerGlowAnimation() {
      const allCards = document.querySelectorAll('#xncf-modules-area .box-card');
      const upgradeableVersions = document.querySelectorAll('#xncf-modules-area .version-upgradeable');

      // 为所有可更新的模块添加发光效果
      upgradeableVersions.forEach(version => {
        const card = version.closest('.box-card');
        if (card) {
          // 添加随机延迟
          const delay = Math.random() * 200;
          setTimeout(() => {
            card.classList.add('glow-animation');
            setTimeout(() => {
              card.classList.remove('glow-animation');
            }, 1200); // 与动画持续时间匹配
          }, delay);
        }
      });

      // 为不可更新的模块添加淡化效果
      allCards.forEach(card => {
        if (!card.querySelector('.version-upgradeable')) {
          // 添加随机延迟
          const delay = Math.random() * 200;
          setTimeout(() => {
            card.classList.add('fade-animation');
            setTimeout(() => {
              card.classList.remove('fade-animation');
            }, 1200); // 与动画持续时间匹配
          }, delay);
        }
      });
    }
  }
});  
