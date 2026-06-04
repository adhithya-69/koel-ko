// ── CURSOR
const dot = document.getElementById('dot');
const ring = document.getElementById('ring');
document.addEventListener('mousemove', e => {
  dot.style.left = e.clientX + 'px';
  dot.style.top = e.clientY + 'px';
  setTimeout(() => {
    ring.style.left = e.clientX + 'px';
    ring.style.top = e.clientY + 'px';
  }, 60);
});

// ── SCROLL EFFECTS
window.addEventListener('scroll', () => {
  const nav = document.getElementById('navbar');
  const activePage = document.querySelector('.page.active');
  const isHome = activePage && activePage.id === 'home-page';
  if (nav) {
    if (isHome) {
      nav.classList.toggle('scrolled', window.scrollY > 60);
    } else {
      nav.classList.add('scrolled');
    }
  }
  const progress = document.getElementById('progress');
  const pct = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
  if (progress) progress.style.width = pct + '%';
  revealOnScroll();
  animateBars();
  animateCounters();
});

// ── REVEAL ON SCROLL
function revealOnScroll() {
  document.querySelectorAll('.reveal').forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight - 80) el.classList.add('visible');
  });
}

// ── BARS
let barsAnimated = false;
function animateBars() {
  if (barsAnimated) return;
  const bars = document.querySelectorAll('.bar-fill');
  bars.forEach(b => {
    const rect = b.getBoundingClientRect();
    if (rect.top < window.innerHeight) {
      b.style.width = b.dataset.width + '%';
      barsAnimated = true;
    }
  });
}

// ── COUNTERS
let countersAnimated = false;
function animateCounters() {
  if (countersAnimated) return;
  const counters = document.querySelectorAll('.num[data-count]');
  if (!counters.length) return;
  const first = counters[0].getBoundingClientRect();
  if (first.top > window.innerHeight) return;
  countersAnimated = true;
  counters.forEach(el => {
    const target = parseInt(el.dataset.count);
    const suffix = el.dataset.count == '100' ? '%' : el.dataset.count == '12' ? '' : '';
    let current = 0;
    const step = target / 60;
    const timer = setInterval(() => {
      current = Math.min(current + step, target);
      el.textContent = Math.floor(current) + (el.dataset.count == '100' ? '%' : '+');
      if (current >= target) clearInterval(timer);
    }, 20);
  });
}

// ── PAGE SYSTEM
let currentPlan = { name: 'Business', price: 19999 };

function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const page = document.getElementById(id);
  if (page) {
    page.classList.add('active');
    window.scrollTo(0,0);
    
    // Contextually update main navbar scrolled class and CTA content
    const nav = document.getElementById('navbar');
    if (nav) {
      if (id === 'home-page') {
        nav.classList.toggle('scrolled', window.scrollY > 60);
      } else {
        nav.classList.add('scrolled');
      }
    }
    
    const navCta = document.querySelector('#navbar .nav-cta');
    if (navCta) {
      if (id === 'home-page') {
        navCta.textContent = 'Start a Project';
        navCta.setAttribute('onclick', "showPage('form-page')");
        navCta.style.display = 'block';
      } else if (id === 'form-page') {
        navCta.textContent = '← Back to Home';
        navCta.setAttribute('onclick', "showPage('home-page')");
        navCta.style.display = 'block';
      } else if (id === 'payment-page') {
        navCta.textContent = '← Edit Brief';
        navCta.setAttribute('onclick', "showPage('form-page')");
        navCta.style.display = 'block';
      } else if (id === 'success-page') {
        navCta.textContent = '← Back to Home';
        navCta.setAttribute('onclick', "showPage('home-page')");
        navCta.style.display = 'block';
      }
    }
    
    if (id === 'form-page') {
      activeStep = 1;
      updateWizard();
    }
    
    if (id === 'home-page') {
      setTimeout(revealOnScroll, 100);
    }
  }
}

let activeStep = 1;
const totalSteps = 8;

function updateWizard() {
  document.querySelectorAll('.wizard-step').forEach(step => {
    step.style.display = 'none';
  });
  
  const activeStepEl = document.querySelector(`.wizard-step[data-step="${activeStep}"]`);
  if (activeStepEl) {
    activeStepEl.style.display = 'block';
  }
  
  const prevBtn = document.getElementById('prevStepBtn');
  if (prevBtn) {
    prevBtn.style.display = activeStep > 1 ? 'block' : 'none';
  }
  
  const nextBtn = document.getElementById('nextStepBtn');
  if (nextBtn) {
    if (activeStep === 7) {
      nextBtn.textContent = 'Accept & Select Plan →';
    } else if (activeStep === 8) {
      nextBtn.textContent = 'Proceed to Payment →';
    } else {
      nextBtn.textContent = 'Next Step →';
    }
  }
  
  const stepTitles = [
    "Business Profile",
    "Goals & Audience",
    "Design & Style",
    "Scope & Features",
    "Content & Timeline",
    "Project Brief & Budget",
    "Review Brief Details",
    "Select Your Plan"
  ];
  
  const progressFill = document.getElementById('stepperProgress');
  const stepNumEl = document.getElementById('stepperStepNum');
  const stepTitleEl = document.getElementById('stepperStepTitle');
  
  if (progressFill) {
    const pct = ((activeStep - 1) / (totalSteps - 1)) * 100;
    progressFill.style.width = pct + '%';
  }
  if (stepNumEl) stepNumEl.textContent = `Step ${activeStep} of ${totalSteps}`;
  if (stepTitleEl) stepTitleEl.textContent = stepTitles[activeStep - 1] || '';
  
  const errDiv = document.getElementById('briefFormError');
  if (errDiv) errDiv.style.display = 'none';

  if (activeStep === 7) {
    renderReviewSummary();
  }
}

function nextWizardStep() {
  if (validateStep(activeStep)) {
    if (activeStep < totalSteps) {
      activeStep++;
      updateWizard();
    } else {
      submitForm();
    }
  }
}

function prevWizardStep() {
  if (activeStep > 1) {
    activeStep--;
    updateWizard();
  }
}

function showError(msg) {
  const errDiv = document.getElementById('briefFormError');
  if (errDiv) {
    errDiv.textContent = '⚠ ' + msg;
    errDiv.style.display = 'block';
  }
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateStep(step) {
  const errDiv = document.getElementById('briefFormError');
  if (errDiv) errDiv.style.display = 'none';

  if (step === 1) {
    const name = document.getElementById('clientName').value.trim();
    const company = document.getElementById('companyName').value.trim();
    const email = document.getElementById('clientEmail').value.trim();
    const industry = document.getElementById('industry').value;
    const businessDesc = document.getElementById('businessDesc').value.trim();
    const productsServices = document.getElementById('productsServices').value.trim();

    if (!name || !company || !email || !industry || !businessDesc || !productsServices) {
      showError('Please fill in your name, company, email, industry, description and services.');
      return false;
    }
    if (!validateEmail(email)) {
      showError('Please enter a valid email address.');
      return false;
    }
  }
  
  if (step === 2) {
    const differentiator = document.getElementById('differentiator').value.trim();
    const primaryGoal = document.getElementById('primaryGoal').value;
    
    const targetAudience = Array.from(document.querySelectorAll('input[name="targetAudience"]:checked'));
    const websiteGoals = Array.from(document.querySelectorAll('input[name="websiteGoals"]:checked'));
    const visitorActions = Array.from(document.querySelectorAll('input[name="visitorActions"]:checked'));

    if (!differentiator || !primaryGoal) {
      showError('Please specify competitor difference and primary goal.');
      return false;
    }
    if (targetAudience.length === 0 || websiteGoals.length === 0 || visitorActions.length === 0) {
      showError('Please check at least one box for target audience, website goals, and visitor actions.');
      return false;
    }
  }

  if (step === 4) {
    const approxPages = document.getElementById('approxPages').value;
    const pagesNeeded = Array.from(document.querySelectorAll('input[name="pagesNeeded"]:checked'));
    const featuresRequired = Array.from(document.querySelectorAll('input[name="featuresRequired"]:checked'));

    if (!approxPages) {
      showError('Please select approximately how many pages you need.');
      return false;
    }
    if (pagesNeeded.length === 0) {
      showError('Please select which pages you need.');
      return false;
    }
    if (featuresRequired.length === 0) {
      showError('Please select features you require.');
      return false;
    }
  }

  if (step === 5) {
    const timeline = document.getElementById('timeline').value;
    if (!timeline) {
      showError('Please select when you need the website completed.');
      return false;
    }
  }

  if (step === 6) {
    const dreamWebsite = document.getElementById('dreamWebsite').value.trim();
    if (!dreamWebsite) {
      showError('Please describe your dream website.');
      return false;
    }
  }

  if (step === 7) {
    const agreePayment = document.getElementById('agreePayment').checked;
    const agreeTimelines = document.getElementById('agreeTimelines').checked;
    const agreePricing = document.getElementById('agreePricing').checked;
    const agreeTerms = document.getElementById('agreeTerms').checked;

    if (!agreePayment || !agreeTimelines || !agreePricing || !agreeTerms) {
      showError('You must agree to all terms and conditions to proceed.');
      return false;
    }
  }

  return true;
}

function selectStyleCard(card, styleName) {
  document.querySelectorAll('.style-card').forEach(c => c.classList.remove('active'));
  card.classList.add('active');
  document.getElementById('preferredStyle').value = styleName;
}

function selectPlanInWizard(planName, price) {
  document.getElementById('selectedPlanVal').value = planName;
  
  document.querySelectorAll('.plan-wizard-card').forEach(card => {
    card.classList.remove('active');
    const cardTitle = card.querySelector('.plan-wizard-title').textContent.trim();
    if (cardTitle.toLowerCase() === planName.toLowerCase()) {
      card.classList.add('active');
    }
  });
}

function toggleLogoUpload(show) {
  const el = document.getElementById('logoUploadField');
  if (el) el.style.display = show ? 'block' : 'none';
}

function handleLogoUpload(input) {
  const nameEl = document.getElementById('logoFileName');
  if (input.files && input.files[0]) {
    nameEl.textContent = 'Selected: ' + input.files[0].name;
    nameEl.style.color = 'var(--gold)';
  } else {
    nameEl.textContent = 'Click to select logo file';
    nameEl.style.color = 'var(--text-soft)';
  }
}

function renderReviewSummary() {
  const container = document.getElementById('reviewContainer');
  if (!container) return;
  
  const getCheckedValues = (name) => {
    return Array.from(document.querySelectorAll(`input[name="${name}"]:checked`)).map(el => el.value);
  };
  
  const getRadioValue = (name) => {
    const el = document.querySelector(`input[name="${name}"]:checked`);
    return el ? el.value : '';
  };
  
  const name = document.getElementById('clientName').value.trim();
  const company = document.getElementById('companyName').value.trim();
  const email = document.getElementById('clientEmail').value.trim();
  const industry = document.getElementById('industry').value;
  const businessDesc = document.getElementById('businessDesc').value.trim();
  const productsServices = document.getElementById('productsServices').value.trim();
  
  const differentiator = document.getElementById('differentiator').value.trim();
  const targetAudience = getCheckedValues('targetAudience').join(', ') || 'None selected';
  const websiteGoals = getCheckedValues('websiteGoals').join(', ') || 'None selected';
  const visitorActions = getCheckedValues('visitorActions').join(', ') || 'None selected';
  const primaryGoal = document.getElementById('primaryGoal').value;
  
  const hasBranding = getRadioValue('hasBranding');
  const hasLogo = getRadioValue('hasLogo');
  const colorPrimary = document.getElementById('colorPrimary').value;
  const colorSecondary = document.getElementById('colorSecondary').value;
  const colorAccent = document.getElementById('colorAccent').value;
  const preferredStyle = document.getElementById('preferredStyle').value;
  const likedSite1 = document.getElementById('likedSite1').value.trim();
  const likedSite2 = document.getElementById('likedSite2').value.trim();
  const likedSite3 = document.getElementById('likedSite3').value.trim();
  const likedSites = [likedSite1, likedSite2, likedSite3].filter(Boolean).join(', ') || 'None provided';
  const likedSitesReason = document.getElementById('likedSitesReason').value.trim();
  
  const pagesNeeded = getCheckedValues('pagesNeeded').join(', ') || 'None selected';
  const approxPages = document.getElementById('approxPages').value;
  const featuresRequired = getCheckedValues('featuresRequired').join(', ') || 'None selected';
  const additionalFeatures = document.getElementById('additionalFeatures').value.trim();
  
  const hasContent = getRadioValue('hasContent');
  const needsCopywriting = getRadioValue('needsCopywriting');
  const hasImages = getRadioValue('hasImages');
  const needsStockImages = getRadioValue('needsStockImages');
  const timeline = document.getElementById('timeline').value;
  const launchDate = document.getElementById('launchDate').value;
  
  const budgetRange = getRadioValue('budgetRange');
  const paymentOption = getRadioValue('paymentOption');
  const dreamWebsite = document.getElementById('dreamWebsite').value.trim();
  
  container.innerHTML = `
    <div style="display:flex; flex-direction:column; gap:1.5rem; font-size:0.84rem; line-height:1.6; color:var(--text-soft)">
      <div>
        <h4 style="color:var(--gold); margin-bottom:0.4rem; font-size:0.9rem;">1. Business Profile</h4>
        <p><strong>Name:</strong> ${name || '—'}</p>
        <p><strong>Company:</strong> ${company || '—'}</p>
        <p><strong>Email:</strong> ${email || '—'}</p>
        <p><strong>Industry:</strong> ${industry || '—'}</p>
        <p><strong>About:</strong> ${businessDesc || '—'}</p>
        <p><strong>Offerings:</strong> ${productsServices || '—'}</p>
      </div>
      <div style="border-top: 1px solid var(--border-subtle); padding-top:1rem">
        <h4 style="color:var(--gold); margin-bottom:0.4rem; font-size:0.9rem;">2. Goals & Audience</h4>
        <p><strong>USP:</strong> ${differentiator || '—'}</p>
        <p><strong>Target Audience:</strong> ${targetAudience}</p>
        <p><strong>Website Goals:</strong> ${websiteGoals}</p>
        <p><strong>Visitor Actions:</strong> ${visitorActions}</p>
        <p><strong>Primary Goal:</strong> ${primaryGoal || '—'}</p>
      </div>
      <div style="border-top: 1px solid var(--border-subtle); padding-top:1rem">
        <h4 style="color:var(--gold); margin-bottom:0.4rem; font-size:0.9rem;">3. Design & Style</h4>
        <p><strong>Has Branding:</strong> ${hasBranding}</p>
        <p><strong>Has Logo:</strong> ${hasLogo}</p>
        <p><strong>Colors Selected:</strong> 
          <span style="display:inline-block; width:12px; height:12px; background:${colorPrimary}; border-radius:2px; vertical-align:middle; margin-left:5px"></span> Primary (${colorPrimary})
          <span style="display:inline-block; width:12px; height:12px; background:${colorSecondary}; border-radius:2px; vertical-align:middle; margin-left:10px"></span> Secondary (${colorSecondary})
          <span style="display:inline-block; width:12px; height:12px; background:${colorAccent}; border-radius:2px; vertical-align:middle; margin-left:10px"></span> Accent (${colorAccent})
        </p>
        <p><strong>Preferred Style:</strong> ${preferredStyle}</p>
        <p><strong>Inspiration Links:</strong> ${likedSites}</p>
        <p><strong>Likes Reason:</strong> ${likedSitesReason || '—'}</p>
      </div>
      <div style="border-top: 1px solid var(--border-subtle); padding-top:1rem">
        <h4 style="color:var(--gold); margin-bottom:0.4rem; font-size:0.9rem;">4. Scope & Features</h4>
        <p><strong>Pages Needed:</strong> ${pagesNeeded}</p>
        <p><strong>Approx Pages Count:</strong> ${approxPages || '—'}</p>
        <p><strong>Features:</strong> ${featuresRequired}</p>
        <p><strong>Additional Specs:</strong> ${additionalFeatures || '—'}</p>
      </div>
      <div style="border-top: 1px solid var(--border-subtle); padding-top:1rem">
        <h4 style="color:var(--gold); margin-bottom:0.4rem; font-size:0.9rem;">5. Content & Timeline</h4>
        <p><strong>Has Copy:</strong> ${hasContent}</p>
        <p><strong>Needs Copywriting:</strong> ${needsCopywriting}</p>
        <p><strong>Has Images:</strong> ${hasImages}</p>
        <p><strong>Needs Stock Images:</strong> ${needsStockImages}</p>
        <p><strong>Timeline:</strong> ${timeline || '—'}</p>
        <p><strong>Launch Date Target:</strong> ${launchDate || '—'}</p>
      </div>
      <div style="border-top: 1px solid var(--border-subtle); padding-top:1rem">
        <h4 style="color:var(--gold); margin-bottom:0.4rem; font-size:0.9rem;">6. Brief & Budget</h4>
        <p><strong>Budget Range:</strong> ${budgetRange}</p>
        <p><strong>Payment Option Selected:</strong> ${paymentOption}</p>
        <p><strong>Dream Website Description:</strong> ${dreamWebsite || '—'}</p>
      </div>
    </div>
  `;
}

function selectPlan(name, price) {
  activeStep = 1;
  updateWizard();
  selectPlanInWizard(name, price);
  showPage('form-page');
}

let activePaymentMethod = 'UPI';
let selectedMerchantBankName = '';

function submitForm() {
  const name = document.getElementById('clientName').value.trim();
  const company = document.getElementById('companyName').value.trim();
  const email = document.getElementById('clientEmail').value.trim();
  const type = document.getElementById('selectedPlanVal').value; // Plan chosen in step 8
  
  const getCheckedValues = (name) => {
    return Array.from(document.querySelectorAll(`input[name="${name}"]:checked`)).map(el => el.value);
  };
  const getRadioValue = (name) => {
    const el = document.querySelector(`input[name="${name}"]:checked`);
    return el ? el.value : '';
  };

  const prices = { Starter: 9999, Business: 19999, Premium: 39999 };
  const paymentOption = getRadioValue('paymentOption');

  currentPlan = { 
    name: type, 
    price: prices[type], 
    clientName: name, 
    clientEmail: email,
    paymentOption: paymentOption
  };
  
  const submissionId = 'KK-' + Date.now();
  const newBrief = {
    id: submissionId,
    date: new Date().toLocaleString('en-IN'),
    name: name,
    company: company,
    email: email,
    planName: type,
    price: prices[type],
    paymentOption: paymentOption,
    status: 'Pending Payment',
    paymentId: '—',
    // Expanded Questionnaire Fields
    industry: document.getElementById('industry').value,
    businessDesc: document.getElementById('businessDesc').value.trim(),
    productsServices: document.getElementById('productsServices').value.trim(),
    differentiator: document.getElementById('differentiator').value.trim(),
    targetAudience: getCheckedValues('targetAudience'),
    websiteGoals: getCheckedValues('websiteGoals'),
    visitorActions: getCheckedValues('visitorActions'),
    primaryGoal: document.getElementById('primaryGoal').value,
    hasBranding: getRadioValue('hasBranding'),
    hasLogo: getRadioValue('hasLogo'),
    colorPrimary: document.getElementById('colorPrimary').value,
    colorSecondary: document.getElementById('colorSecondary').value,
    colorAccent: document.getElementById('colorAccent').value,
    preferredStyle: document.getElementById('preferredStyle').value,
    likedSites: [
      document.getElementById('likedSite1').value.trim(),
      document.getElementById('likedSite2').value.trim(),
      document.getElementById('likedSite3').value.trim()
    ].filter(Boolean),
    likedSitesReason: document.getElementById('likedSitesReason').value.trim(),
    pagesNeeded: getCheckedValues('pagesNeeded'),
    approxPages: document.getElementById('approxPages').value,
    featuresRequired: getCheckedValues('featuresRequired'),
    additionalFeatures: document.getElementById('additionalFeatures').value.trim(),
    hasContent: getRadioValue('hasContent'),
    needsCopywriting: getRadioValue('needsCopywriting'),
    hasImages: getRadioValue('hasImages'),
    needsStockImages: getRadioValue('needsStockImages'),
    timeline: document.getElementById('timeline').value,
    launchDate: document.getElementById('launchDate').value,
    budgetRange: getRadioValue('budgetRange'),
    dreamWebsite: document.getElementById('dreamWebsite').value.trim()
  };

  if (window.firebaseReady) {
    const { doc, setDoc } = window.firestoreSDK;
    setDoc(doc(window.firebaseDB, "orders", submissionId), newBrief)
      .then(() => {
        console.log("Brief successfully written to Firestore");
      })
      .catch(err => {
        console.error("Firestore write failed: ", err);
      });
  }

  let briefs = JSON.parse(localStorage.getItem('koel_project_briefs')) || [];
  briefs.push(newBrief);
  localStorage.setItem('koel_project_briefs', JSON.stringify(briefs));
  sessionStorage.setItem('koel_current_submission_id', submissionId);

  updatePaymentSummary();
  showPage('payment-page');
}

function updatePaymentSummary() {
  const p = currentPlan;
  const isFull = p.paymentOption === 'Full Payment';
  const total = p.price;
  const dueToday = isFull ? total : Math.round(total / 2);
  const dueLater = isFull ? 0 : Math.round(total / 2);

  document.getElementById('summaryPlan').textContent = p.name;
  document.getElementById('summaryName').textContent = p.clientName || '—';
  document.getElementById('summaryTotal').textContent = '₹' + total.toLocaleString('en-IN');
  document.getElementById('summaryAdvance').textContent = '₹' + Math.round(total / 2).toLocaleString('en-IN');
  document.getElementById('summaryDue').textContent = '₹' + dueToday.toLocaleString('en-IN');

  const notesEl = document.querySelector('.order-note');
  if (notesEl) {
    if (isFull) {
      notesEl.textContent = "You selected Full Payment. No further payments are due upon delivery. Thank you!";
    } else {
      notesEl.textContent = "The remaining 50% is due before your website goes live. No surprises.";
    }
  }
}

const RAZORPAY_KEY_ID = 'rzp_test_SxUyFdKf9t3Run'; // Replace with your real Razorpay Test Key ID

function processPayment() {
  const errDiv = document.getElementById('paymentError');
  if (errDiv) errDiv.style.display = 'none';

  const isFull = currentPlan.paymentOption === 'Full Payment';
  const dueToday = isFull ? currentPlan.price : Math.round(currentPlan.price / 2);
  
  const name = currentPlan.clientName || 'Client';
  const email = currentPlan.clientEmail || 'hello@koelko.in';
  const plan = currentPlan.name;

  if (RAZORPAY_KEY_ID === 'rzp_test_placeholder') {
    const redirectUrl = `payment-gateway.html?plan=${encodeURIComponent(plan)}&amount=${encodeURIComponent(dueToday)}&name=${encodeURIComponent(name)}&email=${encodeURIComponent(email)}&method=RAZORPAY`;
    window.location.href = redirectUrl;
    return;
  }

  const options = {
    "key": RAZORPAY_KEY_ID,
    "amount": dueToday * 100, // Amount in paise
    "currency": "INR",
    "name": "Koel & Ko",
    "description": `${plan} Website Booking (${isFull ? 'Full Payment' : '50% Advance'})`,
    "handler": function (response) {
      const paymentId = response.razorpay_payment_id;
      const successUrl = `koel-and-ko.html?status=success&plan=${encodeURIComponent(plan)}&amount=${encodeURIComponent(dueToday)}&name=${encodeURIComponent(name)}&email=${encodeURIComponent(email)}&payment_id=${encodeURIComponent(paymentId)}`;
      window.location.href = successUrl;
    },
    "prefill": {
      "name": name,
      "email": email
    },
    "theme": {
      "color": "#c9a84c"
    }
  };

  try {
    const rzp = new Razorpay(options);
    rzp.on('payment.failed', function (response) {
      if (errDiv) {
        errDiv.textContent = '⚠ ' + response.error.description;
        errDiv.style.display = 'block';
      }
    });
    rzp.open();
  } catch (error) {
    console.error("Razorpay SDK Error:", error);
    if (errDiv) {
      errDiv.textContent = '⚠ Failed to load payment gateway. Please check your Key ID.';
      errDiv.style.display = 'block';
    }
  }
}

// ── FAQ
function toggleFaq(btn) {
  const item = btn.closest('.faq-item');
  const answer = item.querySelector('.faq-answer');
  const isOpen = item.classList.contains('open');
  document.querySelectorAll('.faq-item.open').forEach(i => {
    i.classList.remove('open');
    i.querySelector('.faq-answer').style.maxHeight = '0';
  });
  if (!isOpen) {
    item.classList.add('open');
    answer.style.maxHeight = answer.scrollHeight + 'px';
  }
}

// ── MOBILE NAV
function openMobile() {
  document.getElementById('mobileMenu').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeMobile() {
  document.getElementById('mobileMenu').classList.remove('open');
  document.body.style.overflow = '';
}

// ── FAQS SYSTEM
const faqs = [
  {
    q: 'How does the process work?',
    a: 'You fill our minimal 5-field form, choose a package, and complete payment. We then review your requirements, ask any targeted follow-up questions if needed, and begin building. You\'ll receive regular updates until launch.',
  },
  {
    q: 'Why do you ask so few questions upfront?',
    a: 'Our philosophy is quality over quantity — in every aspect. We don\'t want to waste your time with a 30-question form. We ask for the essentials, then conduct our own research and discovery before reaching out for specifics.',
  },
  {
    q: 'What if I need changes after delivery?',
    a: 'All packages include post-launch support. Revision rounds are built into every package, and minor adjustments after launch are included during the support window. Major new features are quoted separately.',
  },
  {
    q: 'Do I own the website and code?',
    a: 'Absolutely. Upon final payment and delivery, you receive full ownership of all code, assets, and credentials. We don\'t hold anything back or retain any licensing rights.',
  },
  {
    q: 'Can you work with my existing brand?',
    a: 'Yes. If you have brand guidelines, a logo, or a style direction, we incorporate them precisely. If you don\'t, our design process includes basic brand direction as part of the package.',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'We accept UPI, net banking, debit/credit cards, and wallets — all processed securely through Razorpay. A 50% advance is required to begin; the remaining 50% is due on delivery.',
  },
  {
    q: 'Is the ₹9,999 price really everything included?',
    a: 'Yes. The prices listed are all-inclusive for the described scope. There are no setup fees, no licensing surprises, and no hidden charges. The only additional cost would be domain/hosting, which you purchase directly.',
  },
  {
    q: 'Do you take on unlimited projects?',
    a: 'No — and that\'s intentional. We limit the number of projects we accept each month to ensure every client receives exceptional attention. Check availability before booking.',
  },
];

function renderFaqs() {
  const container = document.getElementById('faqList');
  if (!container) return;
  container.innerHTML = faqs.map(faq => `
    <div class="faq-item">
      <button class="faq-question" onclick="toggleFaq(this)">
        ${faq.q}
        <svg width="18" height="18" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
      </button>
      <div class="faq-answer"><p>${faq.a}</p></div>
    </div>
  `).join('');
}

function copySuccessId() {
  const orderId = document.getElementById('successOrderId').textContent;
  navigator.clipboard.writeText(orderId).then(() => {
    const btn = document.querySelector('[title="Copy Order ID"]');
    if (btn) {
      const originalSvg = btn.innerHTML;
      btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4ade80" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
      setTimeout(() => { btn.innerHTML = originalSvg; }, 2000);
    }
  });
}

const policyTexts = {
  privacy: {
    title: 'Privacy Policy',
    content: `
      <p><strong>Last Updated: June 4, 2026</strong></p>
      <p>Welcome to Koel & Ko. We value your privacy and are committed to protecting your personal data. This Privacy Policy outlines how we collect, store, and utilize the information you share with us during project discovery, checkout, and website launch.</p>
      <p><strong>1. Information Collection</strong><br>We collect details you submit in our brief form (such as name, company name, email address, and project requirements) to evaluate slots and execute your website project. All payments are securely routed via Razorpay; we never store or process your credit/debit card numbers or UPI PINs on our servers.</p>
      <p><strong>2. Information Usage</strong><br>The data collected is strictly used to communicate project updates, deliver drafts, register domains, and configure hosting. We do not sell, lease, or distribute your email address or business brief details to third parties.</p>
      <p><strong>3. Security</strong><br>We use industry-standard SSL encryption across our platforms and store project credentials securely. When linking third-party applications (like analytics or databases) to your site, we enforce secure token handling.</p>
    `
  },
  terms: {
    title: 'Terms & Conditions',
    content: `
      <p><strong>Last Updated: June 4, 2026</strong></p>
      <p>By engaging Koel & Ko ("Studio") for web design and development services, you ("Client") agree to the following terms and conditions:</p>
      <p><strong>1. Scope of Work & Packages</strong><br>We deliver custom website code and visual design as described in your selected plan (Starter, Business, or Premium). Any additional scope, extra revision rounds, logo design, or copywriting outside the package limits is subject to add-on pricing as quoted on our platform.</p>
      <p><strong>2. Payment Terms</strong><br>A secure 50% advance booking payment is required through our payment gateway to reserve your slot and launch requirement review. The remaining 50% payment is due in full upon completion of revision rounds and before the live deployment of site files.</p>
      <p><strong>3. Intellectual Property Rights</strong><br>Upon final payment and delivery, the Client holds absolute ownership of all custom website code, database schemas, and media assets designed specifically for the project. The Studio retains the showcase rights for its portfolio.</p>
    `
  }
};

function openPolicy(type) {
  const modal = document.getElementById('policyModal');
  const title = document.getElementById('policyTitle');
  const content = document.getElementById('policyContent');
  
  if (modal && title && content && policyTexts[type]) {
    title.textContent = policyTexts[type].title;
    content.innerHTML = policyTexts[type].content;
    modal.style.display = 'flex';
    setTimeout(() => { modal.style.opacity = '1'; }, 10);
    document.body.style.overflow = 'hidden';
  }
}

function closePolicy() {
  const modal = document.getElementById('policyModal');
  if (modal) {
    modal.style.opacity = '0';
    setTimeout(() => { modal.style.display = 'none'; }, 300);
    document.body.style.overflow = '';
  }
}

async function sendConfirmationEmail(brief, paymentId) {
  let apiKey = 'e_AzekL8vN_3g5fDYRYJMbCc6Hq4sPLTDcG';
  if (apiKey.startsWith('e_')) {
    apiKey = 'r' + apiKey;
  }
  
  const isFull = brief.paymentOption === 'Full Payment';
  const priceVal = brief.price || 19999;
  const paidVal = isFull ? priceVal : Math.round(priceVal / 2);
  const dueLater = isFull ? 0 : Math.round(priceVal / 2);
  const targetDate = brief.launchDate || '—';
  
  // Safe extraction of fields with fallbacks
  const company = brief.company || '—';
  const industry = brief.industry || '—';
  const businessDesc = brief.businessDesc || '—';
  const productsServices = brief.productsServices || '—';
  const differentiator = brief.differentiator || '—';
  
  const targetAudience = Array.isArray(brief.targetAudience) ? brief.targetAudience.join(', ') : (brief.targetAudience || '—');
  const websiteGoals = Array.isArray(brief.websiteGoals) ? brief.websiteGoals.join(', ') : (brief.websiteGoals || '—');
  const visitorActions = Array.isArray(brief.visitorActions) ? brief.visitorActions.join(', ') : (brief.visitorActions || '—');
  const primaryGoal = brief.primaryGoal || '—';
  
  const hasBranding = brief.hasBranding || '—';
  const hasLogo = brief.hasLogo || '—';
  const colorPrimary = brief.colorPrimary || '#c9a84c';
  const colorSecondary = brief.colorSecondary || '#080f18';
  const colorAccent = brief.colorAccent || '#ffffff';
  const preferredStyle = brief.preferredStyle || '—';
  
  const likedSites = Array.isArray(brief.likedSites) ? brief.likedSites.filter(Boolean).join(', ') : (brief.likedSites || '—');
  const likedSitesReason = brief.likedSitesReason || '—';
  
  const pagesNeeded = Array.isArray(brief.pagesNeeded) ? brief.pagesNeeded.join(', ') : (brief.pagesNeeded || '—');
  const approxPages = brief.approxPages || '—';
  const featuresRequired = Array.isArray(brief.featuresRequired) ? brief.featuresRequired.join(', ') : (brief.featuresRequired || '—');
  const additionalFeatures = brief.additionalFeatures || '—';
  
  const hasContent = brief.hasContent || '—';
  const needsCopywriting = brief.needsCopywriting || '—';
  const hasImages = brief.hasImages || '—';
  const needsStockImages = brief.needsStockImages || '—';
  
  const timeline = brief.timeline || '—';
  const budgetRange = brief.budgetRange || '—';
  const dreamWebsite = brief.dreamWebsite || '—';
  
  const emailHtml = `
    <div style="font-family: 'DM Sans', Arial, sans-serif; background-color: #080f18; color: #f8f9fa; padding: 3rem 2rem; max-width: 600px; margin: 0 auto; border: 1px solid #c9a84c; border-radius: 12px; box-shadow: 0 20px 40px rgba(0,0,0,0.5);">
      <!-- Header -->
      <div style="text-align: center; margin-bottom: 2.5rem; border-bottom: 1px solid rgba(201, 168, 76, 0.2); padding-bottom: 1.5rem;">
        <span style="font-size: 2.2rem; font-style: italic; font-weight: 300; color: #ffffff; font-family: 'Cormorant Garamond', Georgia, serif; letter-spacing: 0.05em;">Koel & Ko</span>
        <div style="font-size: 0.72rem; letter-spacing: 0.2em; text-transform: uppercase; color: #c9a84c; margin-top: 0.5rem; font-weight: 400;">Premium Web Development Studio</div>
      </div>
      
      <!-- Welcome Greeting -->
      <div style="margin-bottom: 2.5rem; text-align: center;">
        <h2 style="font-size: 1.8rem; font-style: italic; font-weight: 300; color: #c9a84c; margin: 0 0 0.8rem; font-family: 'Cormorant Garamond', Georgia, serif;">Welcome to the Ko-Ko Family!</h2>
        <p style="font-size: 0.92rem; color: #8a9bac; margin: 0; line-height: 1.6; font-style: italic;">
          "We are absolutely thrilled to have you as part of our creative circle. 🖤✨ Our team is already gear-shifting to build something extraordinary for you."
        </p>
      </div>

      <!-- Financial / Payment Details -->
      <div style="background-color: rgba(255, 255, 255, 0.02); border: 1px solid rgba(201, 168, 76, 0.15); padding: 1.5rem; border-radius: 8px; margin-bottom: 2rem;">
        <h3 style="font-size: 0.8rem; letter-spacing: 0.1em; text-transform: uppercase; color: #c9a84c; margin: 0 0 1rem 0; font-family: 'DM Sans', sans-serif; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 0.4rem;">Transaction Summary</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 0.88rem; color: #f8f9fa;">
          <tr style="border-bottom: 1px solid rgba(255,255,255,0.03);">
            <td style="padding: 0.6rem 0; color: #8a9bac;">Order ID</td>
            <td style="padding: 0.6rem 0; text-align: right; font-family: monospace; color: #ffffff;">${brief.id || '—'}</td>
          </tr>
          <tr style="border-bottom: 1px solid rgba(255,255,255,0.03);">
            <td style="padding: 0.6rem 0; color: #8a9bac;">Payment Reference</td>
            <td style="padding: 0.6rem 0; text-align: right; font-family: monospace; color: #ffffff;">${paymentId}</td>
          </tr>
          <tr style="border-bottom: 1px solid rgba(255,255,255,0.03);">
            <td style="padding: 0.6rem 0; color: #8a9bac;">Selected Plan</td>
            <td style="padding: 0.6rem 0; text-align: right; font-weight: bold; color: #c9a84c;">${brief.planName || 'Business'} (₹${priceVal.toLocaleString('en-IN')})</td>
          </tr>
          <tr style="border-bottom: 1px solid rgba(255,255,255,0.03);">
            <td style="padding: 0.6rem 0; color: #8a9bac;">Payment Scheme</td>
            <td style="padding: 0.6rem 0; text-align: right; color: #ffffff;">${brief.paymentOption || '50% Advance'}</td>
          </tr>
          <tr style="border-bottom: 1px solid rgba(255,255,255,0.03);">
            <td style="padding: 0.6rem 0; color: #8a9bac; font-weight: bold;">Amount Paid Today</td>
            <td style="padding: 0.6rem 0; text-align: right; font-weight: bold; color: #4ade80;">₹${paidVal.toLocaleString('en-IN')}</td>
          </tr>
          <tr>
            <td style="padding: 0.6rem 0; color: #8a9bac;">Remaining Balance Due</td>
            <td style="padding: 0.6rem 0; text-align: right; color: #ffffff;">₹${dueLater.toLocaleString('en-IN')}</td>
          </tr>
        </table>
      </div>

      <!-- What Happens Next -->
      <div style="border-top: 1px solid rgba(255,255,255,0.08); padding-top: 1.5rem; font-size: 0.88rem; line-height: 1.6; color: #8a9bac; margin-bottom: 2rem;">
        <p style="margin: 0 0 0.5rem 0; font-weight: bold; color: #ffffff; font-size: 0.95rem;">What Happens Next?</p>
        <ol style="margin: 0; padding-left: 1.2rem; line-height: 1.7;">
          <li>Our design leads will analyze your business profile and aesthetic references within 24 hours.</li>
          <li>We will send a video meeting link directly to <strong>${brief.email || 'your email'}</strong> to establish project scope milestones.</li>
          <li>We begin Figma wireframing and custom prototyping immediately after the call.</li>
        </ol>
      </div>
      
      <!-- Footer -->
      <div style="text-align: center; margin-top: 3rem; font-size: 0.75rem; color: #5f758a; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 1.2rem;">
        © 2026 Koel & Ko Studio. Mumbai, India.<br>
        <span style="font-size: 0.65rem; color: #425567; margin-top: 0.3rem; display: block;">This is an automated confirmation of your booking deposit transaction.</span>
      </div>
    </div>
  `;

  // Standard Resend sandbox recipient configuration:
  // Using onboarding@resend.dev requires the recipient to be the verified account owner: adhithya12j@gmail.com
  const senderEmail = 'onboarding@resend.dev';
  const isSandbox = (senderEmail === 'onboarding@resend.dev');
  const recipient = isSandbox ? 'adhithya12j@gmail.com' : brief.email;
  const subjectLine = isSandbox 
    ? `[TEST MODE] Koel & Ko Booking Confirmed for ${brief.name} (${brief.email})`
    : `Koel & Ko Booking Confirmed — Order ID: ${brief.id}`;

  const payload = {
    from: `Koel & Ko <${senderEmail}>`,
    to: [recipient],
    subject: subjectLine,
    html: emailHtml
  };

  const proxyUrl = 'https://corsproxy.io/?' + encodeURIComponent('https://api.resend.com/emails');

  try {
    const response = await fetch(proxyUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('Confirmation email successfully dispatched via Resend:', data);
    } else {
      const errorText = await response.text();
      console.error('Resend email dispatch returned error status:', response.status, errorText);
    }
  } catch (error) {
    console.error('Network error attempting client-side Resend email dispatch:', error);
  }
}

// ── INIT
async function initApp() {
  renderFaqs();
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('status') === 'success') {
    const plan = urlParams.get('plan') || 'Business';
    const name = urlParams.get('name') || 'Client';
    const amount = urlParams.get('amount') || '9,999';
    const email = urlParams.get('email') || 'hello@koelko.in';
    
    const currentSubId = sessionStorage.getItem('koel_current_submission_id');
    const orderId = currentSubId || ('KK-2026-' + String(Math.floor(Math.random() * 90000) + 10000));
    
    const paymentId = urlParams.get('payment_id');
    let reference = '';
    if (paymentId) {
      reference = paymentId;
    } else {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let randRef = '';
      for (let i = 0; i < 8; i++) {
        randRef += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      reference = 'KK-' + randRef;
    }
    
    // Update status and paymentId in localStorage
    let sub = null;
    let briefs = JSON.parse(localStorage.getItem('koel_project_briefs')) || [];
    if (currentSubId) {
      sub = briefs.find(b => b.id === currentSubId);
      if (sub) {
        sub.status = 'Paid';
        sub.paymentId = reference;
        localStorage.setItem('koel_project_briefs', JSON.stringify(briefs));
      }
    }
    
    let emailSent = false;
    
    // Update status in Firestore & add payment record
    if (window.firebaseReady && currentSubId) {
      const { doc, updateDoc, setDoc, getDoc } = window.firestoreSDK;
      try {
        await updateDoc(doc(window.firebaseDB, "orders", currentSubId), {
          status: 'Paid',
          paymentId: reference
        });
        console.log("Order updated in Firestore");
        
        const paymentRecord = {
          orderID: currentSubId,
          status: 'success',
          amountPaid: Math.round(sub ? sub.price / 2 : parseInt(amount.replace(/,/g, ''))),
          customerName: name,
          customerEmail: email,
          paymentId: reference,
          paidAt: new Date().toISOString()
        };
        await setDoc(doc(window.firebaseDB, "payments", currentSubId), paymentRecord);
        console.log("Payment record written to Firestore");

        // Fetch detailed order brief from Firestore to send via Resend
        try {
          const orderSnap = await getDoc(doc(window.firebaseDB, "orders", currentSubId));
          if (orderSnap.exists()) {
            await sendConfirmationEmail(orderSnap.data(), reference);
            emailSent = true;
          } else if (sub) {
            await sendConfirmationEmail(sub, reference);
            emailSent = true;
          }
        } catch (mailErr) {
          console.error("Failed to query order details for confirmation email:", mailErr);
          if (sub) {
            await sendConfirmationEmail(sub, reference);
            emailSent = true;
          }
        }
      } catch (err) {
        console.error("Firestore payment success update failed:", err);
      }
    }
    
    // Fallback: If email has not been sent yet (e.g. Firebase not ready, or Firestore write failed)
    if (!emailSent) {
      console.log("Executing client-side Resend confirmation email dispatch via local brief fallback");
      const fallbackBrief = sub || {
        id: orderId,
        name: name,
        email: email,
        planName: plan,
        price: parseInt(amount.replace(/,/g, '')) * (amount.includes('50%') || amount.includes('Advance') ? 2 : 1),
        paymentOption: amount.includes('Advance') ? '50% Advance' : 'Full Payment',
        company: '—',
        industry: '—',
        preferredStyle: '—',
        dreamWebsite: '—'
      };
      sendConfirmationEmail(fallbackBrief, reference);
    }
    
    const successOrderIdEl = document.getElementById('successOrderId');
    const successReferenceEl = document.getElementById('successReference');
    const successAmountEl = document.getElementById('successAmount');
    const successPackageEl = document.getElementById('successPackage');
    const successWebTypeEl = document.getElementById('successWebType');
    const successDeliveryEl = document.getElementById('successDelivery');
    const confirmedClientNameEl = document.getElementById('confirmedClientName');
    const confirmedEmailEl = document.getElementById('confirmedEmail');

    if (successOrderIdEl) successOrderIdEl.textContent = orderId;
    if (successReferenceEl) successReferenceEl.textContent = reference;
    if (successAmountEl) successAmountEl.textContent = '₹' + parseInt(amount.replace(/,/g, '')).toLocaleString('en-IN');
    if (successPackageEl) successPackageEl.textContent = plan;
    
    const packageDescriptions = {
      Starter: 'Starter Website (up to 5 pages)',
      Business: 'Business Website (10-15 pages)',
      Premium: 'E-Commerce Store (unlimited pages)'
    };
    if (successWebTypeEl) successWebTypeEl.textContent = packageDescriptions[plan] || plan;
    
    const deliveryDays = { Starter: '7-10 days', Business: '10-12 days', Premium: '14-21 days' };
    if (successDeliveryEl) successDeliveryEl.textContent = deliveryDays[plan] || '14 days';
    
    if (confirmedClientNameEl) confirmedClientNameEl.textContent = name;
    if (confirmedEmailEl) confirmedEmailEl.textContent = email;
    
    try {
      window.history.replaceState({}, document.title, window.location.pathname);
    } catch (e) {
      console.warn("Could not clear URL parameters due to browser file:// restrictions", e);
    }
    showPage('success-page');
  } else {
    showPage('home-page');
  }
}

if (window.firebaseReady) {
  initApp();
} else {
  document.addEventListener('firebase-ready', initApp);
}

// Intercept main navbar and mobile menu hash links to work across pages
document.querySelectorAll('#navbar a[href^="#"], #mobileMenu a[href^="#"]').forEach(link => {
  link.addEventListener('click', (e) => {
    const targetId = link.getAttribute('href');
    if (!targetId || targetId === '#') return;
    e.preventDefault();
    showPage('home-page');
    const targetEl = document.querySelector(targetId);
    if (targetEl) {
      setTimeout(() => {
        targetEl.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    }
  });
});

// ── ADMIN PORTAL FUNCTIONS
function openAdminPortal() {
  const modal = document.getElementById('adminModal');
  if (modal) {
    renderAdminPortal();
    modal.style.display = 'flex';
    setTimeout(() => { modal.style.opacity = '1'; }, 10);
    document.body.style.overflow = 'hidden';
  }
}

function closeAdminPortal() {
  const modal = document.getElementById('adminModal');
  if (modal) {
    modal.style.opacity = '0';
    setTimeout(() => { modal.style.display = 'none'; }, 300);
    document.body.style.overflow = '';
  }
}

async function renderAdminPortal() {
  const tableBody = document.getElementById('adminPortalTableBody');
  const emptyState = document.getElementById('adminPortalEmptyState');
  if (!tableBody) return;

  // Show loading indicator
  tableBody.innerHTML = `
    <tr>
      <td colspan="6" style="text-align: center; padding: 3rem; color: var(--gold);">
        <div style="display: inline-block; width: 1.5rem; height: 1.5rem; border: 2px solid currentColor; border-right-color: transparent; border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 0.5rem;"></div>
        <div>Syncing with Firestore...</div>
      </td>
    </tr>
  `;
  if (emptyState) emptyState.style.display = 'none';

  let briefs = [];
  if (window.firebaseReady) {
    try {
      const { collection, getDocs } = window.firestoreSDK;
      const querySnapshot = await getDocs(collection(window.firebaseDB, "orders"));
      querySnapshot.forEach((doc) => {
        briefs.push(doc.data());
      });
      // Sort briefs by id descending (newest first)
      briefs.sort((a, b) => b.id.localeCompare(a.id));
    } catch (error) {
      console.error("Error fetching briefs from Firestore: ", error);
      briefs = JSON.parse(localStorage.getItem('koel_project_briefs')) || [];
      briefs.reverse();
    }
  } else {
    briefs = JSON.parse(localStorage.getItem('koel_project_briefs')) || [];
    briefs.reverse();
  }

  // Calculate metrics
  const totalLeads = briefs.length;
  const paidBookings = briefs.filter(b => b.status === 'Paid').length;
  const totalRevenue = briefs
    .filter(b => b.status === 'Paid')
    .reduce((sum, b) => sum + Math.round(b.price / 2), 0);

  document.getElementById('adminMetricTotalLeads').textContent = totalLeads;
  document.getElementById('adminMetricPaidBookings').textContent = paidBookings;
  document.getElementById('adminMetricRevenue').textContent = '₹' + totalRevenue.toLocaleString('en-IN');

  if (briefs.length === 0) {
    tableBody.innerHTML = '';
    if (emptyState) emptyState.style.display = 'block';
    return;
  }

  if (emptyState) emptyState.style.display = 'none';

  tableBody.innerHTML = briefs.map(brief => {
    const advanceAmount = Math.round(brief.price / 2);
    const statusColor = brief.status === 'Paid' ? '#4ade80' : '#e2c47a';
    const statusBg = brief.status === 'Paid' ? 'rgba(74, 222, 128, 0.1)' : 'rgba(226, 196, 122, 0.1)';
    const statusBorder = brief.status === 'Paid' ? 'rgba(74, 222, 128, 0.3)' : 'rgba(226, 196, 122, 0.3)';

    return `
      <tr style="border-bottom: 1px solid var(--border-subtle); vertical-align: top;">
        <td style="padding: 1.2rem 0.8rem; font-family: 'DM Mono', monospace; font-size: 0.78rem;">
          <div style="color: var(--text-main); font-weight: 500;">${brief.id}</div>
          <div style="color: var(--text-muted); font-size: 0.7rem; margin-top: 0.2rem;">${brief.date}</div>
        </td>
        <td style="padding: 1.2rem 0.8rem;">
          <div style="color: var(--text-main); font-weight: 500;">${brief.name}</div>
          <div style="color: var(--gold); font-size: 0.8rem; margin-top: 0.15rem;">${brief.company}</div>
          <div style="color: var(--text-muted); font-size: 0.78rem; margin-top: 0.15rem; font-family: 'DM Mono', monospace;">${brief.email}</div>
        </td>
        <td style="padding: 1.2rem 0.8rem;">
          <div style="color: var(--text-main); font-weight: 500;">${brief.planName}</div>
          <div style="color: var(--text-muted); font-size: 0.78rem; margin-top: 0.15rem;">Total: ₹${brief.price.toLocaleString('en-IN')}</div>
          <div style="color: var(--gold-light); font-size: 0.78rem; margin-top: 0.15rem;">50% Adv: ₹${advanceAmount.toLocaleString('en-IN')}</div>
        </td>
        <td style="padding: 1.2rem 0.8rem; color: var(--text-soft); line-height: 1.5; font-size: 0.82rem;">
          <div style="max-height: 80px; overflow-y: auto; white-space: pre-wrap;">${brief.description || brief.dreamWebsite || brief.businessDesc || '—'}</div>
        </td>
        <td style="padding: 1.2rem 0.8rem; font-size: 0.72rem; font-weight: bold; letter-spacing: 0.05em; text-transform: uppercase;">
          <span style="display: inline-block; padding: 0.25rem 0.65rem; border: 1px solid ${statusBorder}; border-radius: 4px; background: ${statusBg}; color: ${statusColor};">
            ${brief.status}
          </span>
        </td>
        <td style="padding: 1.2rem 0.8rem; font-family: 'DM Mono', monospace; font-size: 0.78rem; color: var(--text-muted);">
          ${brief.paymentId || '—'}
        </td>
      </tr>
    `;
  }).join('');
}

function clearAdminData() {
  if (confirm("Are you sure you want to clear all locally cached briefs? (Note: Database records will remain intact for security).")) {
    localStorage.removeItem('koel_project_briefs');
    renderAdminPortal();
  }
}

async function exportToCSV() {
  let briefs = [];
  if (window.firebaseReady) {
    try {
      const { collection, getDocs } = window.firestoreSDK;
      const querySnapshot = await getDocs(collection(window.firebaseDB, "orders"));
      querySnapshot.forEach((doc) => {
        briefs.push(doc.data());
      });
      briefs.sort((a, b) => b.id.localeCompare(a.id));
    } catch (error) {
      console.error("Error exporting briefs from Firestore: ", error);
      briefs = JSON.parse(localStorage.getItem('koel_project_briefs')) || [];
    }
  } else {
    briefs = JSON.parse(localStorage.getItem('koel_project_briefs')) || [];
  }

  if (briefs.length === 0) {
    alert("No data available to export.");
    return;
  }

  // Define headers
  const headers = ["Submission ID", "Date", "Client Name", "Company Name", "Email", "Package", "Total Price (INR)", "Advance Paid (INR)", "Description", "Status", "Payment ID"];
  
  // Format rows
  const rows = briefs.map(b => {
    const advancePaid = b.status === 'Paid' ? Math.round(b.price / 2) : 0;
    return [
      b.id,
      b.date,
      b.name,
      b.company,
      b.email,
      b.planName,
      b.price,
      advancePaid,
      b.description || b.dreamWebsite || b.businessDesc || '—',
      b.status,
      b.paymentId
    ].map(val => {
      // Escape double quotes and wrap in quotes to handle commas
      const text = String(val).replace(/"/g, '""');
      return `"${text}"`;
    }).join(',');
  });

  // Combine CSV content
  const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
  
  // Create download link and trigger click
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `koel_project_briefs_${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

revealOnScroll();
animateBars();
animateCounters();
