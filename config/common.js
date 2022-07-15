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
    },

    sendJSONResponse: function (res, responsecode, responsemessage, responsedata, total_data=null) {
        if (responsedata !== null) {
            response_data = {
                code: responsecode,
                message: responsemessage,
                data: responsedata
            };
            if(total_data !== null) {
                response_data.total_data= total_data;
            }
            res.status(200).json(response_data);
        } else {
            response_data = {
                code: responsecode,
                message: responsemessage
            };
            res.status(200).json(response_data);
        }
    },

}

module.exports = commonFunctions;