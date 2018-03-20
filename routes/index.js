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

// //web3 provider
// web3 = new Web3(new Web3.providers.HttpProvider("https://ropsten.infura.io/hBKTegPiy2HRjGWNRsFP"));

// var accounts;
// web3.eth.getAccounts().then((acc) => accounts = acc); //Comment this out when TestRPC isn't running
// console.log(accounts)
// var contractCom = solc.compile(fs.readFileSync('contracts/holdNDA.sol').toString());
// // var contractAddress = "0x114a97143240c414f9117393e3f8c4c33860b4f6";
// var contractABI = JSON.parse(contractCom.contracts[':HoldNDA'].interface);
// var holdNDA = new web3.eth.Contract(contractABI);

// var contractByteCode = contractCom.contracts[':HoldNDA'].bytecode;
// var contractInstance;

// GET /google
router.get('/google', passport.authenticate('google', {
    scope: ['profile']
}));

// GET /
router.get('/', function(req, res, next) {

    var fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
    req.session.url = fullUrl;

    return res.render('index', { title: 'DocuHash', hash: req.session.shawed });
});

// // GET /about
// router.get('/about', function(req, res, next) {
//     return res.render('about', { title: 'About - DocuHash' });
// });

//GET /login
router.get('/login', mid.loggedOut, function(req, res, next) {
    return res.render('login', { title: 'Login - DocuHash', messageLogin: req.flash('logoutMessage'), errorsLogin: req.session.errorsLogin });
});

//POST /login
router.post('/login', function(req, res, next) {
    req.checkBody('email', 'Email is required.').notEmpty();
    req.checkBody('password', 'Password is required.').notEmpty();

    var errors = req.validationErrors();

    if (errors) {
        //If there are errors DO THIS
        //console.log(errors);
        req.session.errorsLogin = errors;
        //console.log(req.session.errorsLogin);

        res.redirect('login')


    } else {
        User.authenticate(req.body.email, req.body.password, function(error, user) {
            //for some reason req.flash only lets you send 1 message thru handlebars
            //so we use express validator in this way
            req.checkBody('username', 'User not found!').isLength({ min: 500 });
            var errors2 = req.validationErrors();
            if (error || !user) {
                req.session.errorsLogin = errors2;
                res.redirect('login');
            } else {
                //if authentication succeeds
                req.session.errorsLogin = null;
                req.session.userEmail = user.email;
                req.session.userFullname = user.fullname;
                req.session.userHashes = user.hashes;
                req.session.userId = user._id;

                return res.redirect('review')
            }
        })
    }
});

//GET /contract
router.get('/contract', function(req, res, next) {
    return res.render('contract', { title: 'Find Hash - DocuHash', layout: 'layoutA.hbs'});
});

// //POST /contract
// router.post('/contract', function(req, res, next) {
//     var findAddress = req.body.contractAddress;
//     if (web3.utils.isAddress(findAddress)) {
//         var newholdNDA = new web3.eth.Contract(contractABI, findAddress)
//         newholdNDA.methods.callHash().call(function(error, result) {
//             if (error) {
//                 req.flash('hashError', 'Hash not found!');
//                 return res.redirect('contract')
//             }
//             req.session.findHash = result
//             return res.redirect('contract')
//         });
//     } else {
//         req.session.findHash = null;
//         req.flash('hashError', 'Invalid Ethereum Address');
//         return res.redirect('contract');
//     }

// });

//GET /review
router.get('/review', mid.requiresLogin, function(req, res, next) {

    // var currentURL = window.location.hostname;
    // console.log(currentURL)

    User.findById(req.session.userId, function(err, user) {
        if (err) throw err;

        req.session.files = []

        for (var i = 0; i < user.files.length; i++) {
            p = {}
            p.originalName = user.files[i].originalname;
            p.hash = user.files[i].hash;
            p.time = user.files[i].time;
            p.contractAddress = user.files[i].contractaddress;
            p.txHash = user.files[i].txhash;
            p.index = i;

            //When contractAddress gets put into mongo db and it is undefined, it turns undefined into a string
            //we need to remove the string so handlebars wont display undefined data
            if(p.contractAddress == 'undefined'){
                p.contractAddress = undefined;
            }
            if(p.txHash == 'undefined'){
                p.txHash = undefined;
            }
            req.session.files.push(p);
        }

        return res.render('review', {
            title: 'Review - DocuHash',
            layout: 'layoutB.hbs',
            files: req.session.files,
            userEmail: req.session.userEmail,
            userFullname: req.session.userFullname
        });

    });

});

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
    req.session.success = null;
    res.render('register', { title: 'Sign Up - DocuHash', messageReg: req.flash('authMessage'), errorsReg: req.session.errorsReg });
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

    //list of all errors
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
            if (error) {
                console.log(error)
                req.session.errorsReg = null;
                req.flash('authMessage', 'User already exists');
                return res.redirect('register');
            } else {
                req.session.errorsReg = null;
                req.flash('signupMessage', 'Successfully registered');
                return res.redirect('login');
            }
        });
    }
});

// //GET /upload
// router.get('/upload', mid.requiresLogin, function(req, res, next) {
//     req.session.url = null;
//     return res.render('upload', { title: 'Upload', layout: 'layoutB.hbs', uploadError: req.flash('uploadError'), uploadSuccess: req.flash('uploadSuccess'), userEmail: req.session.userEmail, userFullname: req.session.userFullname });
// });

// Set Storage Engine
var storage = multer.diskStorage({
    destination: './public/uploads/',
    filename: function(req, file, cb) {
        req.session.time = new Date().toISOString().split(".")[0].replace('T', ' : ');
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
            console.log(err)
            req.flash('uploadError', 'Unknown Error');
            res.redirect('upload')
        } else {
            //if the file uploaded is undefined, it means that they didnt submit a file
            if (req.file == undefined) {
                req.flash('uploadError', 'No file was uploaded!');
                res.redirect('upload');
            }else {
                function passData(callback){
                    //Reads the data in the file & hashes it
                    var name = req.file.filename;
                    //reads the file and gets the data
                    fs.readFile('public/uploads/' + name, 'utf8', function(error, data) {
                        var mime = req.file.mimetype;
                        var newData = data
                        var newPdfData = null;
                        //If the file uploaded was a pdf, this will execute
                        if (mime == 'application/pdf') {
                            //PDF parser
                            var pdfParser = new PDFParser(this, 1);
                            pdfParser.loadPDF('public/uploads/' + name);
                            pdfParser.on("pdfParser_dataError", errData => console.error(errData.parserError));
                            pdfParser.on("pdfParser_dataReady", pdfData => {
                                var txtName = req.file.filename.replace(".pdf", ".txt");
                                req.session.txtName = txtName;
                                fs.writeFile("public/uploads/" + txtName, pdfParser.getRawTextContent(), function(error) {
                                    if (error) throw error;
                                    fs.readFile('public/uploads/' + txtName, 'utf8', function(error, pdfData) {
                                        if (error) throw error;
                                        newPdfData = pdfData;
                                        newData = null;
                                        callback(newData, newPdfData);
                                    });
                                });
                            });    
                        }else{
                            callback(newData, newPdfData);
                        }
                    });
                };
                passData(function(txtData, pdfData){
                    //deletes the file from the public/uploads folder
                    fs.unlink('public/uploads/' + req.file.filename, (err) => {
                        if (err) throw err;
                        //if the file was a pdf, it means we need to delete the pdf AND the txt files that were created
                        if(req.file.mimetype == 'application/pdf'){
                            fs.unlink('public/uploads/' + req.session.txtName, (err) => {
                                if (err) throw err;
                            });
                        }
                    });

                    //needed to create a hash
                    var d = new SHA3.SHA3Hash(224);
                    //if a txt file was uploaded hash that data, else hash the data from a pdf
                    if(txtData){  d.update(txtData); 
                    }else{ d.update(pdfData) }

                    var shawed = d.digest('hex');
                    req.session.shawed = shawed;

                    //console.log(res.locals.loggedIn);

                    //req.flash('uploadSuccess', 'File was uploaded!');
                    file: `uploads/${req.file.filename}`

                    //var homeUrl = req.protocol + '://' + req.get('host') + '/';

                    req.session.existingHash = null;
                    req.session.existingUserHash = null;

                    //Finds if a file already exists with a hash
                    //then calls back to the function that called it
                    function existingHash(callback) {
                        //console.log(req.session.shawed)
                        File.findOne({ hash: { $exists: true, $in: [req.session.shawed] } }, function(err, file) {
                            if (err) throw err;
                            if(file){
                                req.session.existingHash = true;
                                User.findOne({$and:[{"_id":req.session.userId},{"files.hash":req.session.shawed}]}, function(err,userFile){
                                    if (err) throw err;
                                    if(userFile){
                                        req.session.existingUserHash = true;
                                        callback()
                                    }else{
                                        callback()
                                    }
                                });
                            }else{
                                callback()
                            }
                        });
                    };

                    //this will get called back to with data saying whether a file already exists with that hash
                    existingHash(function() {
                        //if req.session.url == homeUrl then the user is using the drag and drop upload
                        //we must send the document hash to the client and redirect page from the client side
                        res.send(JSON.stringify({ hash: req.session.shawed, exists: req.session.existingHash }));

                        //if the file doesnt exist in the DB
                        if (req.session.existingHash != true) {
                            //Passes sha3 hash to the smart contract and deploys to blockchain
                            // function smartContract(callback){
                            //     holdNDAtx = holdNDA.deploy({
                            //         data: contractByteCode,
                            //         arguments: [shawed]
                            //     });
                            //     holdNDAtx.send({
                            //         from: accounts[0],
                            //         gas: 1500000
                            //     })
                            //     .then((instance) => {
                            //         contractInstance = instance;
                            //         contractInstance.methods.callHash().call().then(console.log);
                            //         callback(contractInstance.options);
                            //     });
                            //};
                            //^^^^^^^^^Smart Contract^^^^^^^^^

                            //smartContract(function(smartContractData){
                            //req.session.contractAddress = smartContractData.address;

                            var fileData = {
                                path: req.file.path,
                                originalname: req.file.originalname,
                                mimetype: req.file.mimetype,
                                hash: shawed,
                                time: req.session.time,
                                contractaddress: 'undefined',
                                txhash: 'undefined'
                            };

                            File.create(fileData, function(err, file) {
                                if (err) throw err;

                                if (res.locals.loggedIn) {
                                    //Finds the User schema by its ID and pushes the File schema into the files array
                                    User.findByIdAndUpdate(req.session.userId, { $push: { files: { $each: [file], $position: 0 } } }, { new: true }, function(err, user) {
                                        if (err) throw err;
                                    });
                                };
                            });
                            //});
                        };
                        //if file exists in the filesDB but not in the usersDB, add it to the usersDB
                        if(req.session.existingHash == true && req.session.existingUserHash != true){
                            //finds a file in the filesDB and returns that file
                            File.findOne({ hash: { $exists: true, $in: [req.session.shawed] } }, function(err, file) {
                            if (err) throw err;      
                                //if the user is loggedin                                      
                                if (res.locals.loggedIn){
                                    //add the returned file into the usersDB
                                    User.findByIdAndUpdate(req.session.userId, { $push: { files: { $each: [file], $position: 0 } } }, { new: true }, function(err, user) {
                                        if (err) throw err;
                                    });
                                };
                            });
                        };
                    });
                });
            };
        };
    });
});

//This page will ask the user if they want to put their document hash on the blockchain
router.get('/info/:shawed', function(req, res, next) {
    var shawed = req.params.shawed;
    req.session.currentShaw = shawed;
    req.session.currentTxHash = null;
    req.session.currentHashTime = null;
    req.session.exists= null;
    req.session.currentAddress = null;



    //Since the users can put anything in the url after /info/ 
    //we need to check if what was entered is a valid hash, this callback function will check that
    function findHash(callback) {
        var addressExists = false;
        //checks if the hash exists and is equal to the hash provided
        File.findOne({ hash: { $exists: true, $in: [shawed] } }, function(err, hash) {
            if(err) throw err;
            if (hash) {
                req.session.currentHashTime = hash.time;
                req.session.exists = true;

                //checks if the Transaction hash exists, if so set it to a variable that will be passed to the client
                File.findOne({$and:[{ "hash": { $exists: true, $in: [shawed] } },{"txhash":{$exists:true, $ne: 'undefined'}}]}, function(err, hash) {
                    if(err) throw err;
                    if(hash){
                        req.session.currentTxHash = hash.txhash
                    }
                })
                //finds the document that matches the hash again AND checks if the "contractaddress" is not equal to null
                File.findOne({$and:[{ "hash": { $exists: true, $in: [shawed] } },{"contractaddress":{$exists:true, $ne: 'undefined'}}]}, function(err, address) {
                    if(err) throw err
                    if(address){
                        req.session.currentAddress = address.contractaddress;
                        req.session.currentTxHash = address.txhash
                        addressExists = true;
                        callback(req.session.exists, addressExists);
                    }else{
                        callback(req.session.exists, addressExists);
                    }
                });
            }else{
                callback(req.session.exists, addressExists);
            }
        });
    }
    findHash(function(foundHash, foundAddress) {
        return res.render('info', { title: 'Info - DocuHash', layout: 'layoutA.hbs', exists: foundHash, addressExists: foundAddress, hash: req.session.currentShaw, time: req.session.currentHashTime, txHash: req.session.currentTxHash, contractAddress: req.session.currentAddress });
    })
});

// router.post("/info", function(req, res, next) {
//     console.log('here')

//     //Passes sha3 hash to the smart contract and deploys to blockchain
//     //function smartContract(callback){
//         // holdNDAtx = holdNDA.deploy({
//         //     data: contractByteCode,
//         //     arguments: [req.session.currentShaw]
//         // });
//         // holdNDAtx.send({
//         //     from: accounts[0],
//         //     gas: 1500000
//         // })
//         // .then((instance) => {
//         //     contractInstance = instance;
//         //     contractInstance.methods.callHash().call().then(console.log);
//         //     callback(contractInstance.options);
//         // });
//         // holdNDA.deploy({
//         //     data: contractByteCode,
//         //     arguments: [req.session.currentShaw]
//         // }).send({
//         //     from: accounts[0],
//         //     gas: 1500000,
//         //     gasPrice: '30000000000000' 
//         // },function(error, transactionHash){
//         // }).on('error', function(error){ 
//         //     if (error) throw error;
//         // }).on('transactionHash', function(transactionHash){  
//         //     console.log(transactionHash);
//         //     req.session.txHash = transactionHash;
//         // }).then(function(holdNDAInstance){
//         //     console.log(holdNDA.options.address) // instance with the new contract address
//         //     //callback(holdNDA.options)
//         // });
//     //};
//     // ^^^^^^^^^Smart Contract^^^^^^^^^

//     // smartContract(function(smartContractData){
//     //     console.log(smartContractData)
//     //     req.session.contractAddress = smartContractData.address;
//     // });

// });

//Sole purpose of this is to send the client the current document's hash
router.get('/hash', function(req, res, next) {
    //the client will call this function and set the req.session.exists variable to null
    //in doing so, if a user types in /hash into the browser, they will get an error
    //because /hash should not be visible to any users
    if (req.session.exists) {
        req.session.exists = false
        return res.send(JSON.stringify({ hash: req.session.currentShaw }));
    } else {
        var err = new Error('Page Does Not Exist');
        error.status = 401;
        return next(err);
    }
})

//retrieves the contract address from the client
router.post('/hash', function(req, res, next) {
    var obj = req.body
    //console.log(obj);
    req.session.txHash = String(obj.txHash);
    req.session.contractAddress = String(obj.contractAddress);

    //if the txHash is undefined, it means the address wasn't retrieved when the TxHash was created,
    //and the user is checking later if the address is there 
    if(req.session.txHash == 'undefined'){
        //Add the smart contract address to the file schema
        File.findOneAndUpdate({ hash: req.session.currentShaw }, { $set: { contractaddress: req.session.contractAddress } }, function(err, doc) {
            if (err) throw err;
        });

        //only do this if a user is logged in
        if (res.locals.loggedIn) {
            addressString = String(req.session.contractAddress)
            //Add the smart contract address and TX hash to the Users schema
            User.findOneAndUpdate({$and:[{"_id":req.session.userId},{"files.hash":req.session.currentShaw}]},{$set: {"files.$.contractaddress": req.session.contractAddress }}, function(err, doc){
               if(err) throw err;
            })
        };
    }else{
        //Add the smart contract address to the file schema
        File.findOneAndUpdate({ hash: req.session.currentShaw }, { $set: { contractaddress: req.session.contractAddress, txhash: req.session.txHash } }, function(err, doc) {
            if (err) throw err;
        });

        //only do this if a user is logged in
        if (res.locals.loggedIn) {
            addressString = String(req.session.contractAddress)
            //Add the smart contract address and TX hash to the Users schema
            User.findOneAndUpdate({$and:[{"_id":req.session.userId},{"files.hash":req.session.currentShaw}]},{$set: {"files.$.contractaddress": req.session.contractAddress, "files.$.txhash": req.session.txHash}}, function(err, doc){
               if(err) throw err;
            })
        };
    } 

    return res.sendStatus(200)
});

//retrieves the hash of the document that the user wants to delete
router.post('/delDoc',function(req,res,next){
    var del = false
    var obj = req.body
    req.session.delHash = String(obj.hash)
    //console.log(req.session.delHash);
    
    User.findByIdAndUpdate(req.session.userId,{$pull:{"files":{"hash":req.session.delHash}}},function(err, done){
        if (err) throw err;
        del = true
        res.send(JSON.stringify({ delete: del }));
    })
});

module.exports = router;