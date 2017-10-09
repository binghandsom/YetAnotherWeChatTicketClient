import Vue from 'vue';
import {setAxios, setSocket, throwOnError, axios} from "./utils";

// TODO: for test
export const sioHandlers = {
  '*': function (event, data) {
    console.log(event, data);
  }
};

const state = {
  title: '紫荆之声',
  site: window.location.origin,

  isWechat: false,

  wechatAppid: null,
  action: null,
  userToken: null
};

const mutations = {
  setWechat(state, value) {
    state.isWechat = value;
  },
  setSite(state, site) {
    state.site = site;
    setAxios(site);
    setSocket(site);
  },
  setAction(state, value) {
    state.action = value;
  },
  setUserToken(state, value) {
    state.userToken = value;
  }
};

const actions = {
  getSiteSettings(state, site) {
    return throwOnError(axios().get('/api/site'))
      .then(data => {
        Object.keys(data).forEach(key => Vue.set(state, key, data[key]));
        return data;
      });
  }
};

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
