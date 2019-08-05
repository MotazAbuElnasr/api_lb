const { Client } = require("@elastic/elasticsearch");

const client = new Client({
  node: process.env.ELASTIC_URL,
  auth: {
    username: process.env.ELASTIC_USER,
    password: process.env.ELASTIC_PASSWORD
  }
});

const searchUsers = async user => {
  console.log(user);
  try {
    const { body } = await client.search({
      index: "lb-api",
      filter_path: "hits.hits._source.id,hits.hits._source.fullName",
      body: {
        query: {
          query_string: {
            query: `${user}*`
          }
        }
      }
    });
    const users = body.hits.hits.map(user => {
      return { id: user._source.id, fullName: user._source.fullName };
    });
    return users;
  } catch (error) {
    return error;
  }
};
const saveUser = async user => {
  // const { firstName, id, lastName } = user;
  // try {
  //   await client.index({
  //     index: "lb-api",
  //     body: {
  //       id,
  //       fullName: `${firstName} ${lastName}`
  //     }
  //   });
  //   await client.indices.refresh({ index: "lb-api" });
  // } catch (error) {
  //   console.log("hi");
  //   console.log(error);
  // }
};

const search = (model, filters) => {
  const searchTerms = {
    user: () => {
      searchUsers(filters);
    }
  };
  searchTerms[model]();
};

module.exports = {
  searchUsers,
  saveUser
};
