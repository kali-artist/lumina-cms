/**
 * LUMINA CMS - client-side content loader.
 * Fetches /api/content and updates marked sections.
 */
(function () {
  'use strict';

  const ICONS = {
    sparkles: 'sparkles',
    layout: 'layout-dashboard',
    kanban: 'kanban',
    workflow: 'workflow',
    shield: 'shield-check',
  };

  function get(path, obj) {
    return path.split('.').reduce((o, k) => (o == null ? null : o[k]), obj);
  }

  function el(tag, attrs = {}, children = []) {
    const e = document.createElement(tag);
    Object.entries(attrs).forEach(([k, v]) => {
      if (k === 'class') e.className = v;
      else if (k === 'text') e.textContent = v;
      else if (k === 'html') e.innerHTML = v;
      else e.setAttribute(k, v);
    });
    children.forEach((c) => e.appendChild(typeof c === 'string' ? document.createTextNode(c) : c));
    return e;
  }

  async function loadContent() {
    try {
      const res = await fetch('/api/content');
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return await res.json();
    } catch (err) {
      console.warn('CMS: failed to load content, using fallback.', err);
      return null;
    }
  }

  function renderNav(content) {
    const nav = get('nav', content);
    if (!nav) return;
    const brand = document.querySelector('#navbar .font-display.text-2xl');
    if (brand && nav.brand) brand.textContent = nav.brand;

    const links = document.querySelectorAll('#navbar a[href^="#"], #mobile-menu a[href^="#"]');
    links.forEach((a, i) => {
      const link = nav.links[i];
      if (!link) return;
      a.setAttribute('href', link.href);
      const icon = a.querySelector('i');
      a.textContent = link.label;
      if (icon) a.appendChild(icon);
    });
  }

  function renderHero(content) {
    const section = document.querySelector('[data-cms-section="hero"]');
    const hero = get('hero', content);
    if (!section || !hero) return;

    const h1 = section.querySelector('h1');
    if (h1 && hero.headline) {
      h1.innerHTML = hero.headline
        .replace(/\n/g, '<br>')
        .replace(/如多巴胺/, '<span class="font-serif-display italic text-gradient">如多巴胺</span>')
        .replace(/般流动/, '<span class="font-serif-display italic text-gradient">般流动</span>');
    }

    const desc = section.querySelector('p.text-lg');
    if (desc && hero.description) desc.textContent = hero.description;

    const ctaPrimary = section.querySelector('.btn-primary');
    if (ctaPrimary && hero.cta_primary) {
      ctaPrimary.innerHTML = `${hero.cta_primary} <i data-lucide="arrow-right" class="w-4 h-4"></i>`;
    }

    const ctaSecondary = section.querySelector('.btn-outline');
    if (ctaSecondary && hero.cta_secondary) {
      ctaSecondary.innerHTML = `<i data-lucide="play-circle" class="w-5 h-5"></i> ${hero.cta_secondary}`;
    }

    const social = section.querySelector('p.text-sm');
    if (social && hero.social_proof) {
      social.innerHTML = hero.social_proof.replace(/(\d[\d,]*\+?)/, '<span class="text-white font-bold">$1</span>');
    }

    const videoSource = section.querySelector('.video-bg source');
    const video = section.querySelector('.video-bg');
    if (videoSource && hero.video_url) videoSource.setAttribute('src', hero.video_url);
    if (video && hero.video_poster) video.setAttribute('poster', hero.video_poster);

    const dashboard = section.querySelector('img[alt*="Dashboard"]');
    if (dashboard && hero.dashboard_image) dashboard.setAttribute('src', hero.dashboard_image);
  }

  function renderLogos(content) {
    const section = document.querySelector('[data-cms-section="logos"]');
    const logos = get('logos', content);
    if (!section || !Array.isArray(logos)) return;

    const track = section.querySelector('.marquee-track');
    if (!track) return;

    const generate = () =>
      el('div', { class: 'flex items-center gap-16 opacity-50 grayscale hover:grayscale-0 transition-all' },
        logos.map((name) => el('span', { class: 'font-display text-2xl font-bold', text: name }))
      );

    track.innerHTML = '';
    track.appendChild(generate());
    track.appendChild(generate());
  }

  function renderFeatures(content) {
    const section = document.querySelector('[data-cms-section="features"]');
    const f = get('features', content);
    if (!section || !f) return;

    const eyebrow = section.querySelector('span.text-\\[\\#FF006E\\]');
    if (eyebrow && f.eyebrow) eyebrow.textContent = f.eyebrow;

    const title = section.querySelector('h2');
    if (title && f.title) {
      title.innerHTML = f.title
        .replace(/\n/g, '<br>')
        .replace(/第二大脑/, '<span class="font-serif-display italic text-[#8338EC]">第二大脑</span>');
    }

    const desc = section.querySelector('p.text-lg');
    if (desc && f.description) desc.textContent = f.description;

    const grid = section.querySelector('.grid.md\\:grid-cols-2');
    if (!grid || !Array.isArray(f.items)) return;

    const cards = grid.querySelectorAll(':scope > div');
    f.items.forEach((item, i) => {
      const card = cards[i];
      if (!card) return;
      const h3 = card.querySelector('h3');
      const p = card.querySelector('p');
      if (h3 && item.title) h3.textContent = item.title;
      if (p && item.description) p.textContent = item.description;
      const icon = ICONS[item.icon] || item.icon;
      const lucide = card.querySelector('i[data-lucide]');
      if (lucide && icon) lucide.setAttribute('data-lucide', icon);
    });
  }

  function renderWorkflow(content) {
    const section = document.querySelector('[data-cms-section="workflow"]');
    const w = get('workflow', content);
    if (!section || !w) return;

    const eyebrow = section.querySelector('span.text-\\[\\#00F5D4\\]');
    if (eyebrow && w.eyebrow) eyebrow.textContent = w.eyebrow;

    const title = section.querySelector('h2');
    if (title && w.title) title.innerHTML = w.title.replace(/\n/g, '<br>');

    const cards = section.querySelectorAll('.grid.md\\:grid-cols-2 > div, .grid.lg\\:grid-cols-4 > div');
    if (Array.isArray(w.steps)) {
      w.steps.forEach((step, i) => {
        const card = cards[i];
        if (!card) return;
        const num = card.querySelector('.w-16');
        const h3 = card.querySelector('h3');
        const p = card.querySelector('p');
        if (num && step.number) num.textContent = step.number;
        if (h3 && step.title) h3.textContent = step.title;
        if (p && step.description) p.textContent = step.description;
      });
    }
  }

  function renderHighlights(content) {
    const section = document.querySelector('[data-cms-section="highlights"]');
    const items = get('highlights', content);
    if (!section || !Array.isArray(items)) return;

    const blocks = section.querySelectorAll('.lg\\:col-span-5 > div');
    items.forEach((item, i) => {
      const block = blocks[i];
      if (!block) return;
      const h3 = block.querySelector('h3');
      const p = block.querySelector('p');
      if (h3 && item.title) h3.textContent = item.title;
      if (p && item.description) p.textContent = item.description;
    });
  }

  function renderCases(content) {
    const section = document.querySelector('[data-cms-section="cases"]');
    const c = get('cases', content);
    if (!section || !c) return;

    const eyebrow = section.querySelector('span.text-\\[\\#FFBE0B\\]');
    if (eyebrow && c.eyebrow) eyebrow.textContent = c.eyebrow;

    const title = section.querySelector('h2');
    if (title && c.title) {
      title.innerHTML = c.title.replace(/\n/g, '<br>').replace(/LUMINA/, '<span class="text-gradient-cool">LUMINA</span>');
    }

    const cta = section.querySelector('.btn-outline');
    if (cta && c.cta) cta.textContent = c.cta;

    const cards = section.querySelectorAll('.grid.md\\:grid-cols-2 > .group, .grid.lg\\:grid-cols-3 > .group');
    if (Array.isArray(c.items)) {
      c.items.forEach((item, i) => {
        const card = cards[i];
        if (!card) return;
        const img = card.querySelector('img');
        const h3 = card.querySelector('h3');
        const p = card.querySelector('p');
        if (img && item.image) img.setAttribute('src', item.image);
        if (h3 && item.name) h3.textContent = item.name;
        if (p && item.result) p.textContent = item.result;
      });
    }
  }

  function renderStats(content) {
    const section = document.querySelector('[data-cms-section="stats"]');
    const s = get('stats', content);
    if (!section || !s) return;

    const items = section.querySelectorAll('.grid > div');
    if (Array.isArray(s.items)) {
      s.items.forEach((item, i) => {
        const div = items[i];
        if (!div) return;
        const val = div.querySelector('.font-display.text-5xl, .font-display.text-\\[\\#0A0A12\\]');
        const label = div.querySelector('p');
        if (val && item.value) val.textContent = item.value;
        if (label && item.label) label.textContent = item.label;
      });
    }
  }

  function renderTestimonials(content) {
    const section = document.querySelector('[data-cms-section="testimonials"]');
    const items = get('testimonials', content);
    if (!section || !Array.isArray(items)) return;

    const eyebrow = section.querySelector('span.text-\\[\\#8338EC\\]');
    if (eyebrow) eyebrow.textContent = '用户评价';

    const title = section.querySelector('h2');
    if (title) {
      title.innerHTML = '被全球顶尖团队<br>信赖的协作伙伴';
    }

    const cards = section.querySelectorAll('.space-y-8 > div');
    items.forEach((item, i) => {
      const card = cards[i];
      if (!card) return;
      const quote = card.querySelector('p.italic');
      const author = card.querySelector('.font-display.font-bold');
      const role = card.querySelector('p.text-sm');
      if (quote && item.quote) quote.textContent = item.quote;
      if (author && item.author) author.textContent = item.author;
      if (role && item.role) role.textContent = item.role;
    });
  }

  function renderContact(content) {
    const section = document.querySelector('[data-cms-section="contact"]');
    const c = get('contact', content);
    const cta = get('cta', content);
    if (!section) return;

    // Left column: CTA
    if (cta) {
      const title = section.querySelector('.grid > div > div > h2');
      if (title && cta.title) {
        title.innerHTML = cta.title
          .replace(/\n/g, '<br>')
          .replace(/创意爆发/, '<span class="text-gradient">创意爆发</span>');
      }

      const desc = section.querySelector('.grid > div > div > p.text-lg');
      if (desc && cta.description) desc.textContent = cta.description;

      const btns = section.querySelectorAll('.grid > div > div > .flex a');
      if (btns[0] && cta.primary) {
        btns[0].innerHTML = `${cta.primary} <i data-lucide="arrow-right" class="w-4 h-4"></i>`;
      }
      if (btns[1] && cta.secondary) {
        btns[1].innerHTML = `<i data-lucide="calendar" class="w-5 h-5"></i> ${cta.secondary}`;
      }
    }

    // Right column: contact form
    if (!c) return;
    const formTitle = section.querySelector('h3');
    if (formTitle && c.title) formTitle.textContent = c.title;

    const form = section.querySelector('form');
    if (form && Array.isArray(c.fields)) {
      form.innerHTML = '';

      const rowFields = c.fields.filter((f) => f.type !== 'textarea');
      const textareaField = c.fields.find((f) => f.type === 'textarea');

      if (rowFields.length) {
        const row = el('div', { class: 'grid md:grid-cols-2 gap-4 mb-4' });
        rowFields.forEach((field) => {
          row.appendChild(
            el('input', {
              type: field.type,
              name: field.name,
              placeholder: field.label,
              class: 'w-full bg-white/5 border border-white/10 px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-[#FF006E] transition-colors',
            })
          );
        });
        form.appendChild(row);
      }

      c.fields.forEach((field) => {
        if (field.type === 'textarea') {
          form.appendChild(
            el('textarea', {
              name: field.name,
              placeholder: field.label,
              rows: '4',
              class: 'w-full bg-white/5 border border-white/10 px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-[#FF006E] transition-colors mb-4',
            })
          );
        } else if (!rowFields.includes(field)) {
          form.appendChild(
            el('input', {
              type: field.type,
              name: field.name,
              placeholder: field.label,
              class: 'w-full bg-white/5 border border-white/10 px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-[#FF006E] transition-colors mb-4',
            })
          );
        }
      });

      form.appendChild(
        el('button', { type: 'submit', class: 'btn-primary w-full flex items-center justify-center gap-2' }, [
          c.submit || '发送',
          el('i', { 'data-lucide': 'send', class: 'w-4 h-4' }),
        ])
      );
    }
  }

  function renderFooter(content) {
    const footer = document.querySelector('footer');
    const f = get('footer', content);
    if (!footer || !f) return;

    const brand = footer.querySelector('.font-display.text-xl, .font-display.text-2xl');
    if (brand && f.brand) brand.textContent = f.brand;

    const tagline = footer.querySelector('p.text-white\\/50');
    if (tagline && f.tagline) tagline.textContent = f.tagline;

    const copy = footer.querySelector('p.text-white\\/40');
    if (copy && f.copyright) copy.textContent = f.copyright;
  }

  function renderAll(content) {
    if (!content) return;
    renderNav(content);
    renderHero(content);
    renderLogos(content);
    renderFeatures(content);
    renderWorkflow(content);
    renderHighlights(content);
    renderCases(content);
    renderStats(content);
    renderTestimonials(content);
    renderContact(content);
    renderFooter(content);
    if (window.lucide) lucide.createIcons();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => loadContent().then(renderAll));
  } else {
    loadContent().then(renderAll);
  }
})();
