const { createTransformNode } = require('../../../transpiler/transformCreator/events');

const LISTENER_ACTION = 'on';

module.exports = {
  transformNode: createTransformNode(LISTENER_ACTION)
};
