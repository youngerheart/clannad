const restdaze  = require('./entry');

restdaze.configDB((mongoose) => {
  // connection with mongodb
  mongoose.connect('mongodb://127.0.0.1:27017/restdaze');
});

restdaze.auth((authArr) => {
  console.log(`need auth: ${authArr}`);
  return authArr.slice();
});

restdaze.start(3000);
