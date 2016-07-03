'use strict';

const Wreck = require('wreck');
const session = require('./session');
const Promise = require('promise');
const GRAPH_FACEBOOK_MESSAGES = 'https://graph.facebook.com/v2.6/me/messages';

const getToken = (senderId) => {
  return new Promise(function (resolve, reject) {
    session.get(senderId)
      .then(sessionData => {
        resolve(sessionData.fbPageToken);
      });
  });
};

module.exports = {
  text: (recipientId, textMessage) => {
    getToken(recipientId).then(token => {
      Wreck.post(GRAPH_FACEBOOK_MESSAGES + '?access_token=' + token, {
        payload: JSON.stringify({
          recipient: { id: recipientId },
          message: { text: textMessage },
        }),
        headers: {'Content-Type': 'application/json'},
      }, () => {});
    });
  },
  generic: (recipientId, elements) => {
    getToken(recipientId).then(token => {
      Wreck.post(GRAPH_FACEBOOK_MESSAGES + '?access_token=' + token, {
        payload: JSON.stringify({
          recipient: { id: recipientId },
          message: {
            attachment: {
              type: 'template',
              payload: {
                template_type: 'generic',
                elements,
              },
            },
          },
        }),
        headers: {'Content-Type': 'application/json'},
      }, () => {});
    });
  },
  buttons: (recipientId, text, buttons) => {
    getToken(recipientId).then(token => {
      Wreck.post(GRAPH_FACEBOOK_MESSAGES + '?access_token=' + token, {
        payload: JSON.stringify({
          recipient: { id: recipientId },
          message: {
            attachment: {
              type: 'template',
              payload: {
                template_type: 'button',
                text,
                buttons,
              },
            },
          },
        }),
        headers: {'Content-Type': 'application/json'},
      }, () => {});
    });
  },
};
