const checkValidUrl = require('valid-url');
const shortId = require('shortid');
const urlModel = require('../model/urlModel');
const axios = require('axios');

const redis = require('redis');
const {promisify} = require('util');

const redisClient = redis.createClient(
    13190,
    "redis-13190.c301.ap-south-1-1.ec2.cloud.redislabs.com",
    { no_ready_check: true }
  );
  redisClient.auth("gkiOIPkytPI3ADi14jHMSWkZEo2J5TDG", function (err) {
    if (err) throw err;
  });
  
  redisClient.on("connect", async function () {
    console.log("Connected to Redis..");
  });



  const SET_ASYNC = promisify(redisClient.SET).bind(redisClient);
  const GET_ASYNC = promisify(redisClient.GET).bind(redisClient);



const createShortUrl = async function (req, res) {
    try {
        let data = req.body;
        let longUrl = data.longUrl

        //======long URL validation=====

        if (!longUrl || longUrl == "") {
            return res.status(400).send({ status: false, msg: "Long Url is required and Long Url cannot be empty" })
        }
        if(Object.keys(data).length !== 1){
            return res.status(400).send({status:false,message:"Enter only long URL"})
        }
        if (typeof longUrl != "string") {
            return res.status(400).send({ status: false, msg: "Long Url's type should be string only" })
        }
        if (!checkValidUrl.isWebUri(longUrl.trim())) {
            return res.status(400).send({ status: false, message: "Please Enter a valid URL." });
        }

        //=====check if long URL exists and show its details======
        const findUrlDetails = await urlModel.findOne({ longUrl: longUrl }).select({ longUrl: 1, shortUrl: 1, urlCode: 1, _id: 0 });
        if (findUrlDetails) {
            return res.status(403).send({ status: true, message: "URL code for this URL is already generated",data: findUrlDetails});
        }

        //====if long url is unique then generate URL code and short URL=====
        let uniqueUrlCode = shortId.generate();
        data.urlCode = uniqueUrlCode;
        let shortUrl = "http://127.0.0.1:3000/" + uniqueUrlCode;
        data.shortUrl = shortUrl.toLowerCase();

        await SET_ASYNC(`${urlCode}`,JSON.stringify(getData));

        //====here we are creating tha data=====
        const createUrlData = await urlModel.create(data);
        const finalResult = await urlModel.findById(createUrlData._id).select({ longUrl: 1, shortUrl: 1, urlCode: 1, _id: 0 });
        res.status(201).send({ status: true, data: finalResult });
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
}

const getURL = async function (req, res) {
    try {
        const urlCode = req.params.urlCode;

        redisClient.expire(urlCode,60)
        let cachedData = await GET_ASYNC(`${req.params.urlCode}`);

        if(cachedData){
            // JSONObject jsonObject = new JSONObject(cachedData)
            var obj = JSON.parse(cachedData)
            console.log(obj)

            return res.status(302).redirect(obj.longUrl)
        }
        else{
            let getData = await urlModel.findOne({urlCode:urlCode})
            if(!getData){
                return res.status(404).send({status:false,message:"Invalid URL code"})
            }
            await SET_ASYNC(`${urlCode}`,JSON.stringify(getData));
            res.status(302).redirect(getData.longUrl)
        }
        
    
    } catch (error) {
        res.status(500).send({ status: false, msg: error.message });
    }
}
module.exports.createShortUrl = createShortUrl
module.exports.getURL = getURL;