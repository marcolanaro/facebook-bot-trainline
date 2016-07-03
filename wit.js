const Wit = require('node-wit').Wit;
const send = require('./send');
const tenants = require('./tenants');

const journeySearch = require('./extensions/journey-search');
const stations = require('./extensions/ttl-station-list-client').stationListClient();
const stationsList = require('./extensions/ttl-station-list-client/stationlist.json');
const didYouMean = require('didyoumean');

const actions = {
  say(sessionId, context, message, cb) {
    send.text(sessionId, message);
    cb();
  },
  merge(sessionId, context, entities, message, cb) {
    const findInputStation = (input) => {
      const name = didYouMean(input, stationsList, 'name');
      return stations.getCodeFromName(name);
    };

    if (entities.intent && entities.intent[0].confidence > 0.45) {
      context.intent = entities.intent[0].value;
      switch (entities.intent[0].value) {
        case 'clear': {
          send.text(sessionId, 'cancellato contesto');
          context = { intent: 'clear' };
          break;
        }
      }
    }
    if (entities.origin && entities.origin[0].confidence > 0.45) {
      context.origin = findInputStation(entities.origin[0].value);
    }
    if (entities.destination && entities.destination[0].confidence > 0.45) {
      context.destination = findInputStation(entities.destination[0].value);
    }
    if (entities.departureDate && entities.departureDate[0].confidence > 0.45) {
      context.departureDate = entities.departureDate[0].value;
    }
    if (entities.datetime && entities.datetime[0].confidence > 0.45) {
      if (!context.departureDate) {
        context.departureDate = entities.datetime[0].value;
      }
    }
    cb(context);
  },
  error(sessionId, context, error) {
  },
  ['fetch_single_bookings'](sessionId, context, cb) {
    if (context.intent === 'booking') {
      journeySearch.fetch(context)
      .then(response => {
        send.generic(sessionId, response);
        cb(context);
      });
    }
  },
  ['get_faq'](sessionId, context, cb) {
    console.log('get_faq')
    switch (context.intent) {
      case 'amend/cancel': {
        send.buttons(sessionId, 'Here some help if you need to cancel or change your ticket:', [
          {
            type: 'web_url',
            url: 'http://ehelp.thetrainline.com/app/answers/detail/a_id/3583',
            title: 'Any ticket',
          },
          {
            type: 'web_url',
            url: 'http://ehelp.thetrainline.com/app/answers/detail/a_id/3586/related/1',
            title: 'Advance ticket',
          },
        ]);
        cb(context);
        break;
      }
      case 'disabledPassengers': {
        send.buttons(sessionId, 'Here some help for disabled passengers:', [
          {
            type: 'web_url',
            url: 'http://ehelp.thetrainline.com/app/answers/detail/a_id/4578',
            title: 'Travel assistance',
          },
          {
            type: 'web_url',
            url: 'http://ehelp.thetrainline.com/app/answers/detail/a_id/1691/related/1',
            title: 'Railcard disabled persons',
          },
        ]);
        cb(context);
        break;
      }
    }
  },
};

const clients = {};

module.exports = (tenantId) => {
  const witToken = tenants.getWitToken(tenantId);
  if (!clients[tenantId]) {
    clients[tenantId] = new Wit(witToken, actions);
  }
  return {
    runActions: clients[tenantId].runActions,
    runPostback: (sessionId, input, context, cb) => {
      const args = input.split('|');
      journeySearch.runPostback(args, context, (error, newContext, message) => {
        send.text(sessionId, message);
      });
    },
  };
};
