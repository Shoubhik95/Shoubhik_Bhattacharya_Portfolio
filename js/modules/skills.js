
// --- Dynamic Skills Rendering Module ---
window.initSkillsModule = function() {
  const renderSkills = () => {
    const gridGame = document.getElementById("skills-grid-game");
    const gridProgramming = document.getElementById("skills-grid-programming");
    const gridWeb = document.getElementById("skills-grid-web");

    const renderGroup = (container, groupName) => {
      if (!container) return;
      const filtered = skillsData.filter(skill => skill.group === groupName);
      container.innerHTML = filtered.map(skill => `
        <div class="skill-card-flat"
          style="--skill-color-from: ${skill.style.from}; --skill-color-to: ${skill.style.to}; --skill-border: ${skill.style.border}; --skill-text: ${skill.style.text};">
          <div class="skill-card-header">
            <h4 class="skill-name">${skill.name}</h4>
          </div>
          <ul class="subskills-list">
            ${skill.subskills.map(sub => `<li><span class="bullet ${skill.bulletClass}"></span>${sub}</li>`).join('')}
          </ul>
        </div>
      `).join('');
    };

    renderGroup(gridGame, "game-design");
    renderGroup(gridProgramming, "programming");
    renderGroup(gridWeb, "web");
  };

  renderSkills();
};
