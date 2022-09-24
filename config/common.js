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

    getFileStreamCall: async function (key, callback){
        try {
            const downloadparams = {
                Bucket: process.env.Bucket,
                Key: key,
                Expires: 604800,
            };
            var data = await s3.getSignedUrlPromise("getObject", downloadparams);
            callback(data);
        } catch (error) {
            callback(false);
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

    uploadFile: function(file, name, type, role) {
        if (role == 'STD'){
            var key = `StudentDocs/${name}`;
        } else {
            var key = `StaffDocs/${name}`;
        }
        const params = {
            Bucket: process.env.Bucket,
            Body: file,
            Key: key,
            ContentType: type,
        };
        return s3.upload(params).promise();
    },

    daysDatesByStartEndDate: function (start_date, end_date, include_sunday = true) {
        const listDate = [];
        const startDate = start_date;
        const endDate = end_date;
        const dateMove = new Date(startDate);
        let strDate = startDate;
        while (strDate < endDate) {
            strDate = dateMove.toISOString().slice(0, 10);
            if (!include_sunday && dateMove.getDay() == 0){
            } else {
                listDate.push(strDate);
            }
            dateMove.setDate(dateMove.getDate() + 1);
        };
        return listDate;
    },

    uploadFileS3: function(file, path, type, callback){
        const params = {
            Bucket: process.env.Bucket,
            Body: file,
            Key: path,
            ContentType: type,
        };
        s3.upload(params).promise().then(r => {
            callback(r);
        });
    },

    random_string: function (length) {
        var result = '';
        var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for (var i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    },


    changeDateFormat: function (dateIST) {
        var month = dateIST.getMonth() + 1;
        var date = dateIST.getDate();
        var hours = dateIST.getHours();
        var minutes = dateIST.getMinutes();
        var seconds = dateIST.getSeconds();
        var year = dateIST.getFullYear();
        if (month < 10) {
            month = '0' + month;
        }
        if (date < 10) {
            date = '0' + date;
        }
        if (hours < 10) {
            hours = '0' + hours;
        }
        if (minutes < 10) {
            minutes = '0' + minutes;
        }
        if (seconds < 10) {
            seconds = '0' + seconds;
        }
        var new_date = year + '-' + month + '-' + date + ' ' + hours + ':' + minutes + ':' + seconds;
        return new_date;
    },



}

module.exports = commonFunctions;