var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');

var UserSchema = require('../models/user');
var User = UserSchema.User
var File = UserSchema.File

var passport = require('passport');
var bcrypt = require('bcrypt');
var multer = require('multer');
var path = require('path');
var fs = require('fs');
var SHA3 = require('sha3');
var Web3 = require('web3');
var solc = require('solc');
var exphbs = require('express-handlebars');

var expressValidator = require('express-validator');
var mid = require('../middleware');

//web3 provider
web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

var accounts;
web3.eth.getAccounts().then((acc) => accounts = acc); //Comment this out when TestRPC isn't running
var contractCom = solc.compile(fs.readFileSync('contracts/holdNDA.sol').toString());
// var contractAddress = "0x114a97143240c414f9117393e3f8c4c33860b4f6";
var contractABI = JSON.parse(contractCom.contracts[':HoldNDA'].interface);
var holdNDA = new web3.eth.Contract(contractABI);

var contractByteCode = contractCom.contracts[':HoldNDA'].bytecode;
var contractInstance;


var hbs = exphbs.create({
    // Specify helpers which are only registered on this instance.
    helpers: {
        foo: function() { return 'foo.'; },
        bar: function() { return 'BAR!'; }
    }
});

// GET /google
router.get('/google', passport.authenticate('google', {
    scope: ['profile']
}));

// GET /
router.get('/', function(req, res, next) {
    return res.render('index', { title: 'Home' });
});

// GET /about
router.get('/about', function(req, res, next) {
    return res.render('about', { title: 'About' });
});

//GET /login
router.get('/login', mid.loggedOut, function(req, res, next) {
    return res.render('login', { title: 'Login', messageLogin: req.flash('logoutMessage'), errorsLogin: req.session.errorsLogin });
});

//POST /login
router.post('/login', function(req, res, next) {
    req.checkBody('email', 'Email is required.').notEmpty();
    req.checkBody('password', 'Password is required.').notEmpty();

    var errors = req.validationErrors();

    if (errors) {
        //If there are errors DO THIS
        console.log(errors);
        req.session.errorsLogin = errors;
        console.log(req.session.errorsLogin);

        res.redirect('login')


    } else {
        User.authenticate(req.body.email, req.body.password, function(error, user) {
            req.checkBody('username', 'User not found!').isLength({ min: 500 });
            var errors2 = req.validationErrors();
            if (error || !user) {
                req.session.errorsLogin = errors2;
                res.redirect('login');
            } else {

                req.session.userEmail = user.email;
                req.session.userFullname = user.fullname;
                req.session.userHashes = user.hashes;
                req.session.userId = user._id;


                // hbs.registerHelper('trimString', function(passedString) {
                //              var theString = passedString.substring(0,27);
                //              return new Handlebars.SafeString(theString)
                // });

                return res.redirect('upload')
            }
        })
    }
});

//GET /contract
router.get('/contract', mid.requiresLogin, function(req, res, next) {
    return res.render('contract', { title: 'Find a Smart Contract', layout: 'layoutB.hbs',hashError: req.flash('hashError'),  findHash: req.session.findHash, userEmail: req.session.userEmail, userFullname: req.session.userFullname });
});

//POST /contract
router.post('/contract', function(req, res, next) {
    var findAddress = req.body.contractAddress;
    console.log('4')
    if( findAddress.indexOf("0x") > -1 && findAddress.length == 42){
        console.log('1')
        var newholdNDA = new web3.eth.Contract(contractABI, findAddress)
            if(newholdNDA == null){
                console.log('2')
                req.flash('hashError', 'Hash not found!');
                return res.redirect('contract')
            }else{
                console.log('3')
                newholdNDA.methods.callHash().call(function(error, result){
                    req.session.findHash = result
                    return res.redirect('contract')
                });
            }
    }else{
        console.log('5')
        req.session.findHash = null; 
        req.flash('hashError', 'Address entered is not correct');
        return res.redirect('contract');
    }
    console.log('6')
});

//GET /review
router.get('/review', mid.requiresLogin, function(req, res, next) {

    User.findById(req.session.userId, function(err, user) {
        if (err) throw err;

        req.session.files = []
    
        for (var i = 0; i < user.files.length; i++) {
            p = {}
            p.originalName = user.files[i].originalname;
            p.hash = user.files[i].hash;
            p.time = user.files[i].time;
            p.contractAddress = user.files[i].contractaddress;
            p.index = i;


            req.session.files.push(p);
        }

        return res.render('review', {
            title: 'Review',
            layout: 'layoutB.hbs',
            files: req.session.files,
            userEmail: req.session.userEmail,
            userFullname: req.session.userFullname,
            helpers: {
                foo: function() { return 'foo.'; }
            }
        });

    });

});

// router.get('/review', function(req, res, next) {
//     console.log(req.params.id);
//     console.log('here')
//     res.redirect("review");
//     // function getId() {
//     //     var x = document.getElementsByTagName("I")[0];
//     //     console.log(x.id);
//     //     res.redirect("review");
//     // }
// });

//GET /logout
router.get('/logout', function(req, res, next) {
    if (req.session) {
        req.flash('logoutMessage', 'Successfully Logged Out');
        req.session.destroy(function(err) {
            if (err) {
                return next(err);
            } else {
                return res.redirect('login');
            }
        });
    }
});

// GET /register
router.get('/register', mid.loggedOut, function(req, res, next) {
    res.render('register', { title: 'Sign Up', messageReg: req.flash('authMessage'), errorsReg: req.session.errorsReg });
    req.session.success = null;
});

// POST /register
router.post('/register', function(req, res, next) {
    //Check validity
    req.checkBody('fullname', 'Name is required.').notEmpty();
    req.checkBody('username', 'Username is required.').notEmpty();
    req.checkBody('username', 'Username must be less than 100 characters.').isLength({ max: 100 });
    req.checkBody('email', 'Email is required.').notEmpty();
    req.checkBody('password', 'Password is required.').notEmpty();
    req.checkBody('confirmPassword', 'Confirm Password is required.').notEmpty();
    req.check('password', 'Passwords do not match').equals(req.body.confirmPassword);

    var errors = req.validationErrors();
    if (errors) {
        //If there are errors DO THIS
        req.session.errorsReg = errors;
        res.redirect("register")
    } else {
        //If there are NO errors DO THIS

        //create object with form input
        var userData = {
            fullname: req.body.fullname,
            username: req.body.username,
            email: req.body.email,
            password: req.body.password
        };

        //use schema's 'create' method to insert document into Mongo
        User.create(userData, function(error, user) {
            console.log('here')
            if (error) {
                req.flash('authMessage', 'User already exists');
                return res.redirect('register');
            } else {
                req.flash('signupMessage', 'Successfully registered');
                return res.redirect('login');
            }
        });
    }
});

// GET /upload
router.get('/upload', mid.requiresLogin, function(req, res, next) {
    return res.render('upload', { title: 'Upload', layout: 'layoutB.hbs', uploadError: req.flash('uploadError'), uploadSuccess: req.flash('uploadSuccess'), userEmail: req.session.userEmail, userFullname: req.session.userFullname });
});

// Set Storage Engine
var storage = multer.diskStorage({
    destination: './public/uploads/',
    filename: function(req, file, cb) {
        req.session.time = new Date().toISOString().split(".")[0].replace('T',' : ');
        cb(null, file.originalname.split('.')[0] + "-" + req.session.time +
            path.extname(file.originalname));
    }
});

//Multer
var upload = multer({
    storage: storage,
    limits: { fileSize: 20000000 },
    fileFilter: function(req, file, cb) {
        checkFileType(file, cb);
    }
}).single('fileUpload');

//Check File Type
function checkFileType(file, cb) {
    // allowed ext
    var filetypes = /pdf|txt|docx/;
    //Check ext
    var extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    //Check mime
    var mimetype = filetypes.test(file.mimetype);

    if (extname) {
        return cb(null, true);
    } else {
        cb("Error: Incorrect file type!");
    }
};

router.post('/upload', function(req, res, next) {
    upload(req, res, (err) => {
        //err is getting passed from checkFileType
        if (err) {
            //PROBLEM: if file size is too large, err is an object and we need a string to be passed here, not an object
            console.log(err);
            req.flash('uploadError', err);
            res.redirect('upload')
        } else {
            console.log(req.file);
            if (req.file == undefined) {
                req.flash('uploadError', 'No file was uploaded!');
                res.redirect('upload');
            } else {
                //Reads the data in the file & hashes it
                var name = req.file.filename;
                var d = new SHA3.SHA3Hash(224);
                fs.readFile('public/uploads/' + name, 'utf8', function(error, data) {
                    var mime = req.file.mimetype;
                    if (mime == 'application/pdf') {
                        var pdfParser = new PDFParser(this, 1);
                        pdfParser.loadPDF('public/uploads/' + name);
                        pdfParser.on("pdfParser_dataError", errData => console.error(errData.parserError));
                        pdfParser.on("pdfParser_dataReady", pdfData => {
                            var txtName = req.file.filename.replace(".pdf", ".txt");
                            fs.writeFile("public/uploads/" + txtName, pdfParser.getRawTextContent(), function(error) {
                                if (error) throw error;
                                fs.readFile('public/uploads/' + txtName, 'utf8', function(error, data) {
                                    if (error) throw error;
                                    d.update(data);
                                    var shawed = d.digest('hex');
                                    console.log(shawed);
                                    //console.log(res.locals.loggedIn);
                                    
                                    //Passes sha3 hash to the smart contract and deploys to blockchain
                                    function smartContract(callback){
                                        holdNDAtx = holdNDA.deploy({
                                            data: contractByteCode,
                                            arguments: [shawed]
                                        });
                                        holdNDAtx.send({
                                            from: accounts[0],
                                            gas: 1500000
                                        })
                                        .then((instance) => {
                                            contractInstance = instance;
                                            contractInstance.methods.callHash().call().then(console.log);
                                            callback(contractInstance.options);
                                        });
                                    };
                                    //^^^^^^^^^Smart Contract^^^^^^^^^

                                    smartContract(function(smartContractData){
                                        req.session.contractAddress = smartContractData.address;

                                        var fileData = {
                                            path: req.file.path,
                                            originalname: req.file.originalname,
                                            mimetype: req.file.mimetype,
                                            hash: shawed,
                                            time: req.session.time,
                                            contractaddress: req.session.contractAddress
                                        };

                                        File.create(fileData, function(err, file) {
                                            if (err) throw err;

                                            //Finds the User schema by its ID and pushes the File schema into the files array
                                            User.findByIdAndUpdate(req.session.userId, { $push: { files: {$each: [file], $position: 0} } }, { new: true }, function(err, user) {
                                                if (err) throw err;
                                            });
                                        });
                                    });
                                });
                            });
                        });
                    } else {
                        console.log(data);
                        d.update(data);
                        var shawed = d.digest('hex');
                        console.log(shawed);

                        //holdNDAtx = holdNDA.deploy({
                        // data: contractByteCode,
                        // arguments: [shawed]
                        // });
                        // holdNDAtx.send({
                        //   from: accounts[0],
                        //   gas: 1500000
                        // }).then((instance) => {contractInstance = instance;
                        // contractInstance.methods.callHash().call().then(console.log);
                        // });
                    }
                });
                req.flash('uploadSuccess', 'File was uploaded!');
                file: `uploads/${req.file.filename}`
                res.redirect('upload');
            };
        };
    });
});


module.exports = router;