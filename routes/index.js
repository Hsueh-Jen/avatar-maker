var express = require('express');
var router = express.Router();
var formidable = require('formidable');
var uuid = require('uuid');
var fs = require('fs');
var path = require('path');
var async = require('async');

function uploadImage(req, res) {
    try {
        var dir = './public/pictures/';
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
        // create an incoming form object
        var form = new formidable.IncomingForm();
        form.multiples = true;
        form.uploadDir = dir;
        var filename = "";
        form.on('file', function (field, file) {

            var ext = file.type.split("/")[1];
            console.log("ext:" + ext);
            var uuid1 = uuid.v1();
            filename = new Date().getTime() + "." + ext;

            fs.rename(file.path, path.join(form.uploadDir, filename));
        });
        form.on('error', function (err) {
            console.log('An error has occured: \n' + err);
        });
        form.on('end', function () {
            res.end(filename);
        });
        form.parse(req);
    } catch (e) {
        console.log("處理錯誤: " + e);
        res.end("");
    }
}


function uploadImage1(req, res) {
    console.log(req.body.base64);

    var base64Data = req.body.base64.replace(/^data:image\/png;base64,/, "");
    console.log(base64Data);
    fs.writeFile("./public/pictures/" + uuid.v1() + ".png", new Buffer(base64Data, 'base64'), function (err) {
        console.log(err);
    });
    try {
        var dir = './public/pictures/';
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
    } catch (e) {
        console.log("處理錯誤: " + e);
        res.end("");
    }
}

/* GET home page. */
router.get('/', function (req, res, next) {
    res.redirect('/vue');
});

/* GET home page. */
router.get('/vue', function (req, res, next) {
    res.render('vue');
});


router.get('/pictures', getImages);
router.get('/config', getConfig);
router.post('/pictures', uploadImage);

module.exports = router;

function getImages(req, res) {
    fs.readdir('./public/pictures', function (err, files) {
        if (files) files.reverse();
        res.send(files);
        return;
    });
}

function getConfig(req,res) {
    async.parallel({
       eyes: function (callback) {
            fs.readdir('./public/images/eye', function (err, files) {
                if(err){
                    callback(err,null);
                }
                callback(null,files);
            });
        },
       mouths: function (callback) {
            fs.readdir('./public/images/mouth', function (err, files) {
                if(err){
                    callback(err,null);
                }
                callback(null,files);
            });
       },
       decos: function (callback) {
            fs.readdir('./public/images/deco', function (err, files) {
                if(err){
                    callback(err,null);
                }
                callback(null,files);
            });
        },
       bgs: function (callback) {
            fs.readdir('./public/images/bg', function (err, files) {
                if(err){
                    callback(err,null);
                }
                callback(null,files);
            });
        }
    }, function (err, result) {
        if(err){
            res.send(err);
        }
            res.send(result);
    });

}
