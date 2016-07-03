'use strict';

// move this to datastore

const tenants = {
  1: {
    id : '1',
    webhookToken: 'my_token1',
    fbPageToken: 'my_facebook_page_token',
    witToken: 'my_wit_token',
  },
  getWebhookToken: (id) => {
    return tenants[id].webhookToken;
  },
  getFbPageToken: (id) => {
    return tenants[id].fbPageToken;
  },
  getWitToken: (id) => {
    return tenants[id].witToken;
  },
}

module.exports = tenants;
