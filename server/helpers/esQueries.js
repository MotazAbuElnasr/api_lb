const { Client } = require("@elastic/elasticsearch");

const client = new Client({
  node: "http://olive-439750090.us-east-1.bonsaisearch.net:443",
  auth: "qvh26k165c:mqndmsb0je",
  maxRetries: 5,
  requestTimeout: 60000,
  sniffOnStart: true
});

const searchUsers = filters => {};
const search = (model, filters) => {
  const searchTerms = {
    user: () => {
      searchUsers(filters);
    }
  };
  searchTerms[model]();
};
