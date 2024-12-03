document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    
    const form = document.getElementById('receiptForm');
    const newReceiptBtn = document.getElementById('newReceipt');
    const printBtn = document.getElementById('printBtn');
    const shareBtn = document.getElementById('shareBtn');
    
    let receiptNumber = generateReceiptNumber();
    let timeInterval;

    // Set default payment month to current month
    const currentMonth = new Date().toLocaleString('en-US', { month: 'long' });
    document.getElementById('paymentMonth').value = currentMonth;

    function updateTime() {
        document.getElementById('receiptTime').textContent = formatTime();
    }

    function startTimeUpdate() {
        updateTime();
        timeInterval = setInterval(updateTime, 1000);
    }

    function updateReceipt() {
        const formData = new FormData(form);
        
        document.getElementById('receiptInstitute').textContent = formData.get('instituteName') || 'Institute Name';
        document.getElementById('receiptStudent').textContent = formData.get('studentName') || '-';
        document.getElementById('receiptCourse').textContent = formData.get('courseName') || '-';
        document.getElementById('receiptMonth').textContent = formData.get('paymentMonth') || '-';
        document.getElementById('receiptPayment').textContent = formData.get('paymentMode');
        document.getElementById('receiptFees').textContent = formData.get('fees') ? formatCurrency(formData.get('fees')) : '-';
        document.getElementById('receiptNumber').textContent = receiptNumber;
        document.getElementById('receiptDate').textContent = formatDate(new Date());

        // Save to localStorage
        const dataToSave = {
            instituteName: formData.get('instituteName'),
            studentName: formData.get('studentName'),
            courseName: formData.get('courseName'),
            fees: formData.get('fees'),
            paymentMonth: formData.get('paymentMonth'),
            paymentMode: formData.get('paymentMode')
        };
        localStorage.setItem('receiptFormData', JSON.stringify(dataToSave));
    }

    // Load saved data
    const savedData = localStorage.getItem('receiptFormData');
    if (savedData) {
        const data = JSON.parse(savedData);
        Object.entries(data).forEach(([key, value]) => {
            const input = form.elements[key];
            if (input) input.value = value;
        });
    }

    // Initialize receipt
    document.getElementById('receiptNumber').textContent = receiptNumber;
    document.getElementById('receiptDate').textContent = formatDate(new Date());
    updateReceipt();
    startTimeUpdate();

    // Event listeners
    form.addEventListener('input', updateReceipt);

    newReceiptBtn.addEventListener('click', () => {
        receiptNumber = generateReceiptNumber();
        document.getElementById('receiptNumber').textContent = receiptNumber;
        form.reset();
        document.getElementById('paymentMonth').value = currentMonth;
        updateReceipt();
    });

    printBtn.addEventListener('click', () => {
        window.print();
    });

    shareBtn.addEventListener('click', async () => {
        try {
            const receiptElement = document.getElementById('receipt');
            const canvas = await html2canvas(receiptElement);
            const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
            
            if (!blob) throw new Error('Failed to create image');

            const file = new File([blob], 'receipt.png', { type: 'image/png' });

            if (navigator.share && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    files: [file],
                    title: 'Course Receipt',
                    text: 'Here is your course receipt'
                });
            } else {
                const link = document.createElement('a');
                link.href = canvas.toDataURL('image/png');
                link.download = 'receipt.png';
                link.click();
            }
        } catch (error) {
            console.error('Error sharing:', error);
            alert('Could not share the receipt. You can try printing it instead.');
        }
    });
});