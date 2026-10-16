/** 岛屿地图渲染 */
(function (global) {
  function renderMap(state, root, onSelect) {
    if (!root) return;
    const chapters = global.QuestData.CHAPTERS;
    const P = global.QuestProgress;

    root.innerHTML = `
      <div class="panel-head">
        <h2>搜索之海 · 岛屿地图</h2>
        <p class="panel-sub">勾选 = 你承认线下这步做完了。通关 Boss 解锁下一座岛。</p>
      </div>
      <div class="map-scroll" role="list">
        ${chapters
          .map((ch, i) => {
            const st = P.chapterStatus(ch.id, state);
            const lockHint =
              st === 'locked'
                ? '需先通关上一岛 Boss'
                : st === 'cleared'
                  ? '已通关'
                  : '可出击';
            return `
            <button type="button" class="island island-${st}" role="listitem"
              data-chapter="${ch.id}" data-status="${st}"
              aria-label="${ch.name}，${lockHint}">
              <span class="island-lock" aria-hidden="true">${
                st === 'locked' ? '🔒' : st === 'cleared' ? '✅' : '⚔️'
              }</span>
              <span class="island-emoji" aria-hidden="true">${ch.emoji}</span>
              <span class="island-name">${ch.name}</span>
              <span class="island-status-text">${
                st === 'locked' ? '锁定' : st === 'cleared' ? '已通关' : '进行中'
              }</span>
              ${i < chapters.length - 1 ? '<span class="island-path" aria-hidden="true">→</span>' : ''}
            </button>`;
          })
          .join('')}
      </div>
      <p class="map-tip" id="map-tip" role="status"></p>`;

    root.querySelectorAll('.island').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-chapter');
        const st = btn.getAttribute('data-status');
        const tip = root.querySelector('#map-tip');
        if (st === 'locked') {
          const ch = global.QuestData.getChapter(id);
          const prev = chapters.find((c) => c.next === id);
          tip.textContent = `「${ch.name}」未解锁。请先击败「${
            prev ? prev.name : '上一岛'
          }」的 Boss。`;
          return;
        }
        tip.textContent = '';
        if (onSelect) onSelect(id);
      });
    });
  }

  global.QuestMap = { renderMap };
})(typeof window !== 'undefined' ? window : globalThis);
