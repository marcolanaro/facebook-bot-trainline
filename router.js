const express = require('express');
const tenants = require('./tenants');
const eventHandler = require('./event');

const router = express.Router();

router.get('/webhooks/:tenantId', function (req, res) {
  const webhookToken = tenants.getWebhookToken(req.params.tenantId);
  if (req.query['hub.verify_token'] === webhookToken) {
    res.send(req.query['hub.challenge']);
  } else {
    res.send('Error, wrong validation token');
  }
});

router.post('/webhooks/:tenantId', function (req, res) {
  req.body.entry.forEach(function(entry) {
    entry.messaging.forEach(function(event) {
      eventHandler(req.params.tenantId, event);
    });
  });
  res.sendStatus(200);
});

module.exports = router;
