const checkValidUrl = require('valid-url')
const shortId = require('shortid')
const urlModel = require('../model/urlModel')


const createShortUrl = async function(req, res){
    try {
        let data = req.body
        let longUrl = data.longUrl
        //======long URL validation=====
        
        if(!longUrl || longUrl == ""){
            res.status(400).send({ status:false, msg:"Long Url is required and Long Url cannot be empty"})
        }
        if(typeof longUrl != "string"){
            res.status(400).send({status:false, msg:"Long Url's type should be string only"})
        }
        if (!checkValidUrl.isWebUri(longUrl.trim())) {
            return res.status(400).send({ status: false, message: "Please Enter a valid URL." });
        }

        //=====check if long URL exists and show its details======
        const findUrlDetails = await urlModel.findOne({ longUrl: longUrl }).select({ longUrl: 1, shortUrl: 1, urlCode: 1, _id: 0 });
        if (findUrlDetails) {
            return res.status(200).send({ status: true, data: findUrlDetails });
        }

        //====if long url is unique then generate URL code and short URL=====
        let uniqueUrlCode = shortId.generate();
        data.urlCode = uniqueUrlCode;
        let shortUrl = "http://127.0.0.1:3000/" + uniqueUrlCode;
        data.shortUrl = shortUrl.toLowerCase();

        //====here we are creating tha data=====
        const createUrlData = await urlModel.create(data);
        const finalResult = await urlModel.findById(createUrlData._id).select({ longUrl: 1, shortUrl: 1, urlCode: 1, _id: 0 });
        res.status(201).send({ status: true, data: finalResult });
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
}


module.exports.createShortUrl =createShortUrl