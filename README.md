# Docuhash.io

# Document Hashing website using Ethereum Blockchain

# Purpose:
DocuHash is used to prove that a document has not been altered. This is done by using all the data in a document to create a string of characters called a Hash. This hash will be associated with a document and if the document is ever changed, even in the slightest, the hash will change and there is now evidence the document has been altered. 

# Why I decided to use the Ethereum Blockchain?
The ethereum blockchain allows for the creation of Smart Contract, which are just code instructions that can be deployed onto the blockchain. These smart contracts, once deployed onto the blockchain, cannot be deleted or altered, unless specified in the code. So I created a smart contract with the sole purpose of storing the hash of a document. This smart contract will stay on the blockchain forever, allowing anyone to compare their document with the hash that is stored on the blockchain. 

# How it works
DocuHash allow a user to upload a document, hash it using a Sha3 algorithm, store that hash in a smart contract, and deploy that smart contract on the blockchain. This will allow anyone to view the Hash but prevent anyone from changing the hash. Seperate smart contracts are deployed for each document hash that is stored on the blockchain. 

# This project includes:

-NodeJS Server running Express

-Uses the Handlebars templating engine

-User Login/Authentication system

-MongoDB database that stores all hash & user information

-PDF parser that converts PDF documents to TXT document to allow for document Hashing

-Connectivity to the Ethereum blockchain through the Web3 API

-JQuery to provide feedback to the user when using things such as registration form and sending get/post requests to the server

-MetaMask integrations that allows the user to easily interact with Ethereum Blockchain through their browser

-Digital Ocean is being used at the hosting service
