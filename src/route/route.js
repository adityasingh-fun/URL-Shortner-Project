const express = require('express')
const router = express.Router()
const urlController = require('../controller/controller')

router.post('/url/shorten',urlController.createShortUrl)

module.exports = router