/** Toast / Boss 过场 / 确认框 */
(function (global) {
  function ensureRoots() {
    let toast = document.getElementById('toast-root');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'toast-root';
      toast.className = 'toast-root';
      document.body.appendChild(toast);
    }
    let modal = document.getElementById('modal-root');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'modal-root';
      modal.className = 'modal-root';
      modal.hidden = true;
      document.body.appendChild(modal);
    }
    return { toast, modal };
  }

  function showToast(text, ms) {
    const { toast } = ensureRoots();
    const el = document.createElement('div');
    el.className = 'toast';
    el.textContent = text;
    toast.appendChild(el);
    setTimeout(() => {
      el.classList.add('toast-out');
      setTimeout(() => el.remove(), 280);
    }, ms || 2200);
  }

  function showBossVictory(chapter, reduceMotion, onDone) {
    const { modal } = ensureRoots();
    modal.hidden = false;
    modal.innerHTML = `
      <div class="modal-backdrop" data-skip="1"></div>
      <div class="modal-card boss-card" role="dialog" aria-modal="true" aria-label="通关">
        <div class="boss-emoji">${chapter.emoji || '🎉'}</div>
        <h2 class="boss-title">通关！</h2>
        <p class="boss-text">${chapter.victory || '胜利'}</p>
        <p class="boss-sub">${chapter.name} 已征服</p>
        <button type="button" class="btn btn-gold" data-skip="1">继续航行</button>
        <p class="hint">点击任意处或按 Esc 跳过</p>
      </div>`;

    let closed = false;
    const finish = () => {
      if (closed) return;
      closed = true;
      modal.hidden = true;
      modal.innerHTML = '';
      document.removeEventListener('keydown', onKey);
      if (onDone) onDone();
    };

    const onKey = (e) => {
      if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        finish();
      }
    };
    document.addEventListener('keydown', onKey);
    modal.onclick = (e) => {
      if (e.target.closest('[data-skip]')) finish();
    };

    if (reduceMotion) {
      setTimeout(finish, 400);
    } else {
      setTimeout(finish, 1500);
    }
  }

  function confirmReset(onConfirm) {
    const { modal } = ensureRoots();
    modal.hidden = false;
    modal.innerHTML = `
      <div class="modal-backdrop" data-cancel="1"></div>
      <div class="modal-card" role="dialog" aria-modal="true" aria-label="重置存档">
        <h2>重置存档？</h2>
        <p>将清空 XP、任务勾选、成就与每周补给领取记录。此操作不可恢复。</p>
        <p>请输入「<strong>重置</strong>」确认：</p>
        <input type="text" id="reset-input" class="input" autocomplete="off" aria-label="输入重置" />
        <div class="modal-actions">
          <button type="button" class="btn" data-cancel="1">取消</button>
          <button type="button" class="btn btn-danger" id="reset-ok" disabled>确认重置</button>
        </div>
      </div>`;

    const input = modal.querySelector('#reset-input');
    const ok = modal.querySelector('#reset-ok');
    const close = () => {
      modal.hidden = true;
      modal.innerHTML = '';
    };
    input.addEventListener('input', () => {
      ok.disabled = input.value.trim() !== '重置';
    });
    ok.addEventListener('click', () => {
      if (input.value.trim() === '重置') {
        close();
        onConfirm();
      }
    });
    modal.onclick = (e) => {
      if (e.target.closest('[data-cancel]')) close();
    };
    setTimeout(() => input.focus(), 50);
  }

  global.QuestModal = {
    showToast,
    showBossVictory,
    confirmReset,
    ensureRoots,
  };
})(typeof window !== 'undefined' ? window : globalThis);
