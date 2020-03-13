const R = require("ramda");

// TODO
// store messages to file
// remove messages older than 1 hour

let messages = {};
let counter = 0;

const save = m => {
  messages = m;
  return true;
};

const path = p => R.path(p, messages);
const hasPath = path => R.hasPath(path, messages);
const dissoc = prop => R.dissoc(prop, messages);

const overPath = (id, path, func) =>
  R.over(R.lensPath([id, ...path]), func, messages);

const safeOverPath = (id, path, func) =>
  hasPath([id, ...path]) ? overPath(id, path, func) : undefined;

const safeOverPathAndSave = (id, path, func) => {
  const m = safeOverPath(id, path, func);
  return m !== undefined ? save(m) : undefined;
};

const softAssign = newVal => oldVal =>
  oldVal === undefined ? undefined : newVal;

const softAssoc = (id, path, val) =>
  safeOverPathAndSave(id, path, softAssign(val));

const add = msg => {
  const message = { id: counter++, ...msg };
  messages[message.id] = message;
  return message;
};

const remove = id => (hasPath([id]) ? save(dissoc(id)) : undefined);

const get = id => path([id]);
const getAll = () => messages;

const done = id => softAssoc(id, ["done"], true);
const undone = id => softAssoc(id, ["done"], false);

const toggle = val => (val === undefined ? undefined : !val);
const toggleDone = id => safeOverPathAndSave(id, ["done"], toggle);

const cancel = id => softAssoc(id, ["canceled"], true);

const isAuthor = (authorId, id) => path([id, "authorId"]) === authorId;

module.exports = {
  add,
  get,
  getAll,
  done,
  undone,
  cancel,
  remove,
  isAuthor,
  toggleDone
};
