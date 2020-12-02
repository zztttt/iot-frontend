import React, { Component } from 'react';
import ReactEcharts from 'echarts-for-react';
import cloneDeep from 'lodash.clonedeep';

import '../App.css'
import Button from "@material-ui/core/Button";

const axios = require('axios');
axios.defaults.baseURL = 'http://localhost:8080';
//axios.defaults.headers.common['Authorization'] = 'AUTH_TOKEN';
axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';

var state = {
    open: 1,
    close: 2
}

const humidityLow = 30;
const humidityHigh = 60;
const temperatureLow = 20;
const temperatureHigh = 35;
const humidityThreshold = 45;
let lastMotorState = state.close;

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
                _this.setState({curTemperature: parseFloat(json["temperature"]), curHumidity: parseFloat(json["humidity"])});
            })
            .catch(function (error) {
                // handle error
                console.log(error);
            })
            .then(function () {
                // always executed
            });
    }

    openMotor = () => {
        axios.get('/openMotor')
            .then(function (response){
                // handle success
                console.log(response);
                //var data = response.data;
                //var json = response.data;
            })
            .catch(function (error) {
                // handle error
                console.log(error);
            })
            .then(function () {
                // always executed
            });
    }

    closeMotor = () => {
        axios.get('/closeMotor')
            .then(function (response){
                // handle success
                console.log(response);
                //var data = response.data;
                //var json = response.data;
            })
            .catch(function (error) {
                // handle error
                console.log(error);
            })
            .then(function () {
                // always executed
            });
    }

    controlMotor = (array) => {
        let len = array.length;
        let sum = 0;
        for(let i = len - 10; i < len; ++i){
            sum += array[i];
        }
        let res = sum / 10;
        if(res < humidityThreshold){
            if(lastMotorState === state.close) {
                this.openMotor();
                lastMotorState = state.open;
                alert("open the humidifier");
            }
        }else{
            if(lastMotorState === state.open) {
                this.closeMotor();
                lastMotorState = state.close;
                alert("close the humidifier");
            }
        }
    }

    control = () => {
        if(lastMotorState === state.close) {
            this.openMotor();
            lastMotorState = state.open;
        }
        else {
            this.closeMotor();
            lastMotorState = state.close;
        }
    }

    fetchNewDate = () => {
        let axisData = (new Date()).toLocaleTimeString().replace(/^\D*/,'');
        const option = cloneDeep(this.state.option); // immutable
        option.title.text = 'Temperaeture and Humidity.' + new Date().getSeconds();
        let data0 = option.series[0].data;
        //console.log(data0);
        let data1 = option.series[1].data;

        this.getTemperature();

        data0.shift();
        // 预购数量 (humidity)
        data0.push(this.state.curHumidity);

        data1.shift();
        // 价格（temperature）
        data1.push(this.state.curTemperature);

        option.xAxis[0].data.shift();
        option.xAxis[0].data.push(axisData);
        option.xAxis[1].data.shift();
        option.xAxis[1].data.push(this.count++);

        this.controlMotor(data0);

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
            text:'Temperaeture and Humidity',
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
                <Button variant="contained" color="primary" onClick={() => {alert('controlMotor'); this.control();}}>
                    ControlMotor
                </Button>
            </div>
        )
    }
}

export default Dynamic;
