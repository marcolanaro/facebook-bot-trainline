'use strict';

const wit = require('./wit');
const session = require('./session');
const tenants = require('./tenants');

const send = require('./send');

module.exports = (tenantId, event) => {
  const senderId = event.sender.id;
  session.get(senderId)
  .then(sessionData => {
    if (!sessionData.fbPageToken) {
      sessionData.fbPageToken = tenants.getFbPageToken(tenantId);
      session.save(senderId, sessionData);
    }
    const context = sessionData ? (sessionData.context || {}) : {};
    const isText = event.message && event.message.text;
    const isPostBack = event.postback && event.postback.payload;
    if (isText || isPostBack) {
      const message = isText ? event.message.text : event.postback.payload;
      wit(tenantId).runActions(senderId, message, context, (error, newContext) => {
        sessionData.context = newContext;
        session.save(senderId, sessionData);
      });
    }
    if (event.message && event.message.attachments) {
      event.message.attachments.forEach(attachment => {
        if (attachment.type === 'audio') {
          send.text(senderId, attachment.payload.url);
        }
      })
    }
  });
};
