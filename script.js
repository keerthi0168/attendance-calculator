// Main calculation function
function calculate() {
    // Get input values
    let total = parseInt(document.getElementById("total").value, 10);
    let attended = parseInt(document.getElementById("attended").value, 10);
    let remaining = parseInt(document.getElementById("remaining").value, 10);

    // Validate inputs
    if (!isValidInput(total, attended, remaining)) {
        displayError("❌ Please enter valid values:<br>• Total classes must be greater than 0<br>• Attended classes cannot exceed total classes<br>• All values must be positive numbers");
        return;
    }

    // Calculate current attendance percentage
    let currentPercent = ((attended / total) * 100).toFixed(2);

    // Calculate final attendance if all remaining classes are attended
    let finalTotal = total + remaining;
    let finalAttended = attended + remaining;
    let finalPercent = ((finalAttended / finalTotal) * 100).toFixed(2);
    let finalPercentValue = Number(finalPercent);

    // Calculate required classes to reach 75% attendance
    let requiredToPass = Math.max(0, Math.ceil(0.75 * finalTotal - attended));

    // Display results
    displayResults(currentPercent, finalPercent, finalPercentValue, finalAttended, finalTotal, requiredToPass, remaining);
}

// Validate user inputs
function isValidInput(total, attended, remaining) {
    // Check if all values are numbers
    if (isNaN(total) || isNaN(attended) || isNaN(remaining)) {
        return false;
    }

    // Check if values are positive or zero
    if (total <= 0 || attended < 0 || remaining < 0) {
        return false;
    }

    // Check if attended classes don't exceed total classes
    if (attended > total) {
        return false;
    }

    return true;
}

// Display error message
function displayError(message) {
    let resultDiv = document.getElementById("result");
    resultDiv.className = "result-container error";
    resultDiv.innerHTML = `<div class="result-content">${message}</div>`;
}

// Display results
function displayResults(currentPercent, finalPercent, finalPercentValue, finalAttended, finalTotal, requiredToPass, remaining) {
    let resultDiv = document.getElementById("result");

    let resultHTML = `
        <div class="result-content">
            <div class="result-stat">
                <span class="stat-label">Current Attendance:</span>
                <span class="stat-value">${currentPercent}%</span>
            </div>
            <div class="result-stat">
                <span class="stat-label">Final Attendance (if all remaining attended):</span>
                <span class="stat-value">${finalPercent}%</span>
            </div>
            <div class="result-stat">
                <span class="stat-label">Total Classes After Remaining:</span>
                <span class="stat-value">${finalTotal}</span>
            </div>
    `;

    // Check if 75% attendance is achievable
    if (finalPercentValue >= 75) {
        resultDiv.className = "result-container success";
        resultHTML += `
            <div class="success-message">
                ✅ Great! You can reach 75% attendance!
            </div>
        `;
    } else {
        resultDiv.className = "result-container warning";

        if (requiredToPass > remaining) {
            resultHTML += `
                <div class="warning-message">
                    ⚠️ Even if you attend all <strong>${remaining}</strong> remaining classes, you'll only reach <strong>${finalPercent}%</strong>.<br>
                    <br>
                    Reaching <strong>75%</strong> is not possible with the remaining classes.
                </div>
            `;
        } else {
            resultHTML += `
                <div class="warning-message">
                    ⚠️ You are currently below the 75% target.<br>
                    <br>
                    <strong>To reach 75%:</strong><br>
                    You need to attend at least <strong>${requiredToPass}</strong> out of <strong>${remaining}</strong> remaining classes.
                </div>
            `;
        }
    }

    resultHTML += `</div>`;
    resultDiv.innerHTML = resultHTML;
    saveToLocalStorage();
}

// Save form inputs to localStorage
function saveToLocalStorage() {
    const data = {
        total: document.getElementById("total").value,
        attended: document.getElementById("attended").value,
        remaining: document.getElementById("remaining").value
    };
    localStorage.setItem('attendanceData', JSON.stringify(data));
}

// Load data from localStorage on page load
function loadFromLocalStorage() {
    const saved = localStorage.getItem('attendanceData');
    if (saved) {
        const data = JSON.parse(saved);
        document.getElementById("total").value = data.total || '';
        document.getElementById("attended").value = data.attended || '';
        document.getElementById("remaining").value = data.remaining || '';
    }
}

// Show onboarding on first visit
function showOnboardingIfNeeded() {
    if (!localStorage.getItem('hasVisited')) {
        document.getElementById('onboardingModal').style.display = 'flex';
        localStorage.setItem('hasVisited', 'true');
    } else {
        document.getElementById('onboardingModal').style.display = 'none';
    }
}

