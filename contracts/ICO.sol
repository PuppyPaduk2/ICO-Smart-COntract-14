pragma solidity ^0.8.17;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "hardhat/console.sol";
// import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract ICO is ERC20, ReentrancyGuard {

    // using SafeMath for uint256;
    address public owner;
    uint public totalToken = 5000 ether;
    uint public startTime;
    uint public endTime;
    uint public softCap = 0.1 ether;
    uint public hardCap = 0.8 ether;
    uint public minPurchase = 0.01 ether;
    uint public maxPurchase = 0.05 ether;
    uint public icorate = 1000;
    bool public withDraw;
    bool public isClosed;
    uint public totalDeposit;
    mapping(address => uint) public deposits;
    event Deposit(address indexed investor, uint amount);
    event Withdraw(address indexed investor, uint amount);
    event Claim(address indexed investor, uint amount);

    constructor(uint _startTime, uint _endTime) ERC20("ICO", "ICO") {
        owner = msg.sender;
        startTime = _startTime;
        endTime = _endTime;
        // softCap = _softCap;
        // hardCap = _hardCap;
        // minPurchase = _minPurchase;
        // maxPurchase = _maxPurchase;
        isClosed = false;
        withDraw = false;
        _mint(owner, totalToken);
    }

    modifier onlyOwner() {
        require(
            msg.sender == owner,
            "Only contract owner can call this function."
        );
        _;
    }

    modifier onlyDuringICO() {
        // console.log(block.timestamp, startTime, endTime);
        require(block.timestamp >= startTime, "ICO has not yet started.");
        require(block.timestamp <= endTime, "ICO has ended.");
        require(!isClosed, "ICO is closed.");
        _;
    }

    function getTotalDeposit() public view returns (uint) {
        return totalDeposit;
    }

    function deposit() public payable nonReentrant onlyDuringICO {
        
        require(
            msg.sender.balance >= msg.value,
            "Deposit amount is below your balance."
        );
        require(
            msg.value >= minPurchase,
            "Deposit amount is below minimum."
        );
        require(
            msg.value <= maxPurchase,
            "Deposit amount is above maximum."
        );
        require(
            hardCap - totalDeposit >= msg.value,
            "Deposit amount exceeds hard cap."
        );
        totalDeposit += msg.value;
        deposits[msg.sender] += msg.value;
        emit Deposit(msg.sender, msg.value);
    }

    function withdraw() public {
        require(
            isClosed || (block.timestamp > endTime && deposits[msg.sender] > 0),
            "Withdrawals not allowed at this time."
        );
        require(withDraw, "Cannot withdraw because of ICO success.");
        uint amount = deposits[msg.sender];
        deposits[msg.sender] = 0;
        if (amount > 0) {
            payable(msg.sender).transfer(amount);
            emit Withdraw(msg.sender, amount);
        }
    }

    function claim() public {
        require(block.timestamp > endTime, "Claims not allowed at this time.");
        uint amount = deposits[msg.sender] * icorate;
        deposits[msg.sender] = 0;
        if (amount > 0) {
            _transfer(owner, msg.sender, amount);
            emit Claim(msg.sender, amount);
        }
    }

    function close() public onlyOwner {
        require(block.timestamp > endTime, "ICO has not yet ended.");
        isClosed = true;
        if (address(this).balance < softCap) {
            withDraw = true;
        } else {
            // ICO successful, transfer funds to owner
            payable(owner).transfer(address(this).balance);
        }
    }
}
