pragma solidity  >=0.4.22 <0.9.0;
pragma experimental ABIEncoderV2;

contract E_commerce {
    address public owner;

    /*  Keep track of businessId in order to facilitate entry 
        of a new businessId without clash
        Akin to primary key auto increment
    */
    uint256 businessIdCounter;

    
    mapping (uint256 => Business) public businesses;
    struct Business {
        address businessAddress;
        string name;
        string description;
        bool isValid;
        uint counter;
        uint256 balance;
        uint shareholderCount;
        address[] shareholders;
        mapping (uint => bytes32) counterToByte;
    }

    // Map shareholders to businesses
    mapping (address => UserInfo) shareHoldersToBusinesses;

    // Maps adddress to every business associated with it
    mapping (address => UserInfo) public userAddressToBusinesses;
    struct UserInfo {
        uint businessCount;
        uint256[] userBusinesses;
    }


    /// businessId maps to Purchase
    mapping(uint => mapping(bytes32 => Purchase)) purchases;
    struct Purchase {
        address buyer;
        uint256 amount;
        uint256 date;
        bool isRecorded;
    }


    // Constructor
    constructor() {
        // the account that deploys the contract is the owner of the contract
        owner = msg.sender;
        // initialize businessId counter to 0
        businessIdCounter = 0;
    }

    function getBusinessIdCounter2 () public view returns (uint){
        return businessIdCounter;
    }

    // Map shareholder to merchant's business
    function mapShareHolderToMyBusiness(uint256 _businessId, address _shareholder) public
            businessExists(_businessId) isOwner(_businessId){
        uint shareholderBusinessesCount = shareHoldersToBusinesses[_shareholder].businessCount;
        shareHoldersToBusinesses[_shareholder].userBusinesses.push(_businessId);
        shareHoldersToBusinesses[_shareholder].businessCount = shareHoldersToBusinesses[_shareholder].businessCount + 1; 
        businesses[_businessId].shareholders.push(_shareholder);
        businesses[_businessId].shareholderCount = businesses[_businessId].shareholderCount + 1;
    }

    function getShareholderBusinesses() public view returns (string [4][] memory){
        uint shareholderBusinessCount = shareHoldersToBusinesses[msg.sender].businessCount;
        uint256 [] memory shareholderBusinessesIds = new uint256[](shareholderBusinessCount);
        for (uint i = 0; i < shareholderBusinessCount; i++){
            shareholderBusinessesIds[i] = shareHoldersToBusinesses[msg.sender].userBusinesses[i];
        }

        string [4][] memory myBusinessesInfo = new string[4][](shareholderBusinessCount);
        
        for (uint256 i = 0; i < shareholderBusinessCount; i++){
            uint256 bId = shareholderBusinessesIds[i];
            string memory bName = businesses[bId].name;
            string memory bDescription = businesses[bId].description;
            string memory bAddress =  toAsciiString(businesses[bId].businessAddress);
            myBusinessesInfo[i] = [bName, bDescription, bAddress, uint2str(bId)];
        }
        return myBusinessesInfo;
    }

    function getUserBusinesses() public view returns (string [4][] memory){
        
        uint userBusinessCount = userAddressToBusinesses[msg.sender].businessCount;
        uint256 [] memory userBusinessesIds = new uint256[](userBusinessCount);
        for (uint i = 0; i < userBusinessCount; i++){
            userBusinessesIds[i] = userAddressToBusinesses[msg.sender].userBusinesses[i];
        }

        string [4][] memory myBusinessesInfo = new string[4][](userBusinessCount);
        
        for (uint256 i = 0; i < userBusinessCount; i++){
            uint256 bId = userBusinessesIds[i];
            string memory bName = businesses[bId].name;
            string memory bDescription = businesses[bId].description;
            string memory bAddress =  toAsciiString(businesses[bId].businessAddress);

            myBusinessesInfo[i] = [bName, bDescription, bAddress, uint2str(bId)];
        }
        return myBusinessesInfo;

        
    }
    modifier userExists(){
        if (userAddressToBusinesses[msg.sender].businessCount > 0){
            _;
        }
    }


    function mapUserAddressToCreatedBusiness(uint256 _businessId, address _sender) public {
        uint userBusinessesCount = userAddressToBusinesses[_sender].businessCount;
        userAddressToBusinesses[_sender].userBusinesses.push(_businessId);
        userAddressToBusinesses[_sender].businessCount = userAddressToBusinesses[_sender].businessCount + 1;
    }

    // Register a new business
    function registerBusiness(string memory _name, string memory _description) public 
        returns (uint256) {
            businessIdCounter = businessIdCounter + 1;
            Business storage newBusiness = businesses[businessIdCounter];
            newBusiness.businessAddress = msg.sender;
            newBusiness.name = _name;
            newBusiness.description = _description;
            newBusiness.isValid = true;
            newBusiness.counter = 0;
            newBusiness.balance = 0;
            newBusiness.shareholderCount = 0;

            mapUserAddressToCreatedBusiness(businessIdCounter, msg.sender);

            return businessIdCounter;
    }

    // Get all businesses
    function getAllBusinesses() public view returns (string [3][] memory){
        string [3][] memory businessesInfo = new string[3][](businessIdCounter);
        
        for (uint256 i = 1; i <= businessIdCounter; i++){
            string memory bName = businesses[i].name;
            string memory bDescription = businesses[i].description;
            string memory bAddress =  toAsciiString(businesses[i].businessAddress);
            businessesInfo[i-1] = [bName, bDescription, bAddress];
        }
        return businessesInfo;
    }

    

    function toAsciiString(address x) public pure returns (string memory) {
        bytes memory s = new bytes(40);
        for (uint i = 0; i < 20; i++) {
            bytes1 b = bytes1(uint8(uint(uint160(x)) / (2**(8*(19 - i)))));
            bytes1 hi = bytes1(uint8(b) / 16);
            bytes1 lo = bytes1(uint8(b) - 16 * uint8(hi));
            s[2*i] = char(hi);
            s[2*i+1] = char(lo);            
        }
        return string(abi.encodePacked("0x",s));
    }
    function char(bytes1 b) public pure returns (bytes1 c) {
        if (uint8(b) < 10) return bytes1(uint8(b) + 0x30);
        else return bytes1(uint8(b) + 0x57);
    }

    // Function to accept payment
    function makePayment(uint256 _businessId, bytes32 _purchaseId, uint256 _date) 
            external businessExists(_businessId) payable{
        // Verify that no entry with similar purchaseId exists for that business
        require(!purchases[_businessId][_purchaseId].isRecorded);
        
        // Insert mapping for counter to bytes32
        businesses[_businessId].counterToByte[businesses[_businessId].counter] = _purchaseId;
        // increase counter
        businesses[_businessId].counter = businesses[_businessId].counter + 1;

        // insert purchase entry
        purchases[_businessId][_purchaseId] = Purchase(msg.sender, msg.value, _date, true);
        // increase balance of account
        businesses[_businessId].balance = businesses[_businessId].balance + msg.value;

    }

    // Get balance of account
    function getBalance() public view returns (uint) {
        return address(this).balance;
    }

    function getBusinessBalance(uint256 _businessId) public view
            businessExists(_businessId) isOwnerOrShareholder(_businessId) returns (uint256){
        return businesses[_businessId].balance;
    }
    function getBusinessName(uint256 _businessId) public view
            businessExists(_businessId) returns (string memory){
        return businesses[_businessId].name;
    }
    function getBusinessShareholders(uint256 _businessId) public view 
            businessExists(_businessId) returns (string[] memory){
        
        uint256 shareholdersCount = businesses[_businessId].shareholderCount;
        string[] memory shareholdersArr = new string[](shareholdersCount);
        for (uint256 i = 0; i < shareholdersCount; i++){
            shareholdersArr[i] = toAsciiString(businesses[_businessId].shareholders[i]);
        }
        return shareholdersArr;
    }            

    // Send ether from business account
    function sendViaCall(uint256 _businessId, uint256 _amount) public 
            businessExists(_businessId) isOwner(_businessId) returns (bool){
        (bool sent, bytes memory data) = payable(msg.sender).call{value: _amount}("");
        if (sent){
            businesses[_businessId].balance = businesses[_businessId].balance - _amount;
        }
        return sent;
    }


    // Getter for specific purchase record since purchases is not public
    function getPurchaseEntry(uint256 _businessId, bytes32 _purchaseId) 
             public view businessExists(_businessId) isOwner(_businessId) returns (address, uint256, bool){
        //require(purchases[_businessId][_purchaseId].isRecorded);
        //emit readingPurchaseEntry(_businessId, _purchaseId);
        return (purchases[_businessId][_purchaseId].buyer, purchases[_businessId][_purchaseId].amount, purchases[_businessId][_purchaseId].isRecorded);
    }

    // modifier to ensure that business exists
    modifier businessExists(uint256 _businessId){
        if (businesses[_businessId].isValid){
            _;
        }
    }

    modifier isOwnerOrShareholder(uint256 _businessId){
        if (msg.sender == businesses[_businessId].businessAddress){
            // Match found, user is owner
            _;
        }
        if (shareHoldersToBusinesses[msg.sender].businessCount > 0){
            uint256 businessCount = shareHoldersToBusinesses[msg.sender].businessCount;
            for (uint256 i =0; i < businessCount; i++){
                if (shareHoldersToBusinesses[msg.sender].userBusinesses[i] == _businessId){
                    // Match found, user is shareholder
                    _;
                }
            }
        }
    }
    // event for entering getter purchaseentry getter
    event readingPurchaseEntry(uint256 _businessId, bytes32 _purchaseId);
    
    // Check payment data
    function checkPayments(uint256 _businessId)
             public view businessExists(_businessId) isOwnerOrShareholder(_businessId) 
             returns (uint256[2][] memory) {
        // If here,, the person is the owner of the account
        uint count = businesses[_businessId].counter;
        uint256 [2][] memory purchaseInfo = new uint256[2][](count);
        for (uint i = 0; i < count; i++){
            bytes32 currentKey = businesses[_businessId].counterToByte[i];
            Purchase memory currentPurchase = purchases[_businessId][currentKey];
            purchaseInfo[i] = [currentPurchase.date, currentPurchase.amount];
        }
        
        return purchaseInfo;
    }
    modifier isOwner(uint256 _businessId) {
        if (msg.sender == businesses[_businessId].businessAddress){
            _;
        }
    }

    function uint2str(uint _i) internal pure returns (string memory _uintAsString) {
        if (_i == 0) {
            return "0";
        }
        uint j = _i;
        uint len;
        while (j != 0) {
            len++;
            j /= 10;
        }
        bytes memory bstr = new bytes(len);
        uint k = len;
        while (_i != 0) {
            k = k-1;
            uint8 temp = (48 + uint8(_i - _i / 10 * 10));
            bytes1 b1 = bytes1(temp);
            bstr[k] = b1;
            _i /= 10;
        }
        return string(bstr);
    }
    


}