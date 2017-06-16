'use strict';

module.exports = {
  map: {
    email_frauduleux: '#yw0 > tr:nth-child(2) > td',
    contenu: '#yw0 > tr:nth-child(5) > td',
    votre: '#yw0 > tr:nth-child(6) > td'
  },
  seed: () => {
    const arr = [];
    for (var i = 0; i < 60; i++) {
      arr.push(`https://www.signal-arnaques.com/scam/view/${i}`)
    };

    return arr;
  },
  email: 'barispalaska@gmail.com',
  id: 'deneme',
  workerCount: 2
};
