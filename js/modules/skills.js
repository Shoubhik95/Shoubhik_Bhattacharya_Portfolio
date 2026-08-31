// --- Dynamic Rich Skills Rendering Module ---
window.initSkillsModule = function () {
  const renderSkills = () => {
    const skillsGrid = document.querySelector(".skills-grid-new");
    if (!skillsGrid) return;

    skillsGrid.innerHTML = skillsData.map(group => {
      return `
        <div class="skill-cyber-card" style="--theme-color: ${group.themeColor}; --theme-rgb: ${group.themeRgb};">
          <!-- Card Glow Bar -->
          <div class="skill-card-glow-bar"></div>

          <!-- Card Header -->
          <div class="skill-card-top">
            <div class="skill-icon-badge">${group.icon}</div>
            <h4 class="skill-card-title-new">${group.category}</h4>
          </div>

          <!-- Sub-Skills List -->
          <div class="skill-items-list-new">
            ${group.skills.map(skill => `
              <div class="skill-item-card">
                <span class="skill-item-name">${skill.name}</span>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }).join('');
  };

  renderSkills();
};
