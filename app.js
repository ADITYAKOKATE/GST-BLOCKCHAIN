let provider;
let signer;
let contract;

const contractAddress = "0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6";

const abi = [
  {
    "anonymous": false,
    "inputs": [
      { "indexed": false, "internalType": "string", "name": "id", "type": "string" },
      { "indexed": true, "internalType": "address", "name": "owner", "type": "address" },
      { "indexed": false, "internalType": "string", "name": "seller", "type": "string" },
      { "indexed": false, "internalType": "string", "name": "buyer", "type": "string" },
      { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" },
      { "indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256" }
    ],
    "name": "InvoiceStored",
    "type": "event"
  },
  {
    "inputs": [{ "internalType": "string", "name": "_id", "type": "string" }],
    "name": "getInvoice",
    "outputs": [
      { "internalType": "string", "name": "", "type": "string" },
      { "internalType": "string", "name": "", "type": "string" },
      { "internalType": "string", "name": "", "type": "string" },
      { "internalType": "string", "name": "", "type": "string" },
      { "internalType": "uint256", "name": "", "type": "uint256" },
      { "internalType": "uint256", "name": "", "type": "uint256" },
      { "internalType": "string", "name": "", "type": "string" },
      { "internalType": "bytes32", "name": "", "type": "bytes32" },
      { "internalType": "uint256", "name": "", "type": "uint256" },
      { "internalType": "address", "name": "", "type": "address" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "string", "name": "_id", "type": "string" },
      { "internalType": "string", "name": "_seller", "type": "string" },
      { "internalType": "string", "name": "_buyer", "type": "string" },
      { "internalType": "string", "name": "_product", "type": "string" },
      { "internalType": "uint256", "name": "_amount", "type": "uint256" },
      { "internalType": "uint256", "name": "_gst", "type": "uint256" },
      { "internalType": "string", "name": "_date", "type": "string" },
      { "internalType": "string", "name": "_hash", "type": "string" }
    ],
    "name": "storeInvoice",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "string", "name": "_id", "type": "string" },
      { "internalType": "string", "name": "_seller", "type": "string" },
      { "internalType": "string", "name": "_buyer", "type": "string" },
      { "internalType": "string", "name": "_product", "type": "string" },
      { "internalType": "uint256", "name": "_amount", "type": "uint256" },
      { "internalType": "uint256", "name": "_gst", "type": "uint256" },
      { "internalType": "string", "name": "_date", "type": "string" },
      { "internalType": "string", "name": "_hash", "type": "string" }
    ],
    "name": "verifyInvoice",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  }
];

function showNotification(message, type = 'success') {
    const el = document.getElementById("notification");
    el.innerText = message;
    el.style.display = "block";
    el.style.borderBottom = `4px solid ${type === 'success' ? '#10b981' : '#ef4444'}`;
    setTimeout(() => { el.style.display = "none"; }, 4000);
}

function updatePreview() {
    const id = document.getElementById("invoiceId").value || "INV-0000";
    const seller = document.getElementById("seller").value || "-";
    const buyer = document.getElementById("buyer").value || "-";
    const product = document.getElementById("product").value || "-";
    const amount = parseFloat(document.getElementById("amount").value) || 0;
    const gstRate = parseFloat(document.getElementById("gst").value) || 18;
    const date = document.getElementById("date").value || "-";

    const gstAmount = (amount * gstRate) / 100;
    const total = amount + gstAmount;

    document.getElementById("previewId").innerText = `#${id}`;
    document.getElementById("previewSeller").innerText = seller;
    document.getElementById("previewBuyer").innerText = buyer;
    document.getElementById("previewProduct").innerText = product;
    document.getElementById("previewDate").innerText = date;
    document.getElementById("previewBase").innerText = `$${amount.toLocaleString()}`;
    document.getElementById("previewGst").innerText = `$${gstAmount.toLocaleString()}`;
    document.getElementById("previewTotal").innerText = `$${total.toLocaleString()}`;

    if (amount > 0) {
        let hashData = `${id}|${seller}|${buyer}|${product}|${amount}|${gstRate}|${date}`;
        document.getElementById("previewHash").innerText = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(hashData));
    } else {
        document.getElementById("previewHash").innerText = "PENDING COMMIT...";
    }
}

async function loadHistory() {
    if (!contract) return;
    const filter = contract.filters.InvoiceStored();
    const logs = await contract.queryFilter(filter, 0, 'latest');
    const tbody = document.getElementById("historyBody");
    tbody.innerHTML = "";

    logs.reverse().forEach(log => {
        // Safe access to log args
        const invoiceId = log.args.id || "N/A";
        const seller = log.args.seller || "N/A";
        const buyer = log.args.buyer || "N/A";
        const amount = log.args.amount ? log.args.amount.toString() : "0";

        const row = tbody.insertRow();
        row.innerHTML = `
            <td>${invoiceId}</td>
            <td>${seller}</td>
            <td>${buyer}</td>
            <td>$${parseFloat(amount).toLocaleString()}</td>
            <td><span class="badge badge-success">On-Chain</span></td>
            <td><button class="btn-primary btn-small" onclick="generateInvoicePDF('${invoiceId}')">PDF</button></td>
        `;
    });
}

async function connectWallet() {
    try {
        if (!window.ethereum) {
            showNotification("MetaMask not detected!", "error");
            return;
        }
        provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        signer = provider.getSigner();
        const address = await signer.getAddress();
        contract = new ethers.Contract(contractAddress, abi, signer);

        document.getElementById("walletAddress").innerText = address.substring(0,6) + "..." + address.substring(38);
        document.getElementById("statusIndicator").classList.add("connected");
        document.getElementById("connectBtn").innerText = "Connected";
        document.getElementById("connectBtn").disabled = true;

        showNotification("Blockchain connected!");
        loadHistory();

        contract.on("InvoiceStored", () => {
            loadHistory();
        });

    } catch (err) {
        showNotification("Connection failed: " + err.message, "error");
    }
}

async function storeInvoice() {
    const btn = document.getElementById("storeBtn");
    try {
        if (!contract) { showNotification("Connect wallet first!", "error"); return; }
        const id = document.getElementById("invoiceId").value;
        const seller = document.getElementById("seller").value;
        const buyer = document.getElementById("buyer").value;
        const product = document.getElementById("product").value;
        const amount = document.getElementById("amount").value;
        const gst = document.getElementById("gst").value;
        const date = document.getElementById("date").value;

        if (!id || !seller || !buyer) { showNotification("Fill required fields", "error"); return; }

        btn.innerText = "Broadcasting...";
        btn.disabled = true;

        let hashData = `${id}|${seller}|${buyer}|${product}|${amount}|${gst}|${date}`;
        let hash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(hashData));

        let tx = await contract.storeInvoice(id, seller, buyer, product, amount, gst, date, hash);
        showNotification("Transaction pending...");
        await tx.wait();

        btn.innerText = "Submit to Blockchain";
        btn.disabled = false;
        showNotification("Invoice stored!");
    } catch (err) {
        btn.innerText = "Submit to Blockchain"; btn.disabled = false;
        showNotification("Blockchain error: " + err.message, "error");
    }
}

async function verifyInvoice() {
    const resContainer = document.getElementById("resultContainer");
    const resText = document.getElementById("resultText");
    const resIcon = document.getElementById("resultIcon");
    try {
        if (!contract) { showNotification("Connect wallet!", "error"); return; }
        const id = document.getElementById("verifyId").value;
        const seller = document.getElementById("verifySeller").value;
        const buyer = document.getElementById("verifyBuyer").value;
        const product = document.getElementById("verifyProduct").value;
        const amount = document.getElementById("verifyAmount").value;
        const gst = document.getElementById("verifyGst").value;
        const date = document.getElementById("verifyDate").value;

        let hashData = `${id}|${seller}|${buyer}|${product}|${amount}|${gst}|${date}`;
        let hash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(hashData));

        resContainer.style.display = "block";
        resText.innerText = "Querying Ledger...";

        const isValid = await contract.verifyInvoice(id, seller, buyer, product, amount, gst, date, hash);

        if (isValid) {
            resContainer.style.background = "#d1fae5"; resContainer.style.color = "#065f46";
            resText.innerText = "Success: Validated On-Chain"; resIcon.innerText = "🛡️";
        } else {
            resContainer.style.background = "#fee2e2"; resContainer.style.color = "#991b1b";
            resText.innerText = "Error: Invalid Data"; resIcon.innerText = "⚠️";
        }
    } catch (err) {
        showNotification("Verification failed", "error");
    }
}

async function generateInvoicePDF(id) {
    try {
        showNotification("Generating Premium Invoice...", "success");
        const safeId = String(id);
        const details = await contract.getInvoice(safeId);
        
        const sellerName = details[1];
        const buyerName = details[2];
        const productName = details[3];
        const baseAmount = details[4].toString();
        const gstValue = details[5].toString();
        const invoiceDate = details[6];
        const blockchainHash = details[7];

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // 🎨 Design Elements
        // Top Indigo Bar
        doc.setFillColor(79, 70, 229);
        doc.rect(0, 0, 210, 40, 'F');

        // Brand Title
        doc.setFontSize(28);
        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "bold");
        doc.text("GST CHAIN", 20, 25);
        
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text("DECENTRALIZED TAX REGISTRY", 20, 32);

        // Invoice Meta (on top bar)
        doc.setFontSize(10);
        doc.text(`INVOICE NO: ${safeId}`, 140, 20);
        doc.text(`DATE: ${invoiceDate}`, 140, 26);
        doc.text(`STATUS: VERIFIED`, 140, 32);

        // 📍 Addresses
        doc.setTextColor(30, 41, 59); // Slate 800
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text("BILL FROM", 20, 55);
        doc.text("BILL TO", 120, 55);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(12);
        doc.text(sellerName, 20, 62);
        doc.text(buyerName, 120, 62);

        // 📊 Table Header
        doc.setFillColor(248, 250, 252); // Slate 50
        doc.rect(20, 75, 170, 10, 'F');
        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(100, 116, 139); // Slate 500
        doc.text("DESCRIPTION", 25, 81.5);
        doc.text("BASE AMOUNT", 100, 81.5);
        doc.text("GST RATE", 140, 81.5);
        doc.text("TOTAL", 170, 81.5);

        // 📊 Table Content
        doc.setTextColor(30, 41, 59);
        doc.setFontSize(11);
        doc.setFont("helvetica", "normal");
        doc.text(productName, 25, 92);
        doc.text(`$${parseFloat(baseAmount).toLocaleString()}`, 100, 92);
        doc.text(`${gstValue}%`, 140, 92);
        
        const tax = (parseFloat(baseAmount) * parseFloat(gstValue)) / 100;
        const grandTotal = parseFloat(baseAmount) + tax;
        doc.setFont("helvetica", "bold");
        doc.text(`$${grandTotal.toLocaleString()}`, 170, 92);

        doc.setDrawColor(241, 245, 249);
        doc.line(20, 98, 190, 98);

        // 💰 Summary Section
        const summaryStart = 110;
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(100, 116, 139);
        doc.text("Subtotal:", 130, summaryStart);
        doc.text("Total GST:", 130, summaryStart + 7);
        
        doc.setTextColor(30, 41, 59);
        doc.text(`$${parseFloat(baseAmount).toLocaleString()}`, 170, summaryStart);
        doc.text(`$${tax.toLocaleString()}`, 170, summaryStart + 7);

        doc.setDrawColor(79, 70, 229);
        doc.setLineWidth(0.5);
        doc.line(130, summaryStart + 11, 190, summaryStart + 11);
        
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("Grand Total:", 130, summaryStart + 20);
        doc.text(`$${grandTotal.toLocaleString()}`, 170, summaryStart + 20);

        // 🛡️ Blockchain Seal
        doc.setFillColor(241, 245, 249);
        doc.rect(20, 150, 170, 30, 'F');
        doc.setFontSize(9);
        doc.setTextColor(79, 70, 229);
        doc.text("BLOCKCHAIN VERIFICATION SEAL", 25, 158);
        
        doc.setFontSize(7);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(100, 116, 139);
        doc.text("This invoice is a permanent immutable record on the GST Blockchain Ledger.", 25, 164);
        doc.setFont("courier", "normal");
        doc.text(`HASH: ${blockchainHash}`, 25, 172);

        // 🏁 Footer
        doc.setFont("helvetica", "italic");
        doc.setFontSize(8);
        doc.text("Thank you for using GST Chain. This is a computer-generated document.", 105, 280, { align: "center" });

        doc.save(`Invoice_${safeId}.pdf`);
        showNotification("Premium PDF Downloaded");

    } catch (err) {
        console.error("PDF-Error:", err);
        showNotification("Failed to generate PDF", "error");
    }
}
