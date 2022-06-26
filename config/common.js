var Validator = require('Validator');

var commonFunctions = {
    checkValidationRulesJson: function (request, response, rules) {
        var v = Validator.make(request, rules);
        if (v.fails()) {
            var Validator_errors = v.getErrors();
            for (var key in Validator_errors) {
                error = Validator_errors[key][0];
                break;
            }
            response_data = {
                err: error
            };
            response.status(400).json(response_data);
            return false;
        } else {
            return true;
        }
    }
}
 
module.exports = commonFunctions;