pragma solidity ^0.4.17;

contract HoldNDA
{
    address public issuer; 
    string hashedNDA;
    uint counter = 0;

    modifier onlyIssuer()
    {
        require(msg.sender == issuer);_;
    }
    
    function HoldNDA(string myHash) public
    {
        issuer = msg.sender;
        hashedNDA = myHash;
    }
    
    function changeNDA(string myHash) public onlyIssuer{
        hashedNDA = myHash;
    }
    
    function callHash() public view returns (string)
    {
        return hashedNDA;
    }
    
}
