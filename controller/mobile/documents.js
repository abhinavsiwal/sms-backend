//import require models
const DocumentSchema = require("../../model/documents");
const common = require("../../config/common");
const asyncLoop = require('node-async-loop');
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

exports.uploadDocument = (req, res) => {
    let form = new formidable.IncomingForm();
    form.keepExtensions = true;
    form.parse(req, (err, fields, file) => {
        if (err) {
            console.log(err)
            return res.status(400).json({
                err: "Problem With Data! Please check your data",
            });
        } else {
            var rules = {
                role: 'required|in:STD,STA',
                document_data: 'required',
            }
            if (fields.role == 'STD') {
                rules.class = 'required';
                rules.student = 'required';
                rules.section = 'required';
            } else {
                rules.department = 'required';
                rules.staff = 'required';
            }
            if (common.checkValidationRulesJson(fields, res, rules)) {
                var error = true;
                JSON.parse(fields.document_data).forEach(doc_data => {
                    if ( ! doc_data.name && error){
                        error = false;
                        return res.status(400).json({
                            err: "Document name is required",
                        });
                    } else if ( ! doc_data.description && error){
                        error = false;
                        return res.status(400).json({
                            err: "Document description is required",
                        });
                    } else if ( ! doc_data._id && ! doc_data.documents && error){
                        console.log('asdasdasds')
                        error = false;
                        return res.status(400).json({
                            err: "Documents are required",
                        });
                    } else if ( ! doc_data.upload_date && error){
                        error = false;
                        return res.status(400).json({
                            err: "Upload date is required",
                        });
                    } else if ( ! doc_data.upload_by && error){
                        error = false;
                        return res.status(400).json({
                            err: "Uploaded by is required",
                        });
                    }
                });
                if (error){
                    var params = {
                        category: 'OtherDocs'
                    }
                    if (fields.role == 'STD'){
                        params.student = ObjectId(fields.student);
                        params.class = ObjectId(fields.class);
                        params.section = ObjectId(fields.section);
                    } else {
                        params.staff = ObjectId(fields.staff);
                        params.department = ObjectId(fields.department);
                    }
                    DocumentSchema.updateMany(params,{
                        $set: {
                            is_active: 'N',
                            is_deleted: 'Y'
                        },
                    },
                    (err, data) => {
                        if (err) {
                            return res.status(400).json({
                                err: "Problem in uploading documents. Please try again.",
                            });
                        } else {
                            var final_data = [];
                            asyncLoop(JSON.parse(fields.document_data), function (item, next) { // It will be executed one by one
                                if (item._id){
                                    var params = {
                                        name: item.name,
                                        description: item.description,
                                        category: 'OtherDocs',
                                        upload_date: item.upload_date,
                                        upload_by: item.upload_by,
                                        school: req.params.schoolID,
                                        updatedBy: req.params.id,
                                        is_active: 'Y',
                                        is_deleted: 'N'
                                    }
                                    if (fields.role == 'STD'){
                                        params.student = fields.student;
                                        params.class = fields.class;
                                        params.section = fields.section;
                                    } else {
                                        params.staff = fields.staff;
                                        params.department = fields.department;
                                    }
                                    if (item.documents){
                                        params.documents = item.documents;
                                    }
                                    DocumentSchema.findOneAndUpdate(
                                        {_id: ObjectId(fields._id)},
                                        { $set: params },
                                        {new:true, useFindAndModify: false},
                                    )
                                    .sort({ createdAt: -1 })
                                    .then((result, err) => {
                                        if (err || ! result){
                                            if (err){
                                                console.log(err);
                                            }
                                            return res.status(400).json({
                                                err: "Problem in updating document. Please try again.",
                                            });
                                        } else {
                                            final_data.push(result);
                                            next();
                                        }
                                    });
                                } else {
                                    var params = {
                                        name: item.name,
                                        description: item.description,
                                        documents: item.documents,
                                        category: 'OtherDocs',
                                        upload_date: item.upload_date,
                                        upload_by: item.upload_by,
                                        school: req.params.schoolID,
                                        updatedBy: req.params.id,
                                        is_active: 'Y',
                                        is_deleted: 'N'
                                    }
                                    if (fields.role == 'STD'){
                                        params.student = fields.student;
                                        params.class = fields.class;
                                        params.section = fields.section;
                                    } else {
                                        params.staff = fields.staff;
                                        params.department = fields.department;
                                    }
                                    var documents_data = new DocumentSchema(params);
                                    documents_data.save(function(err,result){
                                        if (err){
                                            console.log(err);
                                            return res.status(400).json({
                                                err: "Problem in uploading documents. Please try again.",
                                            });
                                        } else {
                                            final_data.push(result);
                                            next();
                                        }
                                    })
                                }
                            }, function (err) {
                                return res.status(200).json(final_data);
                            });
                        }
                    });
                }
            }
        }
    });
};


