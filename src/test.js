const clannad  = require('./entry');

clannad.configDB((mongoose) => {
  // connection with mongodb
  mongoose.connect('mongodb://127.0.0.1:27017/clannad');
});

clannad.auth((authArr) => {
  console.log(`need auth: ${authArr}`);
  return authArr.slice();
});

clannad.start(3000);
