var Wreck = require('wreck');
var Promise = require('promise');
var moment = require('moment');

var mapCriteria = function(context) {
  return JSON.stringify({
    origin: context.origin,
    destination: context.destination,
    maxJourneys: 5,
    journeyType: 'single',
    adults: 1,
    children: 0,
    outboundJourney: {
      type: 'LeaveAfter',
      time: context.departureDate,
    },
    showCancelledTrains: true,
  });
};

var priceToString = function(price) {
  price / 100
  return ``
}

var getCheapestTicket = function(tickets) {
  return tickets.sort(function(a, b) {
    if (a.totalFare < b.totalFare) {
      return -1;
    }
    if (a.totalFare > b.totalFare) {
      return 1;
    }
    return 0;
  })[0];
}

var mapPayload = function(payload) {
  return payload.journeys.map(journey => {
    const journeyTickets = payload.journeyTickets.filter(journeyTicket => {
      return journeyTicket.journeyId === journey.id;
    });
    const tickets = journeyTickets.map(journeyTicket => {
      return payload.tickets.filter(ticket => {
        return ticket.id === journeyTicket.ticketId;
      })[0];
    });
    const ticket = getCheapestTicket(tickets);
    return {
      title: `${ticket.name}: ${(ticket.totalFare/100).toFixed(2)}£`,
      subtitle: `Dep. at ${moment.parseZone(journey.departureDateTime).format('HH:mm')} - Arr. at ${moment.parseZone(journey.arrivalDateTime).format('HH:mm')}`,
      buttons: [
        {
          type: 'postback',
          title: 'More info',
          payload: `MORE_INFO|${payload.journeySearchId}|${journey.id}|${ticket.id}`,
        },
        {
          type: 'web_url',
          title: 'Buy this ticket',
          url: `https://www.thetrainline.com/m/checkout?searchId=${payload.journeySearchId}&outJourneyId=${journey.id}&adults=1&children=0`,
        },
      ],
    };
  });
}

var fetch = function(context) {
  return new Promise(function (resolve, reject) {
    Wreck.post('https://api.thetrainline.com/mobile/journeys', {
      json: true,
      headers: {
        'X-Api-Version': '2.0',
        'X-Consumer-Version': '940',
        'X-Platform-Type': 'MobileWeb',
        'X-Feature': 'Plan and buy',
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      payload: mapCriteria(context),
    }, function(err, resp, payload) {
      if (payload) {
        resolve(mapPayload(payload));
      }
    });
  });
};

const runPostback = (args, context, cb) => {
  switch (args[0]) {
    case 'MORE_INFO': {
      const message = `Searching more info for searchId=${args[1]}, journeyId=${args[2]}, ticketId=${args[3]}`;
      cb(null, context, message);
      break;
    }
    default:
      return;
  }
};

module.exports = {
  fetch: fetch,
  runPostback: runPostback,
};
