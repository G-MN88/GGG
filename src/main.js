import Vue from 'vue'
import App from './App'
// import axios from './axios/index'

Vue.config.productionTip = false
App.mpType = 'app'

import './axios'
const app = new Vue(App)
app.$mount()
