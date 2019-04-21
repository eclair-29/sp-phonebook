const seneca = require("seneca")();
const Promise = require("bluebird");
const { oracleTest } = require("./repository");

seneca.use("./src/phonebook");
const act = Promise.promisify(seneca.act, { context: seneca });

const routes = [
  // route: GET /oracle
  // description: oracledb testing route
  // access: public
  {
    method: "GET",
    path: "/api/oracle",
    handler: async (request, h) => oracleTest(h)
  },
  // route: POST /users
  // description: create a new user
  // access public
  {
    method: "POST",
    path: "/api/users",
    handler: async (request, h) => {
      const p = { role: "phonebook", cmd: "createUser", request, h };
      const user = await act(p);

      return user;
    }
  },
  // route: POST /users/:id/phones
  // description: add phone number for a specific user
  // access public
  {
    method: "POST",
    path: "/api/users/{id}/phones",
    handler: async (request, h) => {
      const p = { role: "phonebook", cmd: "addPhoneNumbers", request, h };
      const phone = await act(p);

      return phone;
    }
  },
  // route: GET /api/phonebook/search/?q=text
  // description: search phonebook by username
  // access public
  {
    method: "GET",
    path: "/api/phonebook/search",
    handler: async (request, h) => {
      const p = { role: "phonebook", cmd: "searchPhonebook", request, h };
      const result = await act(p);

      return result;
    }
  },
  // route: GET /api/users/:id
  // description: fetch a specific user along with their phone number(s)
  // access public
  {
    method: "GET",
    path: "/api/users/{id}/phones",
    handler: async (request, h) => {
      const p = { role: "phonebook", cmd: "fetchUser", request, h };
      const user = await act(p);

      return user;
    }
  },
  // route: GET /api/phonebook
  // description: get all users along with their phone numbers
  // access public
  {
    method: "GET",
    path: "/api/phonebook",
    handler: async (request, h) => {
      const p = { role: "phonebook", cmd: "fetchPhonebook", request, h };
      const phones = await act(p);

      return phones;
    }
  },
  // route: PUT /api/users/:id
  // description: update data of a specific user
  // access public
  {
    method: "PUT",
    path: "/api/users/{id}",
    handler: async (request, h) => {
      const p = { role: "phonebook", cmd: "updateUser", request, h };
      const user = await act(p);

      return user;
    }
  },
  // route: PUT /api/users/:id/phones/:id
  // description: update a user sepcific number
  // access public
  {
    method: "PUT",
    path: "/api/users/{id}/phones/{phoneId}",
    handler: async (request, h) => {
      const p = { role: "phonebook", cmd: "updatePhoneNum", request, h };
      const phone = await act(p);

      return phone;
    }
  },
  // route: DELETE /api/users/:id
  // description: delete a user along with their phone numbers
  // access public
  {
    method: "DELETE",
    path: "/api/users/{id}",
    handler: async (request, h) => {
      const p = { role: "phonebook", cmd: "deleteUser", request, h };
      const user = await act(p);

      return user;
    }
  }
];

module.exports = routes;
