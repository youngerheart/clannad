const clannad = require('./entry');

clannad.configDB((mongoose) => {
  // connection with mongodb
  mongoose.connect('mongodb://127.0.0.1:27017/clannad');
});

clannad.auth((authArr) => {
  process.stderr.write(`need auth: ${authArr}\n`);
  return authArr.slice();
});

clannad.start(3000);
