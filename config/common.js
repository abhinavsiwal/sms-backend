var Validator = require('Validator');

var aws = require("aws-sdk");
const key = process.env.my_secret;
var encryptor = require("simple-encryptor")(key);

aws.config.update({
    accessKeyId: process.env.accessKeyID,
    secretAccessKey: process.env.secretAccessID,
    region: process.env.region,
});
const s3 = new aws.S3();

var commonFunctions = {
    checkValidationRulesJson: function (request, response, rules, type="") {
        var v = Validator.make(request, rules);
        if (v.fails()) {
            var Validator_errors = v.getErrors();
            for (var key in Validator_errors) {
                error = Validator_errors[key][0];
                break;
            }
            if (type == 'M'){
                response_data = {
                    code: 0,
                    message: error
                };
                response.status(400).json(response_data);

            } else {
                response_data = {
                    err: error
                };
                response.status(400).json(response_data);
            }
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

    getFileStream: async function (key){
        try {
            const downloadparams = {
                Bucket: process.env.Bucket,
                Key: key,
                Expires: 604800,
            };
            var data = await s3.getSignedUrlPromise("getObject", downloadparams);
            return data;
        } catch (error) {
            return 2;
        }
    },

    formatDate: function (date) {
        var dd = date.getDate();
        var mm = date.getMonth() + 1;
        var yyyy = date.getFullYear();
        if (dd < 10) { dd = '0' + dd }
        if (mm < 10) { mm = '0' + mm }
        date = yyyy + '-' + mm + '-' + dd;
        return date
    },


}

module.exports = commonFunctions;