import * as types from './types'

export default {
  getCampaignDetail(state, payload) {
    state.campaignDetail.campaignHistory = payload.campaignHistory || []
    state.campaignDetail.chartData = payload.chartData
  },

  getCampaigns(state, payload) {
    state.campaignList = payload
  },

  updateSelectedColumn(state, payload) {
    state.campaignDetail.selectedColumns = payload
  },

  updateStartDate(state, payload) {
    state.campaignDetail.startDate = payload
  },

  updateEndDate(state, payload) {
    state.campaignDetail.endDate = payload
  },

  updateFilterRanges(state, payload) {
    state.campaignDetail.startDate = payload[0]
    state.campaignDetail.endDate = payload[1]
  },

  [types.CREATE_NEW_CAMPAIGN](state, payload) {
    state.campaignAdd.campaigns = [...state.campaignAdd.campaigns, payload]
  },

  [types.CHANGE_NEW_CAMPAIGN_ATTR](state, payload) {
    state.campaignAdd.campaigns[payload.index][payload.key] = payload.value
  },

  [types.ChANGE_NEW_SELECTABLE](state, payload) {
    state.campaignAdd.selectedCampaigns = payload
  },

  [types.REVERSE_PRESET_SELECTABLE](state) {
    state.campaignAdd.showPresetSelectable = !state.campaignAdd.showPresetSelectable
  },

  [types.ADD_NEW_PRESET](state, payload) {
    state.campaignAdd.presets = payload
  },

  [types.CHANGE_NEW_CAMPAIGN_TITLE](state, payload) {
    state.campaignAdd.campaigns[payload.index].title = payload.title
  },

  [types.GET_PRESETS](state, payload) {
    state.campaignAdd.presets = payload
  },

  [types.ADD_NEW_CAMPAIGN_FROM_PRESET](state, payload) {
    let ret = Object.entries(state.campaignAdd.presets[payload])

    ret = ret.filter(([key, value]) => key.includes('cell') || key == 'title')
    ret = Object.fromEntries(ret)
    state.campaignAdd.campaigns = [...state.campaignAdd.campaigns, ret]
  },

  [types.GET_CAPAIGN_FROM_TIKTOK](state) {
    state.campaignGettingFlag = true
  },

  [types.GETED_CAPAIGN_FROM_TIKTOK](state) {
    state.campaignGettingFlag = false
  },

  [types.GET_CAMPAIGN_FROM_CSV](state) {
    state.campaignGettingFlag = true
  },

  [types.GETED_CAMPAIGN_FROM_CSV](state) {
    state.campaignGettingFlag = false
  },


  [types.ADD_CAMPAIGN_TO_TIKTOK](state) {
    state.campaignAdd.campaigns = []
  },

  [types.ADD_FILTER_CAMPAIGN_NAME](state, payload) {
    state.campaignDetail.filterCampaignNames.add(payload)
  },

  [types.REMOVE_FILTER_CAMPAIGN_NAME](state, payload) {
    state.campaignDetail.filterCampaignNames.delete(payload)
  },

  [types.ADD_FILTER_GROUP_NAME](state, payload) {
    state.campaignDetail.filterGroupNames.add(payload)
  },

  [types.REMOVE_FILTER_GROUP_NAME](state, payload) {
    state.campaignDetail.filterGroupNames.delete(payload)
  },

  getAllowAdvertisers (state, payload) {
    state.allowAdvertisers = payload
  },

  removeToken(state) {
    localStorage.removeItem('token')
    state.auth.Auth = false
    state.auth.user = {}
    state.auth.token = null
  },

  setAdvertiser(state, payload) {
    state.advertiserId = payload.advertiserId
    state.accessToken = payload.accessToken
  }
}
