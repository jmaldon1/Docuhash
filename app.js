var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var session = require('express-session');
var multer = require('multer');
var path = require('path');
var fs = require('fs');
PDFParser = require("pdf2json");
var SHA3 = require('sha3');
var Web3 = require('web3');
var solc = require('solc');
var app = express();

//web3 provider
web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

//pdfParser

// if (typeof web3 !== 'undefined') {
//   web3 = new Web3(web3.currentProvider);
// } else {
//   // set the provider you want from Web3.providers
//   web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
// }

var accounts;
//Comment this out when TestRPC isn't running
//web3.eth.getAccounts().then((acc) => accounts = acc);
var contractCom = solc.compile(fs.readFileSync('contracts/holdNDA.sol').toString());
var contractAddress = "0x114a97143240c414f9117393e3f8c4c33860b4f6";
var contractABI = JSON.parse(contractCom.contracts[':HoldNDA'].interface);
var holdNDA = new web3.eth.Contract(contractABI);

var contractByteCode = contractCom.contracts[':HoldNDA'].bytecode;
var contractInstance;

// holdNDAtx = holdNDA.deploy({
//     data: contractByteCode,
//     arguments: ['hey']
// });
// holdNDAtx.send({
//   from: '0x79a44c4191f0e810172b9d3123f2d377582157be',
//   gas: 1500000
// }).then((instance) => {contractInstance = instance;
// contractInstance.methods.callHash().call().then(console.log);
// });

//contractInstance.methods.callHash().call().then((results) => console.log(web3.utils.hexToAscii(results)));

// Set Storage Engine
var storage = multer.diskStorage({
    destination: './public/uploads/',
    filename: function(req, file, cb) {
        cb(null, file.fieldname + "-" + Date.now() +
            path.extname(file.originalname));
    }
})
//Multer
var upload = multer({
    storage: storage,
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
}


//use session for tracking logins
app.use(session({
    secret: 'treehouse loves you', //Signs the session ID cookie...required and can be any string of text
    resave: true, //forces the session to be saved in the session store
    saveUninitialized: false //forces an uninitialized session to be saved in the session store
}));

//mongodb connection
mongoose.connect("mongodb://localhost:27017/nda")
var db = mongoose.connection;
//mongo error
db.on('error', console.error.bind(console, 'connection error:'));

// parse incoming requests
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// serve static files from /public
app.use(express.static(__dirname + '/public'));

app.post('/upload', (req, res) => {
    upload(req, res, (err) => {
        if (err) {
            res.render('contact', {
                msg: err
            });
        } else {
            console.log(req.file);
            if (req.file == undefined) {
                res.render('contact', {
                    msg: 'Error: No File Selected!'
                });
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
                            var txtName = req.file.fieldname + "-" + Date.now() + ".txt";
                            fs.writeFile("public/uploads/" + txtName, pdfParser.getRawTextContent(), function(error) {
                                if (error) throw error;
                                fs.readFile('public/uploads/' + txtName, 'utf8', function(error, data) {
                                    if (error) throw error;
                                    console.log(data);
                                    d.update(data);
                                    var shawed = d.digest('hex');
                                    console.log(shawed);

                                    //Passes sha3 hash to the smart contract and deploys to blockchain
                                    // holdNDAtx = holdNDA.deploy({
                                    //     data: contractByteCode,
                                    //     arguments: [shawed]
                                    // });
                                    // holdNDAtx.send({
                                    //     from: accounts[0],
                                    //     gas: 1500000
                                    // }).then((instance) => {
                                    //     contractInstance = instance;
                                    //     contractInstance.methods.callHash().call().then(console.log);
                                    // });
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
                res.render('contact', {
                    msg: 'File Uploaded!',
                    file: `uploads/${req.file.filename}`
                });
            }
        }
    });
});

// view engine setup
app.engine('html', require('ejs').renderFile)
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

// include routes
var routes = require('./routes/index');
app.use('/', routes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('File Not Found');
    err.status = 404;
    next(err);
});

// error handler
// define as the last app.use callback
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

// listen on port 3000
app.listen(3000, function() {
    console.log('Express app listening on port 3000');
});