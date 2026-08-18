
window.initDashboardModule = function() {
    // --- Owner Security Dashboard Link Redirect ---
  const ownerSecretBtn = document.getElementById("owner-secret-btn");
  if (ownerSecretBtn) {
    ownerSecretBtn.addEventListener("click", () => {
      window.location.href = "security.html";
    });
  }

  // --- Hiring Leads UI Updates ---
  window.updateDashboardHiringUI = () => {
    const listContainer = document.getElementById("dash-hire-list");
    const countEl = document.getElementById("dash-hire-count");
    if (!listContainer || !countEl || !window.Telemetry) return;

    const leads = window.Telemetry.state.hiringLeads || [];
    countEl.textContent = leads.length;

    if (leads.length === 0) {
      listContainer.innerHTML = `<div style="font-style:italic; color:#94a3b8; padding:8px 0; text-align:center;">No leads registered.</div>`;
    } else {
      listContainer.innerHTML = leads.map((lead, idx) => `
        <div style="background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.05); border-radius:6px; padding:6px 8px; display:flex; justify-content:space-between; align-items:center; gap:6px;">
          <div style="display:flex; flex-direction:column; gap:2px; max-width:85%;">
            <div style="font-weight:bold; color:#22c55e; word-break:break-all;">${lead.name}</div>
            ${lead.email ? `<div style="font-size:9px; color:#38bdf8; word-break:break-all;">✉️ ${lead.email}</div>` : ''}
            ${lead.message ? `<div style="font-size:9px; color:#cbd5e1; word-break:break-all; background:rgba(0,0,0,0.15); padding:4px 6px; border-radius:4px; margin-top:2px; border-left:2px solid #22c55e;">💬 ${lead.message}</div>` : ''}
            <div style="font-size:8px; color:#94a3b8;">${lead.timestamp}</div>
          </div>
          <button onclick="window.Telemetry.deleteHiringLead(${idx})" style="background:transparent; border:none; color:#ef4444; font-size:11px; cursor:pointer; padding:4px;" title="Delete Lead">🗑️</button>
        </div>
      `).join("");
    }
  };

  setInterval(() => {
    const ownerDashboardModal = document.getElementById("owner-dashboard-modal");
    if (ownerDashboardModal && !ownerDashboardModal.classList.contains("hidden")) {
      if (typeof refreshDashboardTelemetry === "function") {
        refreshDashboardTelemetry();
      }
      const timeFilter = document.getElementById("graph-time-filter");
      if (timeFilter && timeFilter.value === "live") {
        if (typeof updateTrafficChart === "function") {
          updateTrafficChart("live");
        }
      }
    }
  }, 1000);

};
