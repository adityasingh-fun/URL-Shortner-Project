const express = require('express')
const router = express.Router()
const urlController = require('../controller/controller')

router.post('/url/shorten',urlController.createShortUrl)
router.get('/:urlCode',urlController.getURL)

module.exports = router