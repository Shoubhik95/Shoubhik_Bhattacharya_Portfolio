/**
 * Mock Backend Service - Firebase Auth & Realtime Database Integration
 * Intercepts all '/api/' fetch requests and routes them to your Google Firebase project 'portfolio-a6e43'.
 */
(() => {
  const OWNER_EMAIL = "shoubhikbhattacharya06@gmail.com";

  // Ensure Firebase Anonymous Sign-In on startup for visitors
  function ensureFirebaseConnected() {
    if (typeof firebase !== 'undefined' && firebase.apps.length > 0) {
      const auth = firebase.auth();
      // Only sign in anonymously if there is no user logged in
      if (!auth.currentUser) {
        auth.signInAnonymously().catch(err => {
          console.warn("Firebase anonymous auth failed:", err);
        });
      }
      return firebase.database();
    }
    return null;
  }

  // Initialize DB connection
  const dbRef = () => {
    const db = ensureFirebaseConnected();
    if (!db) {
      throw new Error("Firebase not initialized. Check your firebase-config.js file.");
    }
    return db.ref();
  };

  // Helper to fetch data once from Firebase
  async function dbGet(path, defaultValue = null) {
    const snapshot = await dbRef().child(path).once('value');
    const val = snapshot.val();
    return val !== null ? val : defaultValue;
  }

  // Helper to write data to Firebase
  async function dbSet(path, value) {
    await dbRef().child(path).set(value);
  }

  // Run initialization after DOM loads
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ensureFirebaseConnected);
  } else {
    ensureFirebaseConnected();
  }

  // Intercept window.fetch
  const originalFetch = window.fetch;
  window.fetch = async function(resource, options) {
    let url = typeof resource === 'string' ? resource : (resource && resource.url ? resource.url : '');
    
    if (url.startsWith('/api/')) {
      const method = (options && options.method ? options.method.toUpperCase() : 'GET');
      const body = (options && options.body ? JSON.parse(options.body) : {});

      const jsonResponse = (data, status = 200) => {
        return new Response(JSON.stringify(data), {
          status: status,
          headers: { 'Content-Type': 'application/json' }
        });
      };

      const checkAuth = () => {
        return sessionStorage.getItem('portfolio_admin_authenticated') === 'true';
      };

      try {
        ensureFirebaseConnected();

        // --- 1. Lockout State ---
        if (url === '/api/lockout-state' && method === 'GET') {
          const lockoutActive = await dbGet('security/lockoutActive', false);
          return jsonResponse({ lockoutActive });
        }

        // --- 2. Verify Passcode (via Firebase Auth Email/Password) ---
        if (url === '/api/verify-passcode' && method === 'POST') {
          const { code } = body;

          try {
            // Run lockout check and Firebase Auth sign-in concurrently to eliminate sequential delay
            const [lockoutActive, authUser] = await Promise.all([
              dbGet('security/lockoutActive', false),
              firebase.auth().signInWithEmailAndPassword(OWNER_EMAIL, code)
            ]);

            if (lockoutActive) {
              // If account is locked out, sign out and reject
              await firebase.auth().signOut();
              return jsonResponse({ success: false, message: 'SECURITY LOCKOUT ACTIVE' }, 403);
            }
            
            // Authentication succeeded (fire-and-forget to avoid blocking response)
            dbSet('security/failedAttempts', 0);
            sessionStorage.setItem('portfolio_admin_authenticated', 'true');
            return jsonResponse({ success: true, message: 'Access Granted' });
          } catch (authError) {
            // Authentication failed or locked out
            const failedAttempts = (await dbGet('security/failedAttempts', 0)) + 1;
            let lockoutTriggered = false;
            let isLockout = false;
            
            if (failedAttempts >= 3) {
              isLockout = true;
              lockoutTriggered = true;
            }
            
            await Promise.all([
              dbSet('security/failedAttempts', failedAttempts),
              dbSet('security/lockoutActive', isLockout)
            ]);
            
            return jsonResponse({
              success: false,
              failedAttempts,
              lockoutActive: isLockout,
              lockoutTriggered,
              remainingAttempts: Math.max(0, 3 - failedAttempts),
              message: authError.message
            });
          }
        }

        // --- 3. Verify Session ---
        if (url === '/api/verify-session' && method === 'GET') {
          const authenticated = checkAuth();
          return jsonResponse({ authenticated });
        }

        // --- 4. Logout ---
        if (url === '/api/logout' && method === 'POST') {
          sessionStorage.removeItem('portfolio_admin_authenticated');
          await firebase.auth().signOut();
          // Sign back in anonymously as visitor in background
          ensureFirebaseConnected();
          return jsonResponse({ success: true });
        }

        // --- 5. Forgot Password (Send Firebase Auth Reset Email) ---
        if (url === '/api/forgot-password' && method === 'POST') {
          await firebase.auth().sendPasswordResetEmail(OWNER_EMAIL);
          
          // Reset lockout state when a reset email is triggered
          await dbSet('security/lockoutActive', false);
          await dbSet('security/failedAttempts', 0);
          
          return jsonResponse({ success: true, message: 'Official Firebase reset email sent successfully.' });
        }

        // --- 6. Add Hiring Lead ---
        if (url === '/api/hiring-lead' && method === 'POST') {
          const { name, email, companyLink } = body;
          if (!name || name.trim() === '') {
            return jsonResponse({ error: 'Name is required' }, 400);
          }

          const lead = {
            name: name.trim(),
            email: (email || '').trim(),
            companyLink: (companyLink || '').trim(),
            timestamp: new Date().toLocaleString()
          };

          await dbRef().child('hiringLeads').push(lead);
          
          return jsonResponse({ success: true, lead });
        }

        // --- 7. Get Hiring Leads (Protected) ---
        if (url === '/api/hiring-leads' && method === 'GET') {
          if (!checkAuth()) {
            return jsonResponse({ success: false, message: 'UNAUTHORIZED' }, 401);
          }
          const rawLeads = await dbGet('hiringLeads', {});
          const leads = Object.entries(rawLeads || {})
            .reverse()
            .map(([key, val]) => ({ key, ...val }));
          return jsonResponse(leads);
        }

        // --- 8. Delete Hiring Lead (Protected) ---
        if (url.startsWith('/api/hiring-lead/') && method === 'DELETE') {
          if (!checkAuth()) {
            return jsonResponse({ success: false, message: 'UNAUTHORIZED' }, 401);
          }
          const parts = url.split('/');
          const index = parseInt(parts[parts.length - 1]);
          const rawLeads = await dbGet('hiringLeads', {});
          const leads = Object.entries(rawLeads || {})
            .reverse()
            .map(([key, val]) => ({ key, ...val }));
          
          const leadToDelete = leads[index];
          if (leadToDelete) {
            await dbRef().child(`hiringLeads/${leadToDelete.key}`).remove();
            return jsonResponse({ success: true, removed: leadToDelete });
          }
          return jsonResponse({ error: 'Lead index not found' }, 404);
        }

        // --- 9. Telemetry Event ---
        if (url === '/api/telemetry/event' && method === 'POST') {
          const { message, type } = body;
          const time = new Date().toLocaleTimeString();

          await dbRef().child('activityLogs').push({ time, message, type });

          const todayStr = new Date().toISOString().split('T')[0];
          await dbRef().child(`historicalTelemetry/${todayStr}/actions`).set(firebase.database.ServerValue.increment(1));
          
          return jsonResponse({ success: true });
        }

        // --- 10. Telemetry Session Visit ---
        if (url === '/api/telemetry/session' && method === 'POST') {
          const { source, deviceData } = body;
          const todayStr = new Date().toISOString().split('T')[0];

          let sourceField = 'refer';
          if (source === 'direct') sourceField = 'direct';
          else if (source === 'github') sourceField = 'github';
          else if (source === 'netlify') sourceField = 'netlify';
          else if (source === 'search') sourceField = 'search';

          await dbRef().child(`historicalTelemetry/${todayStr}/${sourceField}`).set(firebase.database.ServerValue.increment(1));
          await dbRef().child(`historicalTelemetry/${todayStr}/actions`).set(firebase.database.ServerValue.increment(1));

          if (deviceData) {
            const cleanIp = (deviceData.ip || "unknown").replace(/[\.\#\$\/\[\]]/g, "_");
            const cleanBrowser = (deviceData.browser || "unknown").replace(/[\.\#\$\/\[\]]/g, "_");
            const cleanOs = (deviceData.os || "unknown").replace(/[\.\#\$\/\[\]]/g, "_");
            const sessionKey = `${cleanIp}_${cleanBrowser}_${cleanOs}_${todayStr}`;

            const newSession = {
              ...deviceData,
              timestamp: new Date().toLocaleString()
            };
            await dbSet(`visitorSessions/${sessionKey}`, newSession);
            return jsonResponse({ success: true, sessionKey });
          }
          
          return jsonResponse({ success: true });
        }

        // --- 10.2. Telemetry GitHub Click Event ---
        if (url === '/api/telemetry/github-click' && method === 'POST') {
          const todayStr = new Date().toISOString().split('T')[0];
          await dbRef().child(`historicalTelemetry/${todayStr}/github`).set(firebase.database.ServerValue.increment(1));
          await dbRef().child(`historicalTelemetry/${todayStr}/actions`).set(firebase.database.ServerValue.increment(1));
          return jsonResponse({ success: true });
        }

        // --- 10.3. Telemetry Netlify Click Event ---
        if (url === '/api/telemetry/netlify-click' && method === 'POST') {
          const todayStr = new Date().toISOString().split('T')[0];
          await dbRef().child(`historicalTelemetry/${todayStr}/netlify`).set(firebase.database.ServerValue.increment(1));
          await dbRef().child(`historicalTelemetry/${todayStr}/actions`).set(firebase.database.ServerValue.increment(1));
          return jsonResponse({ success: true });
        }

        // --- 10.5. Telemetry Share Event ---
        if (url === '/api/telemetry/share' && method === 'POST') {
          await dbRef().child('telemetry/sharesCount').set(firebase.database.ServerValue.increment(1));
          
          const time = new Date().toLocaleTimeString();
          await dbRef().child('activityLogs').push({ time, message: "Visitor shared portfolio link", type: "highlight" });

          return jsonResponse({ success: true });
        }

        // --- 10.6. Telemetry Engagement Metrics ---
        // --- 10.6. Telemetry Engagement Metrics ---
        if (url === '/api/telemetry/engagement' && method === 'POST') {
          const { durations, clicks, projectClicks, sessionKey, metrics } = body;
          const todayStr = new Date().toISOString().split('T')[0];
          
          const metricsPath = `historicalTelemetry/${todayStr}/sectionMetrics`;

          if (durations) {
            for (const key in durations) {
              if (durations[key] > 0) {
                await dbRef().child(`${metricsPath}/durations/${key}`).set(firebase.database.ServerValue.increment(durations[key]));
              }
            }
          }

          if (clicks) {
            for (const key in clicks) {
              if (clicks[key] > 0) {
                await dbRef().child(`${metricsPath}/clicks/${key}`).set(firebase.database.ServerValue.increment(clicks[key]));
              }
            }
          }

          if (projectClicks) {
            for (const key in projectClicks) {
              if (projectClicks[key] > 0) {
                await dbRef().child(`${metricsPath}/projectClicks/${key}`).set(firebase.database.ServerValue.increment(projectClicks[key]));
              }
            }
          }

          if (sessionKey && metrics) {
            await dbRef().child(`visitorSessions/${sessionKey}/metrics`).set(metrics);
          }

          return jsonResponse({ success: true });
        }

        // --- 8.5. Delete Visitor Session (Protected) ---
        if (url.startsWith('/api/visitor-session/') && method === 'DELETE') {
          if (!checkAuth()) {
            return jsonResponse({ success: false, message: 'UNAUTHORIZED' }, 401);
          }
          const parts = url.split('/');
          const sessionKey = parts[parts.length - 1];
          if (sessionKey) {
            await dbRef().child(`visitorSessions/${sessionKey}`).remove();
            return jsonResponse({ success: true });
          }
          return jsonResponse({ error: 'Session key not found' }, 400);
        }
        // --- 11. Telemetry Stats (Protected) ---
        if (url === '/api/telemetry/stats' && method === 'GET') {
          if (!checkAuth()) {
            return jsonResponse({ success: false, message: 'UNAUTHORIZED' }, 401);
          }
          const [rawLogs, historicalTelemetry, lockoutActive, rawSessions, sharesCount] = await Promise.all([
            dbGet('activityLogs', {}),
            dbGet('historicalTelemetry', {}),
            dbGet('security/lockoutActive', false),
            dbGet('visitorSessions', {}),
            dbGet('telemetry/sharesCount', 0)
          ]);
          
          const activityLogs = Object.values(rawLogs || {}).reverse().slice(0, 100);
          const visitorSessions = Object.entries(rawSessions || {})
            .map(([key, val]) => ({ key, ...val }))
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, 50);

          return jsonResponse({
            activityLogs,
            historicalTelemetry,
            lockoutActive,
            visitorSessions,
            sharesCount
          });
        }

        // --- 12. Reset Database (Protected) ---
        if (url === '/api/reset-database' && method === 'POST') {
          if (!checkAuth()) {
            return jsonResponse({ success: false, message: 'UNAUTHORIZED' }, 401);
          }
          await Promise.all([
            dbRef().child('activityLogs').remove(),
            dbRef().child('visitorSessions').remove(),
            dbRef().child('hiringLeads').remove(),
            dbRef().child('historicalTelemetry').remove(),
            dbRef().child('telemetry/sharesCount').set(0),
            dbRef().child('security/failedAttempts').set(0),
            dbRef().child('security/lockoutActive').set(false)
          ]);
          return jsonResponse({ success: true });
        }

      } catch (err) {
        console.error('Firebase DB API failure:', err);
        return jsonResponse({ error: err.message }, 500);
      }
    }

    return originalFetch.apply(this, arguments);
  };
})();
