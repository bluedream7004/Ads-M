const axios = require('axios');
const db = require("../models");
const Campaign = db.campaigns;
const CampaignGettingHistory = db.campaignGettingHistory;
const Op = db.Sequelize.Op;
const Sequelize = db.Sequelize;

// Retrieve all campaigns
exports.findAll = (req, res) => {
  Campaign.findAll({
    order: [
      ['recId', 'ASC']
    ],
    // group: "campaignId",
  })
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      res.status(500).json({
        message:
          err.message || "Some error occurred while retrieving campaigns",
      });
    });
};

// Find a campaign data with id
exports.findOne = (req, res) => {
  const id = req.body.id;
  const startDate = req.body.startDate;
  const endDate = req.body.endDate;

  const result = {}
  Campaign.findAll({
    where: {
      campaignId: id,
      date: {
        [Op.lt]: new Date(endDate),
        [Op.gt]: new Date(startDate),
      },
    }
  })
    .then((data) => {
      result.campaignHistory = data;
    })
    .catch((err) => {
      res.status(500).json({
        message:
          err.message || "Some error occurred while retrieving campaigns",
      });
    });
  
  Campaign.findAll({
    attributes: [
      'date',
      [Sequelize.fn('SUM', Sequelize.col('cost')), 'cost'],
    ],
    where: {
      campaignId: id,
      date: {
        [Op.lt]: new Date(endDate),
        [Op.gt]: new Date(startDate),
      },
    },
    order: [
      ['date', 'ASC']
    ],
    group: 'date'
  })
    .then((data) => {
      result.chartData = data;
      res.json(result)
    })
    .catch((err) => {
      res.status(500).json({
        message: err.message
      })
    })
};

exports.getCampaignFromTiktok = (req, res) => {
  CampaignGettingHistory.findOne({
    order: [
      ['date', 'DESC']
    ]
  })
    .then((data) => {
      let latest_date;
      if(data == null) {
        latest_date = '0000-00-00';
      } else {
        latest_date = data.date;
      }

      // get campaigns from tiktok
      try {
        let stat = [
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
          start_date: '2022-08-30',
          end_date: '2022-08-31',
          advertiser_id: '7128276846151483393',
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
        console.log(url)
        axios
          .get(url, {
            headers: {
              'Access-Token': 'e703d9339371aeb0144d9451123a94a3482c1e18',
            },
          })
          .then((res) => {
            let addedCount = 0
            console.log(res)
            if (res.data.data.list[0] != undefined) {
              //console.log(res.data)
              res.data.data.list.map((item) => {
                console.log(item)
                addCampaign(item)
              })
              addedCount = res.data.data.list.length

              CampaignGettingHistory.create({ date: new Date(), addCount: res.data.length })
            }

            res.send({
              result: addedCount,
            })
          })
          .catch((err) => {
            res.status(200).send({
              message: 'tiktok api error',
            });
          });
      } catch (error) {
        console.error(error);
      }
    })
    .catch((err) => {
      res.status(500).json({
        message: err.message
      })
    })
}

exports.addCampaignToTiktok = (req, res) => {
  const campaigns = req.body.campaigns;
  campaigns.map(item => {
    axios
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
      .then(res => {
        console.log(res.data);
      })
      .catch(err => {
        res.status(500).send({message: err.message});
      })
  });

  res.send({
    message: 'success'
  });
}

const addCampaign = (data) => {
  const campaign = {
    campaignId: data.campaign_id,
    campaignName: data.campaign_name,
    adId: data.advertiser_id
    //add fields
  }
  
  Campaign.create(campaign)
    .then(data => {
      return data;
    })
    .catch(err => {
      return err;
    });
}