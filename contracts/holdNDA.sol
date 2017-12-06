pragma solidity ^0.4.17;

contract HoldNDA
{
    address public issuer; 
    string hashedNDA;

    modifier onlyIssuer()
    {
        require(msg.sender == issuer);_;
    }
    
    function HoldNDA(string myHash) public
    {
        issuer = msg.sender;
        hashedNDA = myHash;
    }
    
    function callHash() public view returns (string)
    {
        return hashedNDA;
    }
    
}
