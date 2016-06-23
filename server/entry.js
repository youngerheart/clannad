require('babel-core/register');
var app = require('./app');
app.auth((authArr) => {
  console.log(authArr);
  return true;
});

app.start(3000);
