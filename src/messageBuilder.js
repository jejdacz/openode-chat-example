const messageBuilder = () => {
  const $container = document.createElement("li");
  $container.classList.add("message");

  const createId = val => ($container.id = "id" + val);

  const createDate = val => {
    const date = new Date(val);
    const $d = document.createElement("small");
    $d.innerText =
      date
        .getHours()
        .toString()
        .padStart(2, "0") +
      " : " +
      date
        .getMinutes()
        .toString()
        .padStart(2, "0");
    $container.append($d);
  };

  const createAuthorName = val => {
    const $n = document.createElement("h4");
    $n.innerText = val;
    $container.append($n);
  };

  const createText = val => {
    const $t = document.createElement("p");
    $t.innerText = val;
    $container.append($t);
  };

  const createPayload = payload => {
    const createItem = ({ name, value }) => {
      const $li = document.createElement("li");
      const $name = document.createElement("h5");
      $name.innerText = name;
      const $value = document.createElement("p");
      $value.innerText = value;
      $li.append($name);
      $li.append($value);
      return $li;
    };

    const $ul = document.createElement("ul");
    payload.forEach(i => $ul.append(createItem(i)));
    $container.append($ul);
  };

  const createRemoveButton = cb => {
    const $e = document.createElement("button");
    $e.classList.add("danger");
    $e.innerText = "Remove";
    $e.onclick = function(e) {
      e.stopPropagation();
      cb();
    };
    $container.append($e);
  };

  const createCancelButton = cb => {
    const $e = document.createElement("button");
    $e.classList.add("warning");
    $e.innerText = "cancel";
    $e.onclick = function(e) {
      e.stopPropagation();
      cb();
      $e.remove();
    };
    $container.append($e);
  };

  const createDoneButton = cb => {
    $container.onclick = function() {
      cb();
    };
  };

  const renderDone = val => {
    val
      ? $container.classList.add("done")
      : $container.classList.remove("done");
  };

  const renderCanceled = val => {
    val
      ? $container.classList.add("canceled")
      : $container.classList.remove("canceled");
  };

  const build = () => $container;

  return {
    createId,
    createCancelButton,
    createRemoveButton,
    createDate,
    createText,
    createAuthorName,
    createPayload,
    renderDone,
    renderCanceled,
    createDoneButton,
    build
  };
};

module.exports = messageBuilder;