exports.getDocuments = (req, res) => {
    var fields = { ...req.body };
    var rules = {
        role: 'required|in:STD,STA',
    }
    if (fields.role == 'STD') {
        rules.class = 'required';
        rules.student = 'required';
        rules.section = 'required';
    } else {
        rules.department = 'required';
        rules.staff = 'required';
    }
    if (common.checkValidationRulesJson(fields, res, rules)) {
        try {
            var folder_output = [{
                folder_name: "Joining documents",
                documents: []
            },{
                folder_name: "Result",
                documents: []
            },{
                folder_name: "Fees",
                documents: []
            },{
                folder_name: "Accounts",
                documents: []
            }];
            var params = {
                school: ObjectId(req.params.schoolID),
                is_deleted: 'N'
            };
            if (fields.role == 'STD'){
                params.student = fields.student;
                params.class = fields.class;
                params.section = fields.section;
            } else {
                params.staff = fields.staff;
                params.department = fields.department;
            }
            DocumentSchema.find(params)
            .populate('student', 'firstname lastname gender _id email phone')
            .populate('class', '_id name')
            .populate('section', '_id name')
            .populate('staff', 'firstname lastname gender _id email phone')
            .populate('department', '_id name')
            .sort({ createdAt: -1 })
                .then((result, err) => {
                    if (err) {
                        console.log(err);
                        return common.sendJSONResponse(res, 1, "Problem in getting documents. Please try again.", output);
                    } else {
                        var output = [];
                        if (result.length > 0){
                            asyncLoop(result, async function (doc, next) { // It will be executed one by one
                                var document_url = [];
                                // result[key]['document_url'] = [];
                                asyncLoop(doc.documents, async function (d, next_new) { // It will be executed one by one
                                    common.getFileStream(d).then(url => {
                                        document_url.push({
                                            url,
                                            name: d
                                        });
                                        next_new();
                                    });
                                }, function (err) {
                                    output.push({doc, document_url});
                                    next();
                                });
                            }, function (err) {
                                if (output.length > 0){
                                    folder_output.forEach((result, keys) => {
                                        if (result.folder_name == 'Joining documents'){
                                            output.forEach(r => {
                                                folder_output[keys].documents.push({
                                                    document_url: r.document_url,
                                                    _id: r.doc._id,
                                                    name: r.doc.name,
                                                    description: r.doc.description,
                                                    createdAt: r.doc.createdAt,
                                                    updatedAt: r.doc.updatedAt,
                                                })
                                            })
                                        }
                                    })
                                }
                                return common.sendJSONResponse(res, 1, "Documents fetched successfully", folder_output);
                            });
                        } else {
                            return common.sendJSONResponse(res, 1, "Documents fetched successfully", output);
                        }
                    }
                });
        } catch (error) {
            console.log(error);
            return common.sendJSONResponse(res, 0, "Problem in getting documents. Please try again.", null);
        }
    }
};