// Close onboarding modal
function closeOnboarding() {
    document.getElementById('onboardingModal').style.display = 'none';
}

// Share app using native share API
function shareApp() {
    if (navigator.share) {
        navigator.share({
            title: 'Smart Attendance Calculator',
            text: 'Calculate your attendance % in seconds! Know exactly how many classes you need to attend.',
            url: window.location.href
        }).catch(err => console.log('Share error:', err));
    } else {
        // Fallback for browsers without share API
        alert('Share this app: ' + window.location.href);
    }
}

// Auto-save on input change
document.addEventListener('DOMContentLoaded', () => {
    loadFromLocalStorage();
    showOnboardingIfNeeded();
    document.getElementById("total").addEventListener('input', saveToLocalStorage);
    document.getElementById("attended").addEventListener('input', saveToLocalStorage);
    document.getElementById("remaining").addEventListener('input', saveToLocalStorage);

    ["total", "attended", "remaining"].forEach(id => {
        const el = document.getElementById(id);
        el.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                calculate();
            }
        });
    });

    // Show banner ad placeholder on load if applicable
    showBannerAd();
});

// Register service worker for offline/PWA support
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        let refreshing = false;

        const currentController = navigator.serviceWorker.controller;
        if (currentController && !currentController.scriptURL.includes('service-worker.js?v=4')) {
            navigator.serviceWorker.getRegistrations()
                .then(registrations => Promise.all(registrations.map(reg => reg.unregister())))
                .then(() => window.location.reload())
                .catch(err => console.warn('Failed to clear stale service workers:', err));
            return;
        }

        navigator.serviceWorker.register('./service-worker.js?v=4')
            .then(reg => {
                console.log('Service worker registered.', reg);

                if (reg.waiting) {
                    reg.waiting.postMessage({ type: 'SKIP_WAITING' });
                }

                reg.addEventListener('updatefound', () => {
                    const newWorker = reg.installing;
                    if (!newWorker) return;

                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            newWorker.postMessage({ type: 'SKIP_WAITING' });
                        }
                    });
                });

                navigator.serviceWorker.addEventListener('controllerchange', () => {
                    if (refreshing) return;
                    refreshing = true;
                    window.location.reload();
                });

                reg.update();
            })
            .catch(err => console.warn('Service worker registration failed:', err));
    });
}

// --- Capacitor / Native helpers & Ad/IAP placeholders ---
// Detect if running inside Capacitor native container
const isNative = !!(window.Capacitor && (window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform()));

// Initialize ad SDK (placeholder) - call after app ready in native
function initAds() {
    if (!isNative) {
        console.log('initAds: running on web — no native ads');
        return;
    }
    // TODO: When wrapped with Capacitor and an AdMob plugin is installed,
    // initialize the plugin here (example using AdMob Plus or other plugin).
    // Example (pseudocode):
    // const { AdMob } = window.Capacitor.Plugins;
    // await AdMob.start({ appId: 'ca-app-pub-xxxx~yyyy' });
}

// Show banner ad (placeholder)
function showBannerAd() {
    // Check if user removed ads
    const hide = localStorage.getItem('hideAds');
    if (hide === 'true') {
        hideBannerAd();
        return;
    }

    const adEl = document.getElementById('adBanner');
    if (!adEl) return;

    if (!isNative) {
        // Web fallback: show a visible placeholder banner
        adEl.innerText = 'Advertisement — upgrade to remove ads';
        adEl.style.display = 'block';
        return;
    }

    // Native: call actual ad plugin (TODO)
    // Example pseudocode: AdMob.banner.show({ id: 'ca-app-pub-xxx/yyy', position: 'bottom' })
}

function hideBannerAd() {
    const adEl = document.getElementById('adBanner');
    if (!adEl) return;
    adEl.style.display = 'none';
}

// Show interstitial ad (placeholder)
function showInterstitialAd() {
    if (!isNative) {
        console.log('showInterstitialAd: web placeholder — no ad shown');
        return;
    }
    // TODO: preload and show interstitial via native plugin
}

// Purchase 'remove ads' (placeholder)
function purchaseRemoveAds() {
    // Web fallback: allow removing ads locally by saving preference
    if (!isNative) {
        const ok = confirm('Remove ads for this browser? This will save your choice locally.');
        if (ok) {
            localStorage.setItem('hideAds', 'true');
            hideBannerAd();
            alert('Ads removed for this browser.');
        }
        return;
    }

    // Native: call IAP plugin here (cordova-plugin-purchase or native billing plugin)
}

// Expose a simple API: try to init ads on load
document.addEventListener('deviceready', () => {
    initAds();
});

// If running inside Capacitor, also try init after DOM load
document.addEventListener('DOMContentLoaded', () => {
    if (isNative) initAds();
});