/* ==========================================================================
   루미의 서재 (Rumi's Book Library) - Frontend Interactive Controller
   ========================================================================== */

import { DataStore } from './data.js';

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide Icons
  refreshIcons();

  // 1. Theme Management (Dark / Light Mode)
  initTheme();

  // 2. Navigation Active State Observer
  initNavObserver();

  // 3. Carousel & Touch Swipe Controller
  initCurationCarousel();

  // 4. Tag Filtering & Grid/List View Mode
  initCurationFilters();

  // 5. Book Preview Modal System
  initModalSystem();

  // 6. Contact Form Handling with Real-time Validation
  initContactForm();

  // 7. Smooth Metric Counters Animation
  initMetricCounters();

  // Hydrate content from DataStore without blocking UI listeners
  hydrateContent().catch(err => {
    console.warn("Data hydration warning:", err);
  });
});

function refreshIcons() {
  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    window.lucide.createIcons();
  }
}

async function hydrateContent() {
  if (typeof DataStore === 'undefined') return;
  
  try {
    const heroData = await DataStore.getHero();
    const heroTitle = document.getElementById('heroTitle');
    const heroSubtitle = document.getElementById('heroSubtitle');
    if (heroTitle && heroData && heroData.title) heroTitle.innerHTML = heroData.title;
    if (heroSubtitle && heroData && heroData.subtitle) heroSubtitle.innerHTML = heroData.subtitle;
  } catch (e) {
    console.warn("Hero hydration error:", e);
  }

  try {
    const metricsData = await DataStore.getMetrics();
    const metricReviews = document.getElementById('metric-reviews');
    const metricFollowers = document.getElementById('metric-followers');
    const metricCollabs = document.getElementById('metric-collaborations');
    
    if (metricReviews && metricsData && metricsData.reviews) {
      metricReviews.setAttribute('data-target', metricsData.reviews);
      metricReviews.innerText = metricsData.reviews + "+";
    }
    if (metricFollowers && metricsData && metricsData.followers) {
      metricFollowers.setAttribute('data-target', metricsData.followers);
      metricFollowers.innerText = metricsData.followers + "K+";
    }
    if (metricCollabs && metricsData && metricsData.collaborations) {
      metricCollabs.setAttribute('data-target', metricsData.collaborations);
      metricCollabs.innerText = metricsData.collaborations + "%";
    }
  } catch (e) {
    console.warn("Metrics hydration error:", e);
  }

  try {
    const cards = document.querySelectorAll('.book-card');
    const books = await DataStore.getBooks();

    if (books) {
      cards.forEach(card => {
        const bookId = card.getAttribute('data-book-id');
        if (bookId && books[bookId]) {
          const bookData = books[bookId];
          const titleEl = card.querySelector('.book-title');
          const authorEl = card.querySelector('.author');
          const genreEl = card.querySelector('.genre-badge');
          const ratingEl = card.querySelector('.rating');
          const quoteEl = card.querySelector('.character-quote');

          if (titleEl && bookData.title) titleEl.innerText = bookData.title;
          if (authorEl && bookData.author) authorEl.innerText = bookData.author;
          if (genreEl && bookData.genre) genreEl.innerText = bookData.genre;
          if (ratingEl && bookData.rating) ratingEl.innerHTML = '<i data-lucide="star"></i> ' + (bookData.rating.split('/')[0].trim());
          if (quoteEl && bookData.characterQuote) quoteEl.innerText = '"' + bookData.characterQuote + '"';
        }
      });
    }
  } catch (e) {
    console.warn("Books hydration error:", e);
  }
}

/* --------------------------------------------------------------------------
   1. Theme Management
   -------------------------------------------------------------------------- */
function initTheme() {
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const htmlElement = document.documentElement;

  const savedTheme = localStorage.getItem('rumi_theme');
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  let currentTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
  applyTheme(currentTheme);

  themeToggleBtn?.addEventListener('click', () => {
    currentTheme = htmlElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    applyTheme(currentTheme);
    localStorage.setItem('rumi_theme', currentTheme);
    showToast(`테마가 ${currentTheme === 'dark' ? '다크' : '라이트'} 모드로 전환되었습니다.`, 'info');
  });

  function applyTheme(theme) {
    htmlElement.setAttribute('data-theme', theme);
    if (themeToggleBtn) {
      themeToggleBtn.innerHTML = theme === 'dark' 
        ? '<i data-lucide="sun"></i>' 
        : '<i data-lucide="moon"></i>';
      refreshIcons();
    }
  }
}

/* --------------------------------------------------------------------------
   2. Navigation Active State Observer
   -------------------------------------------------------------------------- */
function initNavObserver() {
  const sections = document.querySelectorAll('section[id]');
  const desktopLinks = document.querySelectorAll('.desktop-menu .menu-link');
  const mobileTabs = document.querySelectorAll('.mobile-bottom-nav .tab-item');

  const observerOptions = {
    root: null,
    rootMargin: '-20% 0px -50% 0px',
    threshold: 0.1
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const activeId = entry.target.getAttribute('id');
        updateActiveNav(activeId);
      }
    });
  }, observerOptions);

  sections.forEach(section => observer.observe(section));

  function updateActiveNav(id) {
    desktopLinks.forEach(link => {
      const href = link.getAttribute('href').substring(1);
      link.classList.toggle('active', href === id);
    });

    mobileTabs.forEach(tab => {
      const tabTarget = tab.getAttribute('data-tab');
      tab.classList.toggle('active', tabTarget === id);
    });
  }
}

/* --------------------------------------------------------------------------
   3. Carousel & Touch Swipe Controller
   -------------------------------------------------------------------------- */
let currentSlide = 0;

function initCurationCarousel() {
  const track = document.getElementById('cardsTrack');
  const prevBtn = document.getElementById('prevSlide');
  const nextBtn = document.getElementById('nextSlide');
  const dotsContainer = document.getElementById('carouselDots');
  const cards = track ? track.querySelectorAll('.book-card') : [];

  if (!track || cards.length === 0) return;

  // Build Dots
  dotsContainer.innerHTML = '';
  cards.forEach((_, index) => {
    const dot = document.createElement('div');
    dot.className = `dot ${index === 0 ? 'active' : ''}`;
    dot.setAttribute('role', 'button');
    dot.setAttribute('aria-label', `${index + 1}번 도서 보기`);
    dot.addEventListener('click', () => scrollToSlide(index));
    dotsContainer.appendChild(dot);
  });

  prevBtn?.addEventListener('click', () => {
    if (currentSlide > 0) scrollToSlide(currentSlide - 1);
  });

  nextBtn?.addEventListener('click', () => {
    if (currentSlide < cards.length - 1) scrollToSlide(currentSlide + 1);
  });

  // Touch Swipe Logic
  let touchStartX = 0;
  let touchEndX = 0;

  track.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  track.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  }, { passive: true });

  function handleSwipe() {
    const swipeThreshold = 40;
    if (touchStartX - touchEndX > swipeThreshold) {
      if (currentSlide < cards.length - 1) scrollToSlide(currentSlide + 1);
    } else if (touchEndX - touchStartX > swipeThreshold) {
      if (currentSlide > 0) scrollToSlide(currentSlide - 1);
    }
  }

  function scrollToSlide(index) {
    currentSlide = index;
    const targetCard = cards[index];
    if (targetCard) {
      targetCard.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
    updateDots();
  }

  function updateDots() {
    const dots = dotsContainer.querySelectorAll('.dot');
    dots.forEach((dot, idx) => {
      dot.classList.toggle('active', idx === currentSlide);
    });
  }
}

/* --------------------------------------------------------------------------
   4. Tag Filtering & Grid/List View Mode
   -------------------------------------------------------------------------- */
function initCurationFilters() {
  const container = document.getElementById('curationContainer');
  const moodPills = document.querySelectorAll('.mood-pill');
  const gridBtn = document.getElementById('gridToggleBtn');
  const listBtn = document.getElementById('listToggleBtn');
  const cardsTrack = document.getElementById('cardsTrack');
  const liveStatus = document.getElementById('filterLiveStatus');

  moodPills.forEach(pill => {
    pill.addEventListener('click', () => {
      moodPills.forEach(p => {
        p.classList.remove('active');
        p.setAttribute('aria-selected', 'false');
      });
      pill.classList.add('active');
      pill.setAttribute('aria-selected', 'true');

      const filter = pill.getAttribute('data-filter');
      filterCards(filter);
    });
  });

  function filterCards(category) {
    const cards = cardsTrack.querySelectorAll('.book-card');
    let visibleCount = 0;

    cards.forEach(card => {
      const cardCat = card.getAttribute('data-category');
      if (category === 'all' || cardCat === category) {
        card.style.display = 'flex';
        card.style.animation = 'fadeIn 0.35s ease forwards';
        visibleCount++;
      } else {
        card.style.display = 'none';
      }
    });

    cardsTrack.scrollLeft = 0;
    if (liveStatus) {
      liveStatus.textContent = `${visibleCount}개의 도서가 큐레이션되었습니다.`;
    }
  }

  gridBtn?.addEventListener('click', () => {
    container.classList.remove('list-view');
    container.classList.add('grid-view');
    gridBtn.classList.add('active');
    listBtn.classList.remove('active');
  });

  listBtn?.addEventListener('click', () => {
    container.classList.remove('grid-view');
    container.classList.add('list-view');
    listBtn.classList.add('active');
    gridBtn.classList.remove('active');
  });
}

/* --------------------------------------------------------------------------
   5. Book Detail Modal System
   -------------------------------------------------------------------------- */
window.closeModal = function closeModal() {
  const overlay = document.getElementById('modalOverlay');
  if (overlay) {
    overlay.classList.remove('active');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
};

function initModalSystem() {
  const overlay = document.getElementById('modalOverlay');
  const closeBtn = document.getElementById('modalCloseBtn');
  const body = document.getElementById('modalBody');

  document.addEventListener('click', async (e) => {
    const trigger = e.target.closest('[data-modal]');
    if (trigger) {
      e.preventDefault();
      const bookId = trigger.getAttribute('data-modal');
      await openBookModal(bookId);
    }
  });

  closeBtn?.addEventListener('click', window.closeModal);
  overlay?.addEventListener('click', (e) => {
    if (e.target === overlay) window.closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay?.classList.contains('active')) {
      window.closeModal();
    }
  });

  async function openBookModal(id) {
    const currentOverlay = document.getElementById('modalOverlay');
    const currentBody = document.getElementById('modalBody');
    if (!currentOverlay || !currentBody) return;

    const data = typeof DataStore !== 'undefined' ? await DataStore.getBook(id) : null;
    if (!data) return;

    currentBody.innerHTML = `
      <div class="modal-book-detail">
        <div class="modal-header-flex">
          <img src="${data.cover}" alt="${data.title} 표지" class="modal-cover-img">
          <div class="modal-header-info">
            <span class="badge badge-accent">${data.genre}</span>
            <h3 class="modal-title" id="modalTitle">${data.title}</h3>
            <p class="modal-author">${data.author}</p>
            <div class="modal-rating"><i data-lucide="star"></i> 평점: ${data.rating}</div>
          </div>
        </div>

        <div class="modal-scene-preview">
          <span class="preview-tag"><i data-lucide="sparkles"></i> 캐릭터 '루미'의 AI 씬 재연 미리보기</span>
          <img src="${data.sceneImg}" alt="AI 서평 씬 재연 이미지" class="modal-scene-img">
        </div>

        <div class="modal-snippet">
          ${data.blogReviewSnippet}
        </div>

        <div class="modal-stats-box">
          <i data-lucide="trending-up"></i>
          <span>${data.stats}</span>
        </div>

        <div class="modal-action-row">
          <a href="#contact" class="btn btn-primary btn-full-span" onclick="window.closeModal();">
            <span>이와 같은 컨셉으로 도서 리뷰 협업 신청하기</span>
            <i data-lucide="send"></i>
          </a>
        </div>
      </div>
    `;

    currentOverlay.classList.add('active');
    currentOverlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    refreshIcons();
  }
}

/* --------------------------------------------------------------------------
   6. Contact Form Handling & Validation
   -------------------------------------------------------------------------- */
