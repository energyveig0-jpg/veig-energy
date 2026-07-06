// Get form elements
const solarForm = document.getElementById('solarForm');
const totalCostInput = document.getElementById('totalCost');
const gstAmountInput = document.getElementById('gstAmount');
const finalCostInput = document.getElementById('finalCost');
const dateInput = document.getElementById('date');
const validityInput = document.getElementById('validity');
const capacityInput = document.getElementById('capacity');
const costExclGSTInput = document.getElementById('costExclGST');
const unitButtons = document.querySelectorAll('.unit-btn');

const GST_RATE = 0.089; // 8.9%
const WHATSAPP_NUMBER = '918989522575'; // Your WhatsApp number

// Set today's date as default
function setDefaultDate() {
    const today = new Date().toISOString().split('T')[0];
    dateInput.value = today;
    updateValidity();
}

// Update validity date (quote date + 7 days)
function updateValidity() {
    if (dateInput.value) {
        const quoteDate = new Date(dateInput.value);
        const validityDate = new Date(quoteDate.getTime() + 7 * 24 * 60 * 60 * 1000);
        validityInput.value = validityDate.toISOString().split('T')[0];
    }
}

// Calculate GST and final cost
function calculateCost() {
    const totalCost = parseFloat(totalCostInput.value) || 0;
    
    if (totalCost > 0) {
        // Calculate cost excluding GST
        const costExclGST = totalCost / (1 + GST_RATE);
        const gstAmount = totalCost - costExclGST;
        
        costExclGSTInput.textContent = '₹ ' + formatCurrency(costExclGST);
        gstAmountInput.value = gstAmount.toFixed(2);
        
        // Calculate final cost after subsidy
        const subsidy = parseFloat(document.getElementById('subsidy').value) || 0;
        const finalCost = totalCost - subsidy;
        
        finalCostInput.textContent = (finalCost >= 0 ? '₹ ' : '₹ -') + formatCurrency(Math.abs(finalCost));
        if (finalCost < 0) {
            finalCostInput.style.color = '#ffa500';
        } else {
            finalCostInput.style.color = '#ffa500';
        }
    } else {
        costExclGSTInput.textContent = '—';
        gstAmountInput.value = '';
        finalCostInput.textContent = '₹ -78,000.00';
    }
}

// Format currency
function formatCurrency(value) {
    return value.toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

// Unit button toggle
unitButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        unitButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    });
});

// Event listeners
dateInput.addEventListener('change', updateValidity);
totalCostInput.addEventListener('input', calculateCost);
document.getElementById('subsidy').addEventListener('input', calculateCost);

// Form submission with PDF generation
solarForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Validate required fields
    const customerName = document.getElementById('customerName').value;
    const mobileNumber = document.getElementById('mobileNumber').value;
    const address = document.getElementById('address').value;
    const capacity = document.getElementById('capacity').value;
    const totalCost = document.getElementById('totalCost').value;
    
    if (!customerName || !mobileNumber || !address || !capacity || !totalCost) {
        alert('Please fill all required fields');
        return;
    }
    
    generatePDFAndSendToWhatsApp();
});

// Generate PDF and send to WhatsApp
async function generatePDFAndSendToWhatsApp() {
    try {
        // Get all form data
        const formData = {
            systemType: document.querySelector('input[name="systemType"]:checked').value,
            customerName: document.getElementById('customerName').value,
            mobileNumber: document.getElementById('mobileNumber').value,
            address: document.getElementById('address').value,
            capacity: document.getElementById('capacity').value,
            unit: document.querySelector('.unit-btn.active').textContent,
            date: document.getElementById('date').value,
            validity: document.getElementById('validity').value,
            solarPanel: document.querySelectorAll('.spec-item input')[0]?.value || '',
            solarInverter: document.querySelectorAll('.spec-item input')[1]?.value || '',
            electricalItem: document.querySelectorAll('.spec-item input')[2]?.value || '',
            structure: document.querySelectorAll('.spec-item input')[3]?.value || '',
            foundation: document.querySelectorAll('.spec-item input')[4]?.value || '',
            jointConnection: document.querySelectorAll('.spec-item input')[5]?.value || '',
            contactName: document.getElementById('contactName').value,
            contactDetails: document.getElementById('contactDetails').value,
            totalCost: document.getElementById('totalCost').value,
            gstAmount: document.getElementById('gstAmount').value,
            subsidy: document.getElementById('subsidy').value,
            costExclGST: document.getElementById('costExclGST').textContent,
            finalCost: document.getElementById('finalCost').textContent,
            insurance: document.getElementById('insurance').checked ? 'Yes' : 'No'
        };

        // Create WhatsApp message
        const whatsappMessage = `
*📄 VEIG ENERGY - SOLAR QUOTATION*

*👤 CUSTOMER DETAILS*
Name: ${formData.customerName}
Mobile: ${formData.mobileNumber}
Address: ${formData.address}

*🔋 SYSTEM DETAILS*
Type: ${capitalizeFirst(formData.systemType)}
Capacity: ${formData.capacity} ${formData.unit}
Quote Date: ${formData.date}
Validity: ${formData.validity}

*⚙️ SPECIFICATIONS*
Solar Panel: ${formData.solarPanel || 'N/A'}
Solar Inverter: ${formData.solarInverter || 'N/A'}
Electrical Item: ${formData.electricalItem || 'N/A'}
Structure: ${formData.structure || 'N/A'}
Foundation: ${formData.foundation || 'N/A'}
Joint & Connection: ${formData.jointConnection || 'N/A'}

*💰 PRICING BREAKDOWN*
Total Cost (incl. GST): ₹ ${formData.totalCost}
Cost (excl. GST): ${formData.costExclGST}
GST (8.9%): ₹ ${formData.gstAmount}
CFA Subsidy: ₹ ${formData.subsidy}
Final Effective Cost: ${formData.finalCost}

*📞 CONTACT PERSON*
Name: ${formData.contactName || 'N/A'}
Details: ${formData.contactDetails || 'N/A'}

*ℹ️ OTHER DETAILS*
Insurance: ${formData.insurance}
Generated: ${new Date().toLocaleString()}

_Please see attached PDF for complete details._
        `;

        // Create HTML content for PDF
        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Solar Quotation - ${formData.customerName}</title>
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body { font-family: Arial, sans-serif; background: #f5f5f5; padding: 20px; }
                    .pdf-container { max-width: 900px; margin: 0 auto; background: white; padding: 40px; }
                    .header { text-align: center; margin-bottom: 30px; border-bottom: 3px solid #00AA00; padding-bottom: 20px; }
                    .header h1 { color: #00AA00; font-size: 32px; margin-bottom: 5px; }
                    .header p { color: #666; font-size: 14px; }
                    .section { margin-bottom: 30px; }
                    .section-title { background: #f0f0f0; padding: 10px 15px; font-weight: bold; color: #333; font-size: 13px; text-transform: uppercase; margin-bottom: 15px; border-left: 4px solid #00AA00; }
                    .row { display: flex; margin-bottom: 12px; }
                    .col { flex: 1; }
                    .col-label { font-weight: bold; color: #333; font-size: 12px; margin-bottom: 4px; }
                    .col-value { color: #666; font-size: 13px; }
                    .table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                    .table th { background: #f0f0f0; padding: 10px; text-align: left; font-weight: bold; font-size: 12px; border: 1px solid #ddd; }
                    .table td { padding: 10px; border: 1px solid #ddd; font-size: 12px; }
                    .total-row { background: #f9f9f9; font-weight: bold; }
                    .final-cost { background: #00AA00; color: white; padding: 15px; text-align: center; margin-top: 20px; font-size: 18px; font-weight: bold; }
                    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 11px; color: #999; }
                    @media print {
                        body { background: white; }
                        .pdf-container { padding: 0; box-shadow: none; }
                    }
                </style>
            </head>
            <body>
                <div class="pdf-container">
                    <div class="header">
                        <h1>VEIG ENERGY</h1>
                        <p>Solar Quotation Generator</p>
                    </div>
                    
                    <div class="section">
                        <div class="section-title">CUSTOMER DETAILS</div>
                        <div class="row">
                            <div class="col">
                                <div class="col-label">Customer Name</div>
                                <div class="col-value">${formData.customerName}</div>
                            </div>
                            <div class="col">
                                <div class="col-label">Mobile Number</div>
                                <div class="col-value">${formData.mobileNumber}</div>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col">
                                <div class="col-label">Address</div>
                                <div class="col-value">${formData.address}</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="section">
                        <div class="section-title">SYSTEM DETAILS</div>
                        <div class="row">
                            <div class="col">
                                <div class="col-label">System Type</div>
                                <div class="col-value">${capitalizeFirst(formData.systemType)}</div>
                            </div>
                            <div class="col">
                                <div class="col-label">Capacity</div>
                                <div class="col-value">${formData.capacity} ${formData.unit}</div>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col">
                                <div class="col-label">Quote Date</div>
                                <div class="col-value">${formData.date}</div>
                            </div>
                            <div class="col">
                                <div class="col-label">Validity</div>
                                <div class="col-value">${formData.validity}</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="section">
                        <div class="section-title">SYSTEM SPECIFICATIONS</div>
                        <div class="row">
                            <div class="col">
                                <div class="col-label">Solar Panel</div>
                                <div class="col-value">${formData.solarPanel || 'N/A'}</div>
                            </div>
                            <div class="col">
                                <div class="col-label">Solar Inverter</div>
                                <div class="col-value">${formData.solarInverter || 'N/A'}</div>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col">
                                <div class="col-label">Electrical Item</div>
                                <div class="col-value">${formData.electricalItem || 'N/A'}</div>
                            </div>
                            <div class="col">
                                <div class="col-label">Structure</div>
                                <div class="col-value">${formData.structure || 'N/A'}</div>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col">
                                <div class="col-label">Foundation</div>
                                <div class="col-value">${formData.foundation || 'N/A'}</div>
                            </div>
                            <div class="col">
                                <div class="col-label">Joint & Connection</div>
                                <div class="col-value">${formData.jointConnection || 'N/A'}</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="section">
                        <div class="section-title">PRICING</div>
                        <table class="table">
                            <tr>
                                <td>Total System Cost (incl. GST)</td>
                                <td style="text-align: right;">₹ ${formData.totalCost}</td>
                            </tr>
                            <tr>
                                <td>System Cost (excl. GST)</td>
                                <td style="text-align: right;">${formData.costExclGST}</td>
                            </tr>
                            <tr>
                                <td>GST (8.9%)</td>
                                <td style="text-align: right;">₹ ${formData.gstAmount}</td>
                            </tr>
                            <tr>
                                <td>CFA Subsidy</td>
                                <td style="text-align: right;">₹ ${formData.subsidy}</td>
                            </tr>
                            <tr class="total-row">
                                <td>Final Effective Cost</td>
                                <td style="text-align: right;">${formData.finalCost}</td>
                            </tr>
                        </table>
                    </div>
                    
                    <div class="section">
                        <div class="section-title">CONTACT PERSON</div>
                        <div class="row">
                            <div class="col">
                                <div class="col-label">Name</div>
                                <div class="col-value">${formData.contactName || 'N/A'}</div>
                            </div>
                            <div class="col">
                                <div class="col-label">Contact Details</div>
                                <div class="col-value">${formData.contactDetails || 'N/A'}</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="final-cost">
                        ${formData.finalCost}
                    </div>
                    
                    <div class="footer">
                        <p>Generated by VEIG ENERGY - Solar Quotation System</p>
                        <p>Note: Meter charges included upto ₹ 3000 | Insurance: ${formData.insurance}</p>
                        <p>Generated on: ${new Date().toLocaleString()}</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        // Save PDF and open print dialog
        const printWindow = window.open('', '_blank');
        printWindow.document.write(htmlContent);
        printWindow.document.close();

        // Wait for print dialog
        setTimeout(() => {
            printWindow.print();
        }, 500);

        // Send to WhatsApp Web
        setTimeout(() => {
            sendToWhatsApp(whatsappMessage);
        }, 1000);

    } catch (error) {
        console.error('Error generating PDF:', error);
        alert('Error generating PDF. Please check console for details.');
    }
}

// Send message to WhatsApp Web
function sendToWhatsApp(message) {
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
    
    // Open WhatsApp Web with the message
    const whatsappWindow = window.open(whatsappUrl, '_blank');
    
    if (!whatsappWindow) {
        alert('Please enable pop-ups to send WhatsApp message. Message ready to send:\n\n' + message);
    } else {
        alert('WhatsApp will open. Please attach the PDF and send the message.');
    }
}

function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Initialize on page load
window.addEventListener('DOMContentLoaded', setDefaultDate);
