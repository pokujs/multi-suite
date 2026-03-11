import { multiSuite } from '../../../src/index.js';

export default {
  plugins: [multiSuite([{ include: 'suite-a' }, { include: 'suite-b' }])],
};
