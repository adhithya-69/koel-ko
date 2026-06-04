// Parse URL Query Parameters
const urlParams = new URLSearchParams(window.location.search);
const plan = urlParams.get('plan') || 'Business';
const amount = parseInt(urlParams.get('amount')) || 9999;
const clientName = urlParams.get('name') || 'Client';
const email = urlParams.get('email') || 'hello@koelko.in';
const initialMethod = urlParams.get('method') || 'CARD';

// Populate summary data
document.getElementById('summaryPlan').textContent = plan;
document.getElementById('summaryName').textContent = clientName;
document.getElementById('refId').textContent = 'KK-' + String(Math.floor(Math.random()*9000)+1000);
document.getElementById('otpAmount').textContent = '₹' + amount.toLocaleString('en-IN');

// Dynamic description for the booking
const descEl = document.getElementById('gatewayDescription');
if (descEl) {
  const packageNames = {
    Starter: 'Starter Website Booking (50% Advance)',
    Business: 'Business Website Booking (50% Advance)',
    Premium: 'E-Commerce Store Booking (50% Advance)'
  };
  descEl.textContent = packageNames[plan] || `${plan} Website Booking (50% Advance)`;
}

const formattedAmount = '₹' + amount.toLocaleString('en-IN');
document.getElementById('summaryDue').textContent = formattedAmount;
document.querySelectorAll('.pay-amount-lbl').forEach(el => el.textContent = amount.toLocaleString('en-IN'));

// Tab Switching System
function switchTab(tabId) {
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
  
  document.getElementById(`tabBtn-${tabId}`).classList.add('active');
  document.getElementById(`tabContent-${tabId}`).classList.add('active');
  
  // Clear any existing errors when switching tabs
  const cardErr = document.getElementById('cardError');
  const nbErr = document.getElementById('nbError');
  if (cardErr) cardErr.style.display = 'none';
  if (nbErr) nbErr.style.display = 'none';
}

// Auto-activate correct tab on page load based on query method
if (initialMethod.toUpperCase() === 'UPI') {
  switchTab('upi');
} else if (initialMethod.toUpperCase() === 'NET BANKING' || initialMethod.toUpperCase() === 'NETBANKING' || initialMethod.toUpperCase() === 'NB') {
  switchTab('nb');
} else {
  switchTab('card');
}

// Live card inputs link
const cardNumInput = document.getElementById('cardNumber');
const cardHolderInput = document.getElementById('cardHolder');
const cardExpiryInput = document.getElementById('cardExpiry');

if (cardNumInput) {
  cardNumInput.addEventListener('input', (e) => {
    // Format to 4-digit chunks
    let value = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    let formatted = '';
    for(let i = 0; i < value.length; i++) {
      if(i > 0 && i % 4 === 0) formatted += ' ';
      formatted += value[i];
    }
    e.target.value = formatted;
    
    document.getElementById('cardNumPreview').textContent = formatted || '•••• •••• •••• ••••';
    
    // Card Brand Detection
    const brand = document.getElementById('cardBrand');
    if(value.startsWith('4')) {
      brand.textContent = 'VISA';
      brand.style.color = '#3b82f6';
    } else if(value.startsWith('5')) {
      brand.textContent = 'MC';
      brand.style.color = '#ef4444';
    } else {
      brand.textContent = 'CARD';
      brand.style.color = 'var(--text-muted)';
    }
  });
}

if (cardHolderInput) {
  cardHolderInput.addEventListener('input', (e) => {
    document.getElementById('cardHolderPreview').textContent = e.target.value || 'Your Name';
  });
}

if (cardExpiryInput) {
  cardExpiryInput.addEventListener('input', (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 2) {
      value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    e.target.value = value;
    document.getElementById('cardExpiryPreview').textContent = value || 'MM/YY';
  });
}

// Clipboard UPI Copy
function copyUpi() {
  const upiId = document.getElementById('upiId').textContent;
  navigator.clipboard.writeText(upiId).then(() => {
    const btn = document.querySelector('.copy-btn');
    btn.textContent = 'Copied!';
    setTimeout(() => { btn.textContent = 'Copy ID'; }, 2000);
  });
}

// Netbanking Select bank
let selectedNbBank = '';
function selectBank(element, bankName) {
  document.querySelectorAll('.nb-bank').forEach(b => b.classList.remove('active'));
  element.classList.add('active');
  selectedNbBank = bankName;
  const nbErr = document.getElementById('nbError');
  if (nbErr) nbErr.style.display = 'none';
}

// Payment flows simulations
function startCardPayment() {
  const cardNum = cardNumInput.value.replace(/\s+/g, '');
  const holder = cardHolderInput.value.trim();
  const expiry = cardExpiryInput.value.trim();
  const cvv = document.getElementById('cardCvv').value.trim();
  const cardErr = document.getElementById('cardError');
  
  if (cardErr) cardErr.style.display = 'none';
  
  if(cardNum.length < 16 || !holder || expiry.length < 5 || cvv.length < 3) {
    if (cardErr) {
      cardErr.textContent = '⚠ Please enter valid credit card details.';
      cardErr.style.display = 'block';
    }
    return;
  }
  
  showProcessing('Connecting to Secure Card Network...', () => {
    openOtpModal();
  });
}

// Keep startUpiPayment and startUpiAppPay as needed
function startUpiPayment() {
  showProcessing('Waiting for UPI Payment confirmation...', () => {
    simulateFinalSuccess();
  });
}

function startUpiAppPay() {
  showProcessing('Launching external UPI App context...', () => {
    simulateFinalSuccess();
  });
}

function startNbPayment() {
  const nbErr = document.getElementById('nbError');
  if (nbErr) nbErr.style.display = 'none';

  if(!selectedNbBank) {
    if (nbErr) {
      nbErr.textContent = '⚠ Please select a Bank to pay with.';
      nbErr.style.display = 'block';
    }
    return;
  }
  
  showProcessing(`Redirecting to secure gateway of ${selectedNbBank}...`, () => {
    openOtpModal();
  });
}

// Processing Overlay Controller
function showProcessing(statusText, callback) {
  const overlay = document.getElementById('processingOverlay');
  const status = document.getElementById('processingStatus');
  
  status.textContent = statusText;
  overlay.classList.add('active');
  
  setTimeout(() => {
    status.textContent = 'Authorizing transaction...';
    setTimeout(() => {
      overlay.classList.remove('active');
      if(callback) callback();
    }, 1800);
  }, 1500);
}

// OTP Dialog System
let countdownTimer;
function openOtpModal() {
  const dialog = document.getElementById('otpDialog');
  dialog.classList.add('active');
  
  const otpErr = document.getElementById('otpError');
  if (otpErr) otpErr.style.display = 'none';
  
  // Clear any existing values and focus first field
  document.querySelectorAll('.otp-input').forEach(input => input.value = '');
  document.getElementById('otp1').focus();
  
  // Timer Countdown
  let timeLeft = 59;
  const timerSpan = document.getElementById('otpCountdown');
  timerSpan.textContent = timeLeft;
  
  clearInterval(countdownTimer);
  countdownTimer = setInterval(() => {
    timeLeft--;
    timerSpan.textContent = timeLeft;
    if(timeLeft <= 0) {
      clearInterval(countdownTimer);
      document.querySelector('.otp-timer').textContent = "Didn't receive code? Resend Code";
      document.querySelector('.otp-timer').style.cursor = 'pointer';
    }
  }, 1000);
}

function closeOtp() {
  clearInterval(countdownTimer);
  document.getElementById('otpDialog').classList.remove('active');
}

// Move cursor on OTP field input
function moveFocus(current, nextId) {
  if (current.value.length === 1) {
    document.getElementById(nextId).focus();
  }
}

function verifyOtp() {
  let otp = '';
  document.querySelectorAll('.otp-input').forEach(input => otp += input.value);
  const otpErr = document.getElementById('otpError');
  
  if (otpErr) otpErr.style.display = 'none';
  
  if(otp.length < 6) {
    if (otpErr) {
      otpErr.textContent = '⚠ Please enter the complete 6-digit verification code.';
      otpErr.style.display = 'block';
    }
    return;
  }
  
  closeOtp();
  
  // Show processing success
  const overlay = document.getElementById('processingOverlay');
  const status = document.getElementById('processingStatus');
  
  status.textContent = 'Verifying security token...';
  overlay.classList.add('active');
  
  setTimeout(() => {
    status.textContent = 'Securing booking slot...';
    setTimeout(() => {
      overlay.classList.remove('active');
      simulateFinalSuccess();
    }, 1200);
  }, 1200);
}

// Final Success Checkmark Animation and Redirect
function simulateFinalSuccess() {
  // Replace checkout container content with a beautiful success screen
  const container = document.querySelector('.checkout-container');
  container.style.display = 'flex';
  container.style.flexDirection = 'column';
  container.style.alignItems = 'center';
  container.style.justifyContent = 'center';
  container.style.padding = '5rem 2rem';
  
  container.innerHTML = `
    <div class="success-screen">
      <div class="checkmark-circle">
        <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
      </div>
      <h2 style="font-family: 'Cormorant Garamond', serif; font-size: 2.2rem; font-style: italic; font-weight: 300; margin-bottom: 0.8rem;">Welcome to the Ko-Ko Family!</h2>
      <p style="font-size: 0.88rem; color: var(--text-muted); margin-bottom: 2rem;">Payment authorized. Connecting you back to Koel & Ko...</p>
      <div style="font-family: 'DM Mono', monospace; font-size: 0.72rem; color: var(--gold-light);">Ref: TRANS-AUTHORIZATION-OK</div>
    </div>
  `;
  
  setTimeout(() => {
    // Redirect back to main page
    const returnUrl = `koel-and-ko.html?status=success&plan=${encodeURIComponent(plan)}&amount=${encodeURIComponent(amount)}&name=${encodeURIComponent(clientName)}&email=${encodeURIComponent(email)}`;
    window.location.href = returnUrl;
  }, 2200);
}