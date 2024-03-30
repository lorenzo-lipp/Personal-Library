/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';
const mongoose = require('mongoose');
const mongodb = require('mongodb')
const { Schema } = mongoose;
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
const ObjectID = mongodb.ObjectID;
const bookSchema = new Schema({
  "_id": {type: String, required: true},
  "title": {type: String, required: true},
  "comments": [{type: String}],
  "commentcount": {type: Number, required: true}
}, {
  versionKey: false
});
const Book = mongoose.model('Book', bookSchema);
require('dotenv').config();

module.exports = function (app) {

  app.route('/api/books')
    .get(function (req, res){
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
      Book.find({}, (err, docs) => {
        if (err) {return res.json(err);}
        if (docs.length === 0) {return res.send('no book exists')}
        res.json(docs);
      })
    })
    
    .post(function (req, res){
      let title = req.body.title;
      if (!title) {return res.send('missing required field title')}
      let id = new ObjectID();
      const doc = new Book({
        "_id": id,
        "title": title,
        "commentcount": 0
      })
      doc.save()
        .then((data) => res.json(data))
        .catch((err) => res.json(err));
    })
    
    .delete(function(req, res){
      //if successful response will be 'complete delete successful'
      Book.deleteMany({}, (err, result) => {
        if (err) {return res.json(err)}
        res.send('complete delete successful')
      })
    });



  app.route('/api/books/:id')
    .get(function (req, res){
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
      let bookid = req.params.id;
      Book.findOne({
        "_id": bookid
      }, (err, doc) => {
        if (err || doc === null) {return res.send('no book exists')}
        return res.json(doc)
      });
    })
    
    .post(function(req, res){
      //json res format same as .get
      let bookid = req.params.id;
      let comment = req.body.comment;
      if (!comment) {return res.send('missing required field comment')}
      Book.findOne({
        "_id": bookid
      }, (err, doc) => {
        if (err || doc === null) {return res.send('no book exists')}
        if (!doc.comments) {doc.comments = [];}
        doc.comments.unshift(comment);
        doc.commentcount++;
        doc.save()
          .then(() => res.json(doc))
          .catch((err) => res.json(err));
      });
    })
    
    .delete(function(req, res){
      //if successful response will be 'delete successful'
      let bookid = req.params.id;
      Book.findOneAndDelete({
        "_id": bookid
      }, (err, doc) => {
        if (err || doc === null) {return res.send('no book exists')}
        res.send('delete successful')
      });
    });
  
};
