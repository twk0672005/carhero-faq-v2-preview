const faqApp = document.querySelector('[data-faq-app]');

if (faqApp) {
  document.documentElement.classList.add('faq-enhanced');

  const tabs = Array.from(faqApp.querySelectorAll('[data-faq-tab]'));
  const panels = Array.from(faqApp.querySelectorAll('[data-faq-panel]'));
  const search = faqApp.querySelector('[data-faq-search]');
  const clearButton = faqApp.querySelector('[data-faq-clear]');
  const status = faqApp.querySelector('[data-faq-status]');
  let activeCategory = tabs.find((tab) => tab.getAttribute('aria-selected') === 'true')?.dataset.faqTab || 'tyre';

  const normalize = (value) => value.toLocaleLowerCase('zh-Hant-HK').replace(/\s+/g, ' ').trim();
  const getActivePanel = () => panels.find((panel) => panel.dataset.faqPanel === activeCategory);

  function enforceSingleOpen(panel) {
    panel.querySelectorAll('[data-faq-item]').forEach((item) => {
      item.addEventListener('toggle', () => {
        if (!item.open) return;
        panel.querySelectorAll('[data-faq-item][open]').forEach((other) => {
          if (other !== item) other.open = false;
        });
      });
    });
  }

  function filterActivePanel() {
    const panel = getActivePanel();
    if (!panel) return;

    const query = normalize(search?.value || '');
    const items = Array.from(panel.querySelectorAll('[data-faq-item]'));
    const matching = items.filter((item) => normalize(item.textContent).includes(query));

    items.forEach((item) => {
      item.hidden = !matching.includes(item);
    });

    if (query && matching.length === 1) {
      items.forEach((item) => { item.open = item === matching[0]; });
    }

    const selectedTab = tabs.find((tab) => tab.dataset.faqTab === activeCategory);
    const categoryName = selectedTab?.querySelector('span')?.textContent.trim() || '';
    const empty = panel.querySelector('[data-faq-empty]');
    if (empty) empty.hidden = matching.length !== 0;
    if (clearButton) clearButton.hidden = !query;
    if (status) {
      status.textContent = query
        ? `「${query}」在「${categoryName}」找到 ${matching.length} 條問題`
        : `顯示「${categoryName}」${matching.length} 條問題`;
    }
  }

  function activateCategory(category, moveFocus = false) {
    activeCategory = category;

    tabs.forEach((tab) => {
      const selected = tab.dataset.faqTab === category;
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
      if (selected && moveFocus) tab.focus();
    });

    panels.forEach((panel) => {
      panel.hidden = panel.dataset.faqPanel !== category;
    });

    const activePanel = getActivePanel();
    const visibleOpenItem = activePanel?.querySelector('[data-faq-item][open]:not([hidden])');
    if (activePanel && !visibleOpenItem) {
      const firstItem = activePanel.querySelector('[data-faq-item]:not([hidden])');
      if (firstItem) firstItem.open = true;
    }

    filterActivePanel();
  }

  panels.forEach(enforceSingleOpen);

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => activateCategory(tab.dataset.faqTab));
    tab.addEventListener('keydown', (event) => {
      const keys = ['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp', 'Home', 'End'];
      if (!keys.includes(event.key)) return;
      event.preventDefault();

      let nextIndex = index;
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') nextIndex = (index + 1) % tabs.length;
      if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') nextIndex = (index - 1 + tabs.length) % tabs.length;
      if (event.key === 'Home') nextIndex = 0;
      if (event.key === 'End') nextIndex = tabs.length - 1;
      activateCategory(tabs[nextIndex].dataset.faqTab, true);
    });
  });

  search?.addEventListener('input', filterActivePanel);
  search?.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape' || !search.value) return;
    search.value = '';
    filterActivePanel();
  });

  clearButton?.addEventListener('click', () => {
    if (!search) return;
    search.value = '';
    filterActivePanel();
    search.focus();
  });

  activateCategory(activeCategory);
}
