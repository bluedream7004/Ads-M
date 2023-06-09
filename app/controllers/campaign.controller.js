const axios = require('axios')
const { format } = require('date-fns')
const db = require('../models')
const Campaign = db.campaigns
const CampaignGettingHistory = db.campaignGettingHistory
const Op = db.Sequelize.Op
const Sequelize = db.Sequelize

// Retrieve all campaigns
exports.findAll = (req, res) => {
  Campaign.findAll({
    order: [['recId', 'ASC']],
    // group: "campaignId",
  })
    .then((data) => {
      res.json(data)
    })
    .catch((err) => {
      res.status(500).json({
        message: err.message || 'Some error occurred while retrieving campaigns',
      })
    })
}

// Find a campaign data with id
exports.findOne = (req, res) => {
  const advertiserId = req.body.advertiserId
  const startDate = new Date(req.body.startDate)
  const endDate = new Date(req.body.endDate)
  endDate.setDate(endDate.getDate() + 1)
  let filterCampaignNames = req.body.filterCampaignNames
  let filterGroupNames = req.body.filterGroupNames
  const result = {}
  let where = {
    advertiserId: advertiserId,
    date: {
      [Op.lt]: endDate,
      [Op.gte]: startDate,
    },
  }

  if (filterCampaignNames.length > 0) {
    where.campaignName = {
      [Op.in]: filterCampaignNames,
    }
  }
  if (filterGroupNames.length > 0) {
    where.groupName = {
      [Op.in]: filterGroupNames,
    }
  }

  Campaign.findAll({
    where: where,
  })
    .then((data) => {
      result.campaignHistory = data
    
      Campaign.findAll({
        attributes: [
          'date',
          [Sequelize.fn('SUM', Sequelize.col('cost')), 'cost'],
          [Sequelize.fn('SUM', Sequelize.col('views')), 'views'],
          [Sequelize.fn('SUM', Sequelize.col('clicks')), 'clicks'],
          [Sequelize.fn('SUM', Sequelize.col('cv')), 'cv'],
        ],
        where: where,
        order: [['date', 'ASC']],
        group: 'date',
      })
        .then((data) => {
          result.chartData = data
          res.json(result)
        })
        .catch((err) => {
          res.status(500).json({
            message: err.message,
          })
        })
    })
    .catch((err) => {
      res.status(500).json({
        message: err.message || 'Some error occurred while retrieving campaigns',
      })
    })
}

async function getCampaignPerDay(curDate, advertiserId, accessToken) {
  console.log('call getCampaignPerDay function>>', curDate)
  let stat = [
    'campaign_id',
    'campaign_name',
    'adgroup_id',
    'adgroup_name',
    'adgroup_id',
    'ad_id',
    'ad_name',
    'ad_text',
    'stat_cost',
    'show_cnt',
    'click_cnt',
    'convert_cnt',
    'time_attr_view',
    'play_duration_2s',
    'play_duration_6s',
    'play_over',
    'ad_like',
  ]
  let option = {
    //primary_status      : 'STATUS_ALL',
    start_date: curDate,
    end_date: curDate,
    advertiser_id: advertiserId,
    fields: JSON.stringify(stat),
    group_by: JSON.stringify(['STAT_GROUP_BY_FIELD_STAT_TIME', 'STAT_GROUP_BY_FIELD_ID']),
    time_granularity: 'STAT_TIME_GRANULARITY_DAILY', //'STAT_TIME_GRANULARITY_HOURLY'
    page: 1,
    page_size: 1000,
  }
  let params = ''
  for (let key in option) {
    params += key + '=' + option[key] + '&'
  }
  let url = encodeURI('https://ads.tiktok.com/open_api/v1.2/reports/ad/get/' + '?' + params)

  await axios
    .get(url, {
      headers: {
        'Access-Token': accessToken,
      },
    })
    .then((res) => {
      let addedCount = 0
      if (res.data.data.list[0] != undefined) {
        console.log(777777777777777777777777777777777777777)
        console.log(res.data.data.list);
        console.log(777777777777777777777777777777777777777)

        Promise.all(
          res.data.data.list.map((item) => {
            console.log(888888888888888888888888888)
            console.log(item)

            addCampaign(item, advertiserId)
          })
        )
          .then(() => {
            addedCount = res.data.data.list.length
            CampaignGettingHistory.create({ date: curDate, addCount: res.data.length })
              .then(() => {
                console.log(curDate, '>> add campaigns of ', res.data.data.list.length)
                return addedCount
              })
              .catch(() => {
                return false
              })
          })
          .catch((err) => {
            return false
          })
      }
    })
    .catch((err) => {
      return false
    })
}

