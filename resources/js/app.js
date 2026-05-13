import QRCode from 'qrcode';

const MERCHANT_NAME = 'KHQR Merchant';
const MERCHANT_CITY = 'Phnom Penh';
const ACCOUNT_ID = 'your-bakong-account-id'; // Replace with your Bakong account ID
const MERCHANT_ID = 'your-merchant-id'; // Replace with your merchant ID

const amountInput = document.getElementById('amount');
const currencySelect = document.getElementById('currency');
const generateBtn = document.getElementById('generateBtn');
const qrContainer = document.getElementById('qrContainer');
const qrCode = document.getElementById('qrCode');
const displayAmount = document.getElementById('displayAmount');
const merchantInfo = document.getElementById('merchantInfo');

amountInput.addEventListener('input', () => {
    const val = parseFloat(amountInput.value);
    generateBtn.disabled = !(val > 0);
});

generateBtn.addEventListener('click', async () => {
    const amount = parseFloat(amountInput.value);
    const currency = currencySelect.value;

    if (!(amount > 0)) return;

    generateBtn.disabled = true;
    generateBtn.textContent = 'Generating...';

    try {
        const khqrData = generateKHQR(amount, currency);
        const canvas = document.createElement('canvas');
        await QRCode.toCanvas(canvas, khqrData, {
            width: 280,
            margin: 2,
            color: {
                dark: '#1a1a1a',
                light: '#ffffff',
            },
        });
        qrCode.innerHTML = '';
        qrCode.appendChild(canvas);

        const currSymbol = currency === 'KHR' ? '៛' : '$';
        const formatted = currency === 'KHR'
            ? new Intl.NumberFormat('km-KH').format(amount)
            : amount.toFixed(2);
        displayAmount.textContent = `${formatted} ${currSymbol}`;
        merchantInfo.textContent = `${MERCHANT_NAME} · ${MERCHANT_CITY}`;

        qrContainer.classList.remove('hidden');
    } catch (err) {
        console.error('Failed to generate QR:', err);
        alert('Failed to generate QR code. Please try again.');
    }

    generateBtn.disabled = false;
    generateBtn.textContent = 'Generate KHQR';
});

function generateKHQR(amount, currency) {
    const payload = [
        '00', '01', // Payload Format Indicator
        '01', '11', // Point of Initiation Method: 11=dynamic
        '29', '40', // Merchant Account Information (Bakong)
        '00', formatField(ACCOUNT_ID.length.toString(), ACCOUNT_ID),
        '01', formatField(MERCHANT_ID.length.toString(), MERCHANT_ID),
        '02', formatField('Bakong'.length.toString(), 'Bakong'),
        '52', '03', '116', // Merchant Category Code
        '53', '03', currency === 'KHR' ? '116' : '840', // Transaction Currency
        '54', formatField(amount.toFixed(2).length.toString(), amount.toFixed(2)), // Transaction Amount
        '58', '02', 'KH', // Country Code
        '59', formatField(MERCHANT_NAME.length.toString(), MERCHANT_NAME), // Merchant Name
        '60', formatField(MERCHANT_CITY.length.toString(), MERCHANT_CITY), // Merchant City
    ];

    let data = payload.join('');
    data += '63' + '04' + crc16(data + '6304');

    return data;
}

function formatField(len, value) {
    return len.padStart(2, '0') + value;
}

function crc16(data) {
    let crc = 0xFFFF;
    for (let i = 0; i < data.length; i++) {
        crc ^= data.charCodeAt(i) << 8;
        for (let j = 0; j < 8; j++) {
            crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
        }
    }
    return (crc & 0xFFFF).toString(16).toUpperCase().padStart(4, '0');
}
