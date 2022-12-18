//import require models
const DocumentSchema = require("../../model/documents");
const Student = require("../../model/student");
const SchoolIdCards = require("../../model/id_card");
const common = require("../../config/common");
const asyncLoop = require('node-async-loop');
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const pdf = require('html-pdf');
const fs = require("fs");

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
            if (fields.role == 'STD'){
                folder_output.push({
                    folder_name: "ID Card",
                    documents: []
                });
            }
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
                                    var keys = 0;
                                    asyncLoop(folder_output, async function (result, next) { // It will be executed one by one
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
                                                });
                                                keys++;
                                                next();
                                            } else if (result.folder_name == 'ID Card'){
                                                Student.findOne({_id: ObjectId(fields.student)})
                                                .populate('school')
                                                .populate('class')
                                                .populate('section')
                                                .then(async (result_, err) => {
                                                    if (err) {
                                                        console.log(err);
                                                        return res.status(400).json({
                                                            err: "Problem in checking student data. Please try again.",
                                                        });
                                                    } else {
                                                        var school_id_card = await SchoolIdCards.findOne({school: ObjectId(req.params.schoolID)}).exec();
                                                        var address =  result_.school.address;
                                                        var pin_code = result_.school.pincode;
                                                        var phone = result_.school.phone;
                                                        var school_name = result_.school.schoolname;
                                                        var color_1 = "#133f86";
                                                        var color_2 = "#c1fafb";
                                                        if (school_id_card && school_id_card.name){
                                                            school_name = school_id_card.name;
                                                        }
                                                        if (school_id_card && school_id_card.address){
                                                            address = school_id_card.address;
                                                        }
                                                        if (school_id_card && school_id_card.contact_no){
                                                            phone = school_id_card.contact_no;
                                                        }
                                                        if (school_id_card && school_id_card.color_1){
                                                            color_1 = school_id_card.color_1;
                                                        }
                                                        if (school_id_card && school_id_card.color_2){
                                                            color_2 = school_id_card.color_2;
                                                        }
                                                        var photo = await common.getFileStream(result_.photo);
                                                        var school_logo = await common.getFileStream(result_.school.photo);
                                                        var html = `
                                                            <!DOCTYPE html>
                                                            <html lang="en">
                                                            <head>
                                                                <meta charset="UTF-8">
                                                                <meta http-equiv="X-UA-Compatible" content="IE=edge">
                                                                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                                                                <title>Document</title>
                                                            </head>
                                                            <body>
                                                                <div className='id__card__wrapper' style="
                                                                    background: linear-gradient(white 46%, ${color_2} 100%);
                                                                    border-radius:12px ;
                                                                    max-width: 500px;
                                                                    margin: auto;
                                                                    box-shadow: 0 0 15px 0 rgb(0 0 0 / 50%);
                                                                    border-radius: 10px;
                                                                    overflow: hidden;  "
                                                                >
                                                                <header style="
                                                                    background-color: ${color_1};
                                                                    color:white;
                                                                    letter-spacing: 10px;
                                                                    padding: 25px 10px;
                                                                    text-transform: uppercase;
                                                                    font-family: Georgia, 'Times New Roman', Times, serif;
                                                                    ">
                                                                    <img style="
                                                                        float: left;
                                                                        max-height: 50px;
                                                                        margin-left: 5px;
                                                                    "
                                                                    src='${school_logo}' alt='logo'/>
                                                                    <div style="
                                                                        text-align: center;
                                                                    ">
                                                                    <div>${school_name}</div>
                                                                    <div>Identity Card</div>
                                                                    </div>
                                                                </header>
                                                                <div>
                                                                    <div style="width: 30%;float:left;max-width: 120px;min-height: 172px;max-height: 172px;border-radius: 15px;margin-left: 27px;box-sizing: border-box;margin-top: 17px;overflow: hidden;">
                                                                    <img style="box-sizing:border-box;width: 100%;filter: none;
                                                                        border-radius: 15px;" src="${photo}" alt="" />
                                                                    </div>
                                                                    <ul style="padding: 15px 20px; width: 60%;margin: 0;list-style: none;float: right;">
                                                                    <li style="
                                                                            color: rgba(0, 0, 0, 0.85);
                                                                            font-size: 14px;
                                                                            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';
                                                                            font-variant: tabular-nums;
                                                                            line-height: 1.5715;
                                                                    "><strong style="  color: ${color_1};">Name :</strong> <span style="font-weight: 700;color: black;">${result_.firstname} ${result_.lastname}</span></li>
                                                                    <li style="
                                                                            color: rgba(0, 0, 0, 0.85);
                                                                            font-size: 14px;
                                                                            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';
                                                                            font-variant: tabular-nums;
                                                                            line-height: 1.5715;
                                                                    "><strong style="  color: ${color_1};">Class :</strong> <span style="font-weight: 700;color: black;">Class-${result_.class.name}</span></li>
                                                                    <li style="
                                                                            color: rgba(0, 0, 0, 0.85);
                                                                            font-size: 14px;
                                                                            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';
                                                                            font-variant: tabular-nums;
                                                                            line-height: 1.5715;
                                                                    "><strong style="  color: ${color_1};">Section :</strong> <span style="font-weight: 700;color: black;">Section ${result_.section.name}</span></li>
                                                                    <li style="
                                                                            color: rgba(0, 0, 0, 0.85);
                                                                            font-size: 14px;
                                                                            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';
                                                                            font-variant: tabular-nums;
                                                                            line-height: 1.5715;
                                                                    "><strong style="  color: ${color_1};">Roll No. :</strong> <span style="font-weight: 700;color: black;">${result_.roll_number}</span></li>
                                                                    <li style="
                                                                            color: rgba(0, 0, 0, 0.85);
                                                                            font-size: 14px;
                                                                            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';
                                                                            font-variant: tabular-nums;
                                                                            line-height: 1.5715;
                                                                    "><strong style="  color: ${color_1};">Gender :</strong> <span style="font-weight: 700;color: black;">${result_.gender}</span></li>
                                                                    <li style="
                                                                            color: rgba(0, 0, 0, 0.85);
                                                                            font-size: 14px;
                                                                            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';
                                                                            font-variant: tabular-nums;
                                                                            line-height: 1.5715;
                                                                    "><strong style="  color: ${color_1};">Date of birth :</strong> <span style="font-weight: 700;color: black;">${result_.date_of_birth.toLocaleDateString()}</span></li>
                                                                    <li style="
                                                                            color: rgba(0, 0, 0, 0.85);
                                                                            font-size: 14px;
                                                                            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';
                                                                            font-variant: tabular-nums;
                                                                            line-height: 1.5715;
                                                                    "><strong style="  color: ${color_1};">Contact No. :</strong> <span style="font-weight: 700;color: black;">+91 ${result_.phone}</span></li>
                                                                    <li style="
                                                                            color: rgba(0, 0, 0, 0.85);
                                                                            font-size: 14px;
                                                                            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';
                                                                            font-variant: tabular-nums;
                                                                            line-height: 1.5715;
                                                                    "><strong style="  color: ${color_1};">Blood Group :</strong> <span style="font-weight: 700;color: black;">${result_.bloodgroup}</span></li>
                                                                    </ul>
                                                                </div>
                                                                <footer style="padding: 10px 20px;line-height: 1.6;text-transform: uppercase;background-color: white;clear: both;">
                                                                    <div>
                                                                    <span >
                                                                        ${address} - ${pin_code} - +91 ${phone}
                                                                    </span>
                                                                    </div>
                                                                </footer>
                                                                </div>
                                                            </body>
                                                            </html>
                                                        `;
                                                        var pdfFilePath = `./pdf/${fields.student_id}.pdf`;
                                                        var options = { format: 'A4' };
    
                                                        pdf.create(html, options).toFile(pdfFilePath, function(err, res2) {
                                                            if (err){
                                                                console.log(err);
                                                                res.status(500).send("Some kind of error...");
                                                                return;
                                                            }
                                                            fs.readFile(pdfFilePath , async function (err,data){
                                                                var content = await fs.readFileSync(pdfFilePath);
                                                                common.uploadFileS3(content, 'id_card_' + fields.student + '.pdf',"application/pdf", function(link){
                                                                    folder_output[keys].documents.push({
                                                                        document_url: link.Location,
                                                                        _id: "",
                                                                        name: "Student ID Card",
                                                                        description: "Student ID Card",
                                                                        createdAt: "",
                                                                        updatedAt: "",
                                                                    });
                                                                    keys++;
                                                                    next();
                                                                });
                                                            });
                                                        });
                                                    }
                                                })
                                            } else {
                                                keys++;
                                                next();
                                            }
                                    }, function (err) {
                                        return common.sendJSONResponse(res, 1, "Documents fetched successfully", folder_output);
                                        // output.push({doc, document_url});
                                        // next();
                                    });
                                }
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