exports.getCampaignFromTiktok = async (req, res) => {
  try {
    let latest_date = await CampaignGettingHistory.findOne({
      order: [['date', 'DESC']],
    })

    if (!latest_date) {
      latest_date = '2022-08-01'
    } else {
      latest_date = latest_date.date
    }
    const now = new Date()
    let yesterday = new Date(now)
    yesterday.setDate(now.getDate() - 1)
    let start_date = new Date(latest_date)
    start_date.setDate(start_date.getDate() + 1)
    for (let date = start_date; date <= new Date("2022-08-31"); date.setDate(date.getDate() + 1)) {
      await getCampaignPerDay(format(date, 'yyyy-MM-dd'), req.body.advertiserId, req.body.accessToken)
    }

    res.send({
      message: 'success',
    })
  } catch (error) {
    res.status(500).json({
      message: err.message,
    })
  }
}

//upload csv
exports.getCampaignFromCsv = async (req, res) => {
  try {
    console.log(11111111111111111111111111)
    console.log(req.body)
    console.log(11111111111111111111111111)
    
    for ( let prop of req.body.data){ 
      console.log(12345678987654323456789)
      console.log(prop) 
      await uploadCampaign(prop)
    }
      
//      await uploadCampaign(prop)}

    res.send({
      message: 'uploaded',
    })
  } catch (error) {
    res.status(500).json({
      message: err.message,
    })
  }
  }


exports.addCampaignToTiktok = async (req, res) => {
  const campaigns = req.body.campaigns

  try {
    if (campaigns[0] != undefined) {
      await campaigns.map(async (item) => {
        await axios
          .post(
            'https://ads.tiktok.com/open_api/v1.2/campaign/create/',
            {
              advertiser_id: '7128276846151483393',
              budget_mode: item.cell7,
              budget: item.cell8,
              objective_type: item.cell10,
              campaign_name: item.cell5,
            },
            {
              headers: {
                'Content-Type': 'application/json',
                'Access-Token': this.ACCESS_TOKEN,
              },
            }
          )
          .then((res) => {
            console.log(res.data)
          })
          .catch((err) => {
            console.log(err)
          })
      })
    }

    res.send({
      message: 'success',
    })
  } catch (error) {
    res.status(404).json({
      message: 'Adding Tiktok error'
    })
  }

}

const addCampaign = (data, advertiserId) => {
  const campaign = {
    campaignId: data.campaign_id,
    campaignName: data.campaign_name,
    adId: data.ad_id,
    groupName: data.adgroup_name,
    campaignGroupId: data.adgroup_id,
    adName: data.ad_name,
    clicks: data.click_cnt,
    viewsSec: data.play_duration_2s,
    viewsFull: data.play_over,
    date: data.stat_datetime,
    cv: data.convert_cnt,
    cost: data.stat_cost,
    views: data.show_cnt,
    likes: data.ad_like,
    advertiserId: advertiserId
  }

  Campaign.create(campaign)
    .then((data) => {
      return data
    })
    .catch((err) => {
      return err
    })
}

const uploadCampaign = (data) => {
  console.log(3333333333333333333);
  let tmpdate = new Date(data['date'].substr(0,4)+"-"+data['date'].substr(5,2)+"-"+data['date'].substr(8,2))
  data.date = tmpdate;
  
  console.log(data)
console.log(data['ad_like\r'])
//console.log(data['ad_like\r'].substr(0,data['ad_loke\r'].length-2))
console.log(data['ad_like\r'].length)
const adlikelen = data['ad_like\r'].length-1
  const adlike00 = data['ad_like\r'].substr(0,adlikelen);
  data.ad_like = parseInt(adlike00);
  data.campaign_id = BigInt(parseFloat(data.campaign_id));
  data.ad_id = BigInt(parseFloat(data.ad_id));
  data.adgroup_id = BigInt(parseFloat(data.adgroup_id));
  data.click_cnt = parseInt(data.click_cnt);
  data.play_duration_2s = parseInt(data.play_duration_2s);
  data.play_over = parseInt(data.play_over);
  data.convert_cnt = parseInt(data.convert_cnt);
  data.stat_cost = parseFloat(data.stat_cost);
  data.show_cnt = parseInt(data.show_cnt);
  data.ad_like = parseInt(data.ad_like);
 console.log(data)
  const campaign = {
    campaignId: data.campaign_id,
    campaignName: data.campaign_name,
    adId: data.ad_id,
    groupName: data.adgroup_name,
    campaignGroupId: data.adgroup_id,
    adName: data.ad_name,
    clicks: data.click_cnt,
    viewsSec: data.play_duration_2s,
    viewsFull: data.play_over,
    date: data.date,
    cv:data.convert_cnt,
    cost: data.stat_cost,
    views: data.show_cnt,
    likes: data.ad_like,
  }
  console.log(campaign)
  Campaign.create(campaign)
    .then((data) => {
      return data
    })
    .catch((err) => {
      return err
    })
}
