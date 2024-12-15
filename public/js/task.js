document.getElementById('whatsapp-share').addEventListener('click', function() {
    const title = this.getAttribute('data-title');
    const date = this.getAttribute('data-date');
    const data = this.getAttribute('data-data');
    const message = `Check out my khata:\nTitle: ${title}\nDate: ${date}\nData: ${data}`;
    const whatsappURL = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappURL, '_blank');
});

document.getElementById('sms-share').addEventListener('click', function() {
    const title = this.getAttribute('data-title');
    const date = this.getAttribute('data-date');
    const data = this.getAttribute('data-data');
    const message = `Check out my khata:\nTitle: ${title}\nDate: ${date}\nData: ${data}`;
    const smsURL = `sms:?body=${encodeURIComponent(message)}`;
    window.open(smsURL, '_blank');
});