const path = require("path");
const data = require(path.resolve("test", "data.json"));

console.log("path resolve:", path.resolve());
console.log("path resolve 'test':", path.resolve("test"));
console.log("path resolve src,test:", path.resolve("src", "test"));
console.log("__dirname:", __dirname);

console.log(data);