function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  const userName = document.getElementById('userName');
  const publisherName = document.getElementById('publisherName');
  const userEmail = document.getElementById('userEmail');
  const proposalDetail = document.getElementById('proposalDetail');

  // Real-time Input Listeners
  [userName, publisherName, userEmail, proposalDetail].forEach(input => {
    input?.addEventListener('input', () => validateField(input));
  });

  function validateField(input) {
    if (!input) return true;
    const val = input.value.trim();
    const errorEl = document.getElementById(`${input.id}Error`);
    let isValid = true;
    let errorMsg = '';

    if (input.required && !val) {
      isValid = false;
      errorMsg = '필수 입력 항목입니다.';
    } else if (input.type === 'email' && val) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(val)) {
        isValid = false;
        errorMsg = '올바른 이메일 형식을 입력해 주세요.';
      }
    }

    if (!isValid) {
      input.classList.add('input-invalid');
      if (errorEl) {
        errorEl.textContent = errorMsg;
        errorEl.classList.add('visible');
      }
    } else {
      input.classList.remove('input-invalid');
      if (errorEl) {
        errorEl.textContent = '';
        errorEl.classList.remove('visible');
      }
    }
    return isValid;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const isNameValid = validateField(userName);
    const isPublisherValid = validateField(publisherName);
    const isEmailValid = validateField(userEmail);
    const isDetailValid = validateField(proposalDetail);

    if (!isNameValid || !isPublisherValid || !isEmailValid || !isDetailValid) {
      showToast('입력하신 항목을 다시 확인해 주세요.', 'error');
      return;
    }

    try {
      await DataStore.addInquiry({
        name: userName.value.trim(),
        publisher: publisherName.value.trim(),
        email: userEmail.value.trim(),
        proposal: proposalDetail.value.trim()
      });
    } catch (error) {
      console.error("Error submitting inquiry:", error);
      showToast('제안 접수 중 오류가 발생했습니다. 다시 시도해주세요.', 'error');
      return;
    }

    // Success State Modal
    const body = document.getElementById('modalBody');
    body.innerHTML = `
      <div class="contact-success-modal" style="text-align: center; padding: 1.5rem 0;">
        <div style="width: 60px; height: 60px; border-radius: 50%; background-color: rgba(44, 94, 78, 0.1); color: var(--color-primary); display: inline-flex; align-items: center; justify-content: center; font-size: 2rem; margin-bottom: 1rem;">
          <i data-lucide="check-circle"></i>
        </div>
        <h3 style="font-family: var(--font-serif); font-size: 1.6rem; margin-bottom: 0.6rem;">협업 제안 접수 완료!</h3>
        <p style="color: var(--text-secondary); line-height: 1.6; margin-bottom: 1.5rem;">
          소중한 제안 감사드립니다.<br>
          작성해 주신 이메일(<strong>${userEmail.value.trim()}</strong>)로 24시간 이내에 세부 진행 절차 및 포트폴리오를 안내해 드리겠습니다.
        </p>
        <button class="btn btn-primary" onclick="window.closeModal();">확인</button>
      </div>
    `;
    
    document.getElementById('modalOverlay').classList.add('active');
    document.getElementById('modalOverlay').setAttribute('aria-hidden', 'false');
    showToast(`${publisherName.value.trim()} ${userName.value.trim()} 담당자님, 협업 문의가 접수되었습니다!`, 'success');
    refreshIcons();
    form.reset();
  });
}

/* --------------------------------------------------------------------------
   7. Metric Counters Animation
   -------------------------------------------------------------------------- */
function initMetricCounters() {
  const nums = document.querySelectorAll('.metric-num[data-target]');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateNum(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  nums.forEach(num => observer.observe(num));

  function animateNum(el) {
    const target = parseInt(el.getAttribute('data-target'), 10);
    const suffix = el.innerText.replace(/[0-9]/g, '');
    let count = 0;
    const duration = 1200;
    const stepTime = Math.abs(Math.floor(duration / target));

    const timer = setInterval(() => {
      count += Math.ceil(target / 25);
      if (count >= target) {
        el.innerText = target + suffix;
        clearInterval(timer);
      } else {
        el.innerText = count + suffix;
      }
    }, stepTime);
  }
}

/* Helper: Toast Notification */
function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  const iconName = type === 'success' ? 'check-circle' : (type === 'error' ? 'alert-triangle' : 'info');
  toast.innerHTML = `<i data-lucide="${iconName}"></i> <span>${message}</span>`;

  container.appendChild(toast);
  refreshIcons();

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}
