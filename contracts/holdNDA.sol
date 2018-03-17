pragma solidity ^0.4.21;

contract HoldNDA
{
    address public issuer; 
    string hashedNDA;
    address public owner = 0x860384d39e6EF17b2442dCCa0d5B1dA658a30B9C;
    address public contractAddress = this;
    uint256 withdraw;


    modifier onlyIssuer()
    {
        require(msg.sender == issuer);_;
    }
    
    //Constructor -- can only be called once
    //user can send funds to help keep servers up and running
    function HoldNDA(string myHash) payable public
    {
        issuer = msg.sender;
        hashedNDA = myHash;
        withdraw = contractAddress.balance;
        owner.transfer(withdraw);
        
    }
    
    //function that holds the hashed document
    function callHash() public view returns (string)
    {
        return hashedNDA;
    }
}
