// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

contract GSTInvoice {

 struct Invoice {
    string id;
    string seller;
    string buyer;
    string product;
    uint amount;
    uint gst;
    string date;
    bytes32 hash;
    uint timestamp;
    address owner;
}

    mapping(string => Invoice) private invoices;

    // 🔹 Events for real-time history
    event InvoiceStored(
        string id,
        address indexed owner,
        string seller,
        string buyer,
        uint256 amount,
        uint256 timestamp
    );

    // 🔹 Store Invoice (only once per ID)
    function storeInvoice(
    string memory _id,
    string memory _seller,
    string memory _buyer,
    string memory _product,
    uint _amount,
    uint _gst,
    string memory _date,
    string memory _hash
) public {

    require(invoices[_id].owner == address(0), "Invoice already exists");

    invoices[_id] = Invoice({
        id: _id,
        seller: _seller,
        buyer: _buyer,
        product: _product,
        amount: _amount,
        gst: _gst,
        date: _date,
        hash: keccak256(abi.encode(_hash)),
        timestamp: block.timestamp,
        owner: msg.sender
    });

    emit InvoiceStored(_id, msg.sender, _seller, _buyer, _amount, block.timestamp);
}

    // 🔹 Verify Invoice (only owner can verify)
   function verifyInvoice(
string memory _id,
 string memory _seller,
string memory _buyer,
string memory _product,
uint _amount,
uint _gst,
string memory _date,
string memory _hash
) public view returns (bool) {

    Invoice memory inv = invoices[_id];

    require(inv.owner != address(0), "Invoice does not exist");

    return inv.hash == keccak256(abi.encode(_hash));
}
    // 🔹 Get Invoice Details (only owner)
    function getInvoice(string memory _id)
public view returns (
    string memory,
    string memory,
    string memory,
    string memory,
    uint,
    uint,
    string memory,
    bytes32,
    uint,
    address
) {
    Invoice memory inv = invoices[_id];

    require(inv.owner != address(0), "Invoice does not exist");

    return (
        inv.id,
        inv.seller,
        inv.buyer,
        inv.product,
        inv.amount,
        inv.gst,
        inv.date,
        inv.hash,
        inv.timestamp,
        inv.owner
    );
}
}