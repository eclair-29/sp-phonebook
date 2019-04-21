// Microservice Plugin: Phone service
// A seneca plugin for the phonebook action patterns
const {
  createUser,
  addPhoneNumbers,
  searchPhonebook,
  fetchUser,
  fetchPhonebook,
  updateUser,
  updatePhoneNum,
  deleteUser
} = require("./repository");

module.exports = function phonebook(options) {
  const seneca = this;

  seneca.add({ role: "phonebook", cmd: "createUser" }, (msg, respond) => {
    const user = createUser(msg.request, msg.h);
    respond(null, user);
  });

  seneca.add({ role: "phonebook", cmd: "addPhoneNumbers" }, (msg, respond) => {
    const phone = addPhoneNumbers(msg.request, msg.h);
    respond(null, phone);
  });

  seneca.add({ role: "phonebook", cmd: "searchPhonebook" }, (msg, respond) => {
    const result = searchPhonebook(msg.request, msg.h);
    respond(null, result);
  });

  seneca.add({ role: "phonebook", cmd: "fetchUser" }, (msg, respond) => {
    const user = fetchUser(msg.request, msg.h);
    respond(null, user);
  });

  seneca.add({ role: "phonebook", cmd: "fetchPhonebook" }, (msg, respond) => {
    const phones = fetchPhonebook(msg.request, msg.h);
    respond(null, phones);
  });

  seneca.add({ role: "phonebook", cmd: "updateUser" }, (msg, respond) => {
    const user = updateUser(msg.request, msg.h);
    respond(null, user);
  });

  seneca.add({ role: "phonebook", cmd: "updatePhoneNum" }, (msg, respond) => {
    const phone = updatePhoneNum(msg.request, msg.h);
    respond(null, phone);
  });

  seneca.add({ role: "phonebook", cmd: "deleteUser" }, (msg, respond) => {
    const user = deleteUser(msg.request, msg.h);
    respond(null, user);
  });
};
