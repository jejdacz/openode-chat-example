const messageBuilder = require("./messageBuilder");

const userMessageParser = ({ cancelMessage, user }) => m => {
  const mb = messageBuilder();
  mb.createId(m.id);
  mb.createDate(m.date);
  mb.createAuthorName(m.authorName);
  mb.createPayload(m.payload);

  if (m.hasOwnProperty("canceled")) {
    mb.renderCanceled(m.canceled);
    if (m.authorId === user.id) {
      !m.canceled && mb.createCancelButton(cancelMessage(m.id));
    }
  }

  m.hasOwnProperty("done") && mb.renderDone(m.done);

  return mb.build();
};

const handlerMessageParser = ({ removeMessage, toggleDone }) => m => {
  const mb = messageBuilder();
  mb.createId(m.id);
  mb.createDate(m.date);
  mb.createAuthorName(m.authorName);
  mb.createPayload(m.payload);
  mb.createRemoveButton(removeMessage(m.id));

  if (m.hasOwnProperty("done")) {
    mb.renderDone(m.done);
    mb.createDoneButton(toggleDone(m.id));
  }

  m.hasOwnProperty("canceled") && mb.renderCanceled(m.canceled);

  return mb.build();
};

module.exports = {
  userMessageParser,
  handlerMessageParser
};
