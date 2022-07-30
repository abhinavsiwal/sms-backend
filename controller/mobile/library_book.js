//import all require dependencies
const formidable = require("formidable");
const _ = require("lodash");
const { v4: uuidv4 } = require('uuid');
//import require models
const Books = require("../../model/book");
const common = require('../../config/common');


//exports routes controller
exports.getBooksByID = (req, res, next, id) => {
    try {
        Books.findById(id).exec((err, books) => {
            if (err || !books) {
                return res.status(400).json({
                    err: "No School Admin was found in Database",
                });
            }
            req.books = books;
            next();
        });
    } catch (error) {
        console.log(error);
    }
};

exports.createBooks = async (req, res) => {
    let form = new formidable.IncomingForm();
    form.keepExtensions = true;

    form.parse(req, async (err, fields, file) => {
        if (err) {
            return res.status(400).json({
                err: "Problem With Data! Please check your data",
            });
        }

        let books = new Books(fields);
        try {
            let bookId = [];
            for (let i = 0; i < fields.quantity; i++) {
                console.log("here");
                bookId.push(uuidv4().slice(0, 8));
            }
            console.log(bookId);
            books.bookID = bookId;
            let book = await books.save();
            res.status(200).json(book);
        } catch (err) {
            return res.status(400).json({
                err: "Please Check Data!",
            });
        }

    });
};

exports.getAllBooksFromKeyword = (req, res) => {
    const keyword = req.body.keyword;
    Books.find({ name: { $regex: keyword, $options: "i" } })
        .populate("section")
        .populate("shelf")
        .exec(function (err, data) {
            if (!data || err) {
                return res.status(403).json({
                    error: "No Product and Company Of that Keyword",
                });
            } else {
                return res.json(data);
            }
        });
};

exports.getBooks = (req, res) => {
    req.json(req.books);
};

exports.updateBooks = (req, res) => {
    let form = new formidable.IncomingForm();
    form.keepExtensions = true;

    form.parse(req, (err, fields) => {
        if (err) {
            return res.status(400).json({
                err: "Problem With Data!",
            });
        }

        let books = req.books;
        books = _.extend(books, fields);
        try {
            books.save((err, books) => {
                if (err) {
                    return res.status(400).json({
                        err: "Update books in Database is Failed",
                    });
                }
                res.json(books);
            });
        } catch (error) {
            console.log(error);
        }
    });
};

exports.getAllBooks = (req, res) => {
    try {
        Books.find({ school: req.schooldoc._id })
            .sort({ createdAt: -1 })
            .populate("section")
            .populate("shelf")
            .then((books, err) => {
                if (err || !books) {
                    return res.status(400).json({
                        err: "Database Dont Have Admin",
                    });
                }
                return res.json(books);
            });
    } catch (error) {
        console.log(error);
    }
};

exports.deleteBooks = (req, res) => {
    let books = req.books;
    try {
        books.remove((err, books) => {
            if (err || !books) {
                return res.status(400).json({
                    err: "Can't Able To Delete books",
                });
            }
            return res.json({
                Massage: `${books.name} is Deleted SuccessFully`,
            });
        });
    } catch (error) {
        console.log(error);
    }
};


exports.getAllocationBooks = (req, res) => {
    try {
        Books.find({ school: req.schooldoc._id, quantity: { $gt:0 } })
            .sort({ createdAt: -1 })
            .select('_id bookID name author quantity')
            .then((books, err) => {
                if (err || ! books || ! books[0]) {
                    if (err){
                        console.log(err);
                    }
                    return common.sendJSONResponse(res, 0, "No book is available.", null);
                } else {
                    return common.sendJSONResponse(res, 1, "Book fetched successfully.", books);
                }
            });
    } catch (error) {
        console.log(error);
        return common.sendJSONResponse(res, 0, "Problem in fetching books list. Please try again.", null);
    }
};

