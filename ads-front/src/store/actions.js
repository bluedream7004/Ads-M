import axios from 'axios'
import * as types from './types'
import { useRouter } from 'vue-router'
import setAuthToken from "../utils/setAuthToken";



const proxy = types.PROXY_URL

export default {
  getCampaigns({ commit }) {
    axios
      .post(`${proxy}/campaigns`)
      .then((res) => {
        commit('getCampaigns', res.data)
      })
      .catch((err) => {
        console.log(err)
      })
  },

  getCampaignDetail({ dispatch, commit }, payload) {
    commit('updateStartDate', payload[0])
    commit('updateEndDate', payload[1])
    dispatch('getCampaignDetailCommon')
  },

  getCampaignDetailCommon({ state, commit }) {
    const payload = {
      advertiserId: state.advertiserId,
      startDate: state.campaignDetail.startDate,
      endDate: state.campaignDetail.endDate,
      filterCampaignNames: Array.from(state.campaignDetail.filterCampaignNames),
      filterGroupNames: Array.from(state.campaignDetail.filterGroupNames),
    }

    axios
      .post(`${proxy}/campaigns/detail`, payload)
      .then((res) => {
        commit('getCampaignDetail', res.data)
      })
      .catch((err) => {
        console.log(err)
      })
  },

  [types.ADD_NEW_PRESET](context) {
    axios
      .post(`${proxy}/presets/add_preset`, {
        presets: context.state.campaignAdd.campaigns.filter((item, index) => context.state.campaignAdd.selectedCampaigns.includes(index)),
      })
      .then((res) => {
        context.commit(types.ADD_NEW_PRESET, res.data)
      })
      .catch((err) => {
        console.log(err)
      })
  },

  [types.GET_PRESETS]({ commit }) {
    axios
      .get(`${proxy}/presets`)
      .then((res) => {
        commit(types.GET_PRESETS, res.data)
      })
      .catch((err) => {
        console.log(err)
      })
  },

  [types.GET_CAPAIGN_FROM_TIKTOK]({ state, commit, dispatch }) {
    commit(types.GET_CAPAIGN_FROM_TIKTOK)
    
    const payload = {
      advertiserId : state.advertiserId,
      accessToken: state.accessToken,
    }
    axios
      .get(`${proxy}/campaigns/get_campaign_from_tiktok`, payload)
      .then((res) => {
        commit(types.GETED_CAPAIGN_FROM_TIKTOK)
        dispatch('getCampaigns')
        // context.state.campaignGettingFlag = false
      })
      .catch((err) => {
        commit(types.GETED_CAPAIGN_FROM_TIKTOK)
        // context.state.campaignGettingFlag = false
        console.log(err)
      })
  },
// upload csv
  [types.GET_CAMPAIGN_FROM_CSV] ({commit, dispatch},payload) {
    commit(types.GET_CAMPAIGN_FROM_CSV)

    axios
      .post(`${proxy}/campaigns/get_campaign_from_csv`, {data:payload})
      .then(res => {
        commit(types.GETED_CAMPAIGN_FROM_CSV)
        //        dispatch('getCampaigns')
      })
            .catch(err => {
        commit(types.GETED_CAMPAIGN_FROM_CSV)
        console.log(err)
      })
  },
  [types.ADD_CAMPAIGN_TO_TIKTOK] ({state, commit}) {
    axios.post(`${proxy}/campaigns/add_campaign_to_tiktok`, {
      campaigns: state.campaignAdd.campaigns,
    })
      .then(res => {
        commit(types.ADD_CAMPAIGN_TO_TIKTOK)
      })
      .catch((err) => {
        console.log(err)
      })
  },

  [types.ADD_FILTER_CAMPAIGN_NAME]({ commit, dispatch }, paylod) {
    commit(types.ADD_FILTER_CAMPAIGN_NAME, paylod)
    dispatch('getCampaignDetailCommon')
  },

  [types.REMOVE_FILTER_CAMPAIGN_NAME]({ commit, dispatch }, paylod) {
    commit(types.REMOVE_FILTER_CAMPAIGN_NAME, paylod)
    dispatch('getCampaignDetailCommon')
  },
  [types.ADD_FILTER_GROUP_NAME]({ commit, dispatch }, paylod) {
    commit(types.ADD_FILTER_GROUP_NAME, paylod)
    dispatch('getCampaignDetailCommon')
  },

  [types.REMOVE_FILTER_GROUP_NAME]({ commit, dispatch }, paylod) {
    commit(types.REMOVE_FILTER_GROUP_NAME, paylod)
    dispatch('getCampaignDetailCommon')
  },

  getAllowAdvertisers ({commit}) {
    if(localStorage.token) {
      setAuthToken(localStorage.token)
    }
    axios
      .get(`${proxy}/auth/get_allow_advertisers`)
      .then(res => {
        commit('getAllowAdvertisers', res.data.advertisers)
      })
      .catch(error => {
        if (error.response && error.response.status === 401) {
          commit('removeToken')
        } else {
          console.log(error)
        }
      })
  },
   //modify
   addlist(context, payload){
    context.commit("addlist", payload);
  },
  
  addlistrewrite(context, payload){
    context.commit("addlistrewrite", payload);
  },
  addtmp(context, payload){
    context.commit("addtmp", payload);
  },
  cleartmp(context){
    context.commit("cleartmp")
  },
  addfinishedlist(context, payload){
    context.commit("addfinishedlist", payload);
  },
  changefinishedlist(context, payload){
    context.commit("changefinishedlist", payload);
  },
  addgpttexttofinishedtext(context, payload){
    context.commit("addgpttexttofinishedtext", payload)
  },
  removelist(context, payload){
    context.commit("removelist", payload);
  },
  removefinishedlist(context, payload){
    context.commit("removefinishedlist", payload);
  },
  changenowtext(context, payload){
    context.commit("changenowtext", payload);
  },
  
}

