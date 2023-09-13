const {validationResult} = require('express-validator');

module.exports = validate = (validations) => {
  return async (request, response, next) => {
    await Promise.all(validations.map((validation) => validation.run(request)));
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
      return response.status(401).json({error: errors.array()});
    }
    next();
  };
};
