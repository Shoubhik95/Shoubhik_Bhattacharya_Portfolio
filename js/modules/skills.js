
// --- Dynamic Skills Rendering Module ---
window.initSkillsModule = function() {
  const renderSkills = () => {
    const skillsGrid = document.querySelector(".skills-grid-new");
    if (!skillsGrid) return;

    skillsGrid.innerHTML = skillsData.map(group => {
      return `
        <div class="skill-cyber-card" style="--theme-color: ${group.themeColor}; --theme-rgb: ${group.themeRgb};">
          <div class="skill-card-header-new">
            <h4 class="skill-card-title-new">${group.category}</h4>
          </div>
          <ul class="skill-items-list-new">
            ${group.skills.map(skill => {
              // Generate dots (out of 4)
              let dotsHtml = "";
              for (let i = 1; i <= 4; i++) {
                const activeClass = i <= skill.rating ? "active" : "";
                dotsHtml += `<span class="rating-dot ${activeClass}"></span>`;
              }
              return `
                <li class="skill-item-row-new">
                  <span class="skill-item-name-new">${skill.name}</span>
                  <div class="dots-rating-bar">
                    ${dotsHtml}
                  </div>
                </li>
              `;
            }).join('')}
          </ul>
        </div>
      `;
    }).join('');
  };

  renderSkills();
};
