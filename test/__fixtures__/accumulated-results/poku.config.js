const { multiSuite } = require('../../../src/index.js');

module.exports = {
  plugins: [multiSuite([{ include: 'suite-a' }, { include: 'suite-b' }])],
};
