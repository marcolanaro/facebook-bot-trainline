const gcloud = require('gcloud');
const Promise = require('promise');

const send = require('./send');

const datastore = gcloud.datastore({
  projectId: 'testmessangerbot',
});

const getKey = (id) => datastore.key(['session', id]);

module.exports = {
  get: (id) => {
    return new Promise((resolve, reject) => {
      datastore.get(getKey(id), function(err, entity) {
        resolve(entity && entity.data ? entity.data : {});
      });
    });
  },
  save: (id, data) => {
    return new Promise((resolve, reject) => {
      datastore.save({
        key: getKey(id),
        data: data,
      }, function(err) {
        if (!err) {
          resolve(true);
        } else {
          reject(err);
        }
      });
    });
  },
};
