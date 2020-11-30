import React, { Component } from 'react';
import ReactEcharts from 'echarts-for-react';
import cloneDeep from 'lodash.clonedeep';

import '../App.css'

const axios = require('axios');
axios.defaults.baseURL = 'http://localhost:8080';
//axios.defaults.headers.common['Authorization'] = 'AUTH_TOKEN';
axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';

const humidityLow = 20;
const humidityHigh = 70;
const temperatureLow = -10;
const temperatureHigh = 30;

class Dynamic extends Component{
    constructor(props) {
        super(props);
        this.state = this.getInitialState();
    }
    timeTicket = null;
    count = 51;
    getInitialState = () => ({option: this.getOption(), curTemperature: temperatureLow, curHumidity: humidityLow});

    getTemperature = () => {
        const _this = this;
        axios.get('/getData')
            .then(function (response){
                // handle success
                console.log(response);
                //var data = response.data;
                var json = response.data;
                _this.setState({curTemperature: json["temperature"], curHumidity: json["humidity"]});
            })
            .catch(function (error) {
                // handle error
                console.log(error);
            })
            .then(function () {
                // always executed
            });
    }

    fetchNewDate = () => {
        let axisData = (new Date()).toLocaleTimeString().replace(/^\D*/,'');
        const option = cloneDeep(this.state.option); // immutable
        option.title.text = 'Hello Echarts-for-react.' + new Date().getSeconds();
        let data0 = option.series[0].data;
        let data1 = option.series[1].data;
        data0.shift();
        // 预购数量 (humidity)
        data0.push(this.state.curHumidity);

        data1.shift();
        // 价格（temperature）
        this.getTemperature();
        data1.push(this.state.curTemperature);

        option.xAxis[0].data.shift();
        option.xAxis[0].data.push(axisData);
        option.xAxis[1].data.shift();
        option.xAxis[1].data.push(this.count++);

        this.setState({
            option,
        });
    };
    componentDidMount() {
        if (this.timeTicket) {
            clearInterval(this.timeTicket);
        }
        this.timeTicket = setInterval(this.fetchNewDate, 10000);
    };

    componentWillUnmount() {
        if (this.timeTicket) {
            clearInterval(this.timeTicket);
        }
    };

    getOption = () => ({
        title: {
            text:'Hello Echarts-for-react.',
        },
        tooltip: {
            trigger: 'axis'
        },
        legend: {
            data:['temperature', 'humidity']
        },
        toolbox: {
            show: true,
            feature: {
                dataView: {readOnly: false},
                restore: {},
                saveAsImage: {}
            }
        },
        grid: {
            top: 60,
            left: 30,
            right: 60,
            bottom:30
        },
        dataZoom: {
            show: false,
            start: 0,
            end: 100
        },
        visualMap: {
            show: false,
            min: humidityLow,
            max: humidityHigh,
            color: ['#BE002F', '#F20C00', '#F00056', '#FF2D51', '#FF2121', '#FF4C00', '#FF7500',
                '#FF8936', '#FFA400', '#F0C239', '#FFF143', '#FAFF72', '#C9DD22', '#AFDD22',
                '#9ED900', '#00E500', '#0EB83A', '#0AA344', '#0C8918', '#057748', '#177CB0']
        },
        xAxis: [
            {
                type: 'category',
                boundaryGap: true,
                data: (function (){
                    let now = new Date();
                    let res = [];
                    let len = 50;
                    while (len--) {
                        res.unshift(now.toLocaleTimeString().replace(/^\D*/,''));
                        now = new Date(now - 2000);
                    }
                    return res;
                })()
            },
            {
                type: 'category',
                boundaryGap: true,
                data: (function (){
                    let res = [];
                    let len = 50;
                    while (len--) {
                        res.push(50 - len + 1);
                    }
                    return res;
                })()
            }
        ],
        yAxis: [
            {
                type: 'value',
                scale: true,
                name: 'temperature',
                max: temperatureHigh,
                min: temperatureLow,
                boundaryGap: [0.2, 0.2]
            },
            {
                type: 'value',
                scale: true,
                name: 'humidity',
                max:humidityHigh,
                min: humidityLow,
                boundaryGap: [0.2, 0.2]
            }
        ],
        series: [
            {
                name:'humidity',
                type:'bar',
                xAxisIndex: 1,
                yAxisIndex: 1,
                itemStyle: {
                    normal: {
                        barBorderRadius: 4,
                    }
                },
                animationEasing: 'elasticOut',
                animationDelay: function (idx) {
                    return idx * 10;
                },
                animationDelayUpdate: function (idx) {
                    return idx * 10;
                },
                data:(function (){
                    let res = [];
                    let len = 50;
                    while (len--) {
                        res.push(humidityLow);
                    }
                    return res;
                })()
            },
            {
                name:'temperature',
                type:'line',
                data:(function (){
                    let res = [];
                    let len = 0;
                    while (len < 50) {
                        res.push(temperatureLow);
                        len++;
                    }
                    return res;
                })()
            }
        ]
    });

    render() {
        return (
            <div className="chart">
                <ReactEcharts ref='echartsInstance' option={this.state.option} style={{height: 600, width: 1000}}/>
            </div>
        )
    }
}

export default Dynamic;
