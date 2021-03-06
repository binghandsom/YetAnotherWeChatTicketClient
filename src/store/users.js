import { axios, throwOnError, objectToFormData} from './utils';
import Vue from 'vue';

const state = {
  users: {}
};

const mutations = {
  updateUser(state, user) {
    if (typeof user.createdAt === 'string')
      user.createdAt = new Date(user.createdAt);
    if (typeof user.updatedAt === 'string')
      user.updatedAt = new Date(user.updatedAt);
    if (typeof user.secureUpdatedAt === 'string')
      user.secureUpdatedAt = new Date(user.secureUpdatedAt);
    const old = state.users[user._id];
    if (old && old.updatedAt.getTime() >= user.updatedAt.getTime())
      return;
    Vue.set(state.users, user._id, user);
  },
  deleteUser(state, id) {
    Vue.delete(state.users, id)
  }
};

const actions = {
  async create({commit}, user) {
    const headers = {};
    if (user.avatar) {
      headers['Content-Type'] = 'multipart/form-data';
      user = objectToFormData(user);
    }
    if (user.username || user.roles) {
      headers.Authorization = `Bearer ${window.localStorage.getItem('jwt')}`
    }
    let response = await throwOnError(axios().post('/api/user/', user, {headers}));
    commit('updateUser', response);
    return response;
  },
  async find({commit}, query) {
    const headers = {
      'Authorization': `Bearer ${window.localStorage.getItem('jwt')}`
    };
    const data = await throwOnError(axios().get('/api/user/', {
      params: query,
      headers
    }));
    for (let user of data.results)
      commit('updateUser', user);
    return data;
  },
  async patch({commit}, user) {
    const headers = {
      'Authorization': `Bearer ${window.localStorage.getItem('jwt')}`
    }, id = user._id;
    delete user._id;
    if (user.avatar) {
      headers['Content-Type'] = 'multipart/form-data';
      user = objectToFormData(user);
    }
    let response = await throwOnError(axios().patch('/api/user/' + id, user, {
      headers
    }));
    if (response)
      commit('updateUser', response);
    return response;
  },
  async deleteUser({commit}, id) {
    const headers = {
      'Authorization': `Bearer ${window.localStorage.getItem('jwt')}`
    };
    await throwOnError(axios().delete('/api/user/' + id, {
      headers
    }));
  }
};

export default {
  namespaced: true,
  state,
  mutations,
  actions
}

export const sioHandlers = {
  'users:update': function (user) {
    this.commit('users/updateUser', user);
  },
  'users:delete': function (id) {
    this.commit('users/deleteUser', id);
  }
};
