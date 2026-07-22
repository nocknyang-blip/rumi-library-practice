// admin.js - Firebase Admin Dashboard Logic
import { auth, signInWithEmailAndPassword, onAuthStateChanged, signOut, CLOUDINARY_CONFIG } from './firebase-config.js';
import { DataStore } from './data.js';

document.addEventListener('DOMContentLoaded', () => {
  if (window.lucide) {
    window.lucide.createIcons();
  }

  const loginView = document.getElementById('loginView');
  const dashboardView = document.getElementById('dashboardView');
  const loginForm = document.getElementById('loginForm');
  const logoutBtn = document.getElementById('logoutBtn');

  // Firebase Auth Listener
  onAuthStateChanged(auth, (user) => {
    if (user) {
      showDashboard();
    } else {
      showLogin();
    }
  });

  // Auth Functions
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('adminEmail').value;
    const pwd = document.getElementById('adminPassword').value;
    
    try {
      await signInWithEmailAndPassword(auth, email, pwd);
      // onAuthStateChanged will handle the rest
    } catch (error) {
      alert('로그인 실패: 이메일과 비밀번호를 확인해주세요.');
    }
  });

  logoutBtn.addEventListener('click', async () => {
    await signOut(auth);
  });

  function showLogin() {
    loginView.style.display = 'flex';
    dashboardView.classList.remove('active');
  }

  function showDashboard() {
    loginView.style.display = 'none';
    dashboardView.classList.add('active');
    initDashboard();
  }

  // --- Dashboard Logic ---
  async function initDashboard() {
    initNavigation();
    await loadHeroPanel();
    await loadMetricsPanel();
    await loadBooksPanel();
    await loadInquiriesPanel();
  }

  function initNavigation() {
    const navLinks = document.querySelectorAll('.admin-nav-link[data-target]');
    const panels = document.querySelectorAll('.admin-panel');

    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        navLinks.forEach(n => n.classList.remove('active'));
        panels.forEach(p => p.classList.remove('active'));

        link.classList.add('active');
        const targetId = link.getAttribute('data-target');
        document.getElementById(targetId).classList.add('active');
      });
    });
  }

  // Hero Panel
  async function loadHeroPanel() {
    const data = await DataStore.getHero();
    document.getElementById('heroTitleInput').value = data.title || '';
    document.getElementById('heroSubtitleInput').value = data.subtitle || '';

    const form = document.getElementById('heroForm');
    form.onsubmit = async (e) => {
      e.preventDefault();
      try {
        await DataStore.updateHero({
          title: document.getElementById('heroTitleInput').value,
          subtitle: document.getElementById('heroSubtitleInput').value
        });
        alert('저장되었습니다.');
      } catch (err) {
        alert('저장 실패');
      }
    };
  }

  // Metrics Panel
  async function loadMetricsPanel() {
    const data = await DataStore.getMetrics();
    document.getElementById('metricFollowersInput').value = data.followers || '';
    document.getElementById('metricReviewsInput').value = data.reviews || '';
    document.getElementById('metricCollabsInput').value = data.collaborations || '';

    const form = document.getElementById('metricsForm');
    form.onsubmit = async (e) => {
      e.preventDefault();
      try {
        await DataStore.updateMetrics({
          followers: document.getElementById('metricFollowersInput').value,
          reviews: document.getElementById('metricReviewsInput').value,
          collaborations: document.getElementById('metricCollabsInput').value
        });
        alert('저장되었습니다.');
      } catch (err) {
        alert('저장 실패');
      }
    };
  }

  // Books Panel
  let uploadedImageUrl = '';
  
  async function loadBooksPanel() {
    const listContainer = document.getElementById('bookListContainer');
    listContainer.innerHTML = '로딩중...';
    const books = await DataStore.getBooks();

    listContainer.innerHTML = '';
    Object.values(books).forEach(book => {
      const item = document.createElement('div');
      item.className = 'book-list-item';
      item.innerHTML = `
        <div class="book-info-row">
          <img src="${book.cover}" alt="cover" style="width:40px; height:60px; object-fit:cover; border-radius:4px;">
          <div>
            <div style="font-weight: 600;">${book.title}</div>
            <div style="font-size: 0.8rem; color: var(--text-secondary);">${book.author}</div>
          </div>
        </div>
        <button class="btn btn-secondary btn-sm edit-book-btn" data-id="${book.id}">
          <i data-lucide="edit-3"></i>
        </button>
      `;
      listContainer.appendChild(item);
    });

    document.querySelectorAll('.edit-book-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        openBookEdit(id);
      });
    });

    if (window.lucide) window.lucide.createIcons();
    
    // Add new book button
    document.getElementById('addBookBtn').onclick = () => {
      openBookEdit(null); // null means new book
    };
  }

  async function openBookEdit(id) {
    const editContainer = document.getElementById('bookEditContainer');
    const formTitle = document.getElementById('bookFormTitle');
    const deleteBtn = document.getElementById('deleteBookBtn');
    
    document.getElementById('bookImageInput').value = '';
    document.getElementById('bookImagePreview').innerHTML = '';
    uploadedImageUrl = '';
    document.getElementById('saveBookBtn').disabled = false;
    document.getElementById('saveBookBtn').innerText = '저장';

    if (id) {
      formTitle.innerText = "도서 수정";
      deleteBtn.style.display = 'block';
      const book = await DataStore.getBook(id);
      document.getElementById('bookIdInput').value = id;
      document.getElementById('bookTitleInput').value = book.title;
      document.getElementById('bookAuthorInput').value = book.author;
      document.getElementById('bookGenreInput').value = book.genre;
      document.getElementById('bookRatingInput').value = book.rating;
      document.getElementById('bookQuoteInput').value = book.characterQuote;
      uploadedImageUrl = book.cover;
      document.getElementById('bookImagePreview').innerHTML = `<img src="${book.cover}" style="height: 100px; border-radius: 8px;">`;
    } else {
      formTitle.innerText = "새 도서 등록";
      deleteBtn.style.display = 'none';
      document.getElementById('bookIdInput').value = '';
      document.getElementById('bookTitleInput').value = '';
      document.getElementById('bookAuthorInput').value = '';
      document.getElementById('bookGenreInput').value = '';
      document.getElementById('bookRatingInput').value = '';
      document.getElementById('bookQuoteInput').value = '';
    }
    
    editContainer.style.display = 'block';
    editContainer.scrollIntoView({ behavior: 'smooth' });
  }

  document.getElementById('cancelBookEditBtn').addEventListener('click', () => {
    document.getElementById('bookEditContainer').style.display = 'none';
  });

  // Cloudinary Image Upload
  document.getElementById('bookImageInput').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!CLOUDINARY_CONFIG.cloudName || CLOUDINARY_CONFIG.cloudName === 'YOUR_CLOUD_NAME') {
      alert('Cloudinary 설정값이 누락되었습니다. firebase-config.js를 확인하세요.');
      return;
    }

    const saveBtn = document.getElementById('saveBookBtn');
    saveBtn.disabled = true;
    saveBtn.innerText = "이미지 업로드 중...";

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);

    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.secure_url) {
        uploadedImageUrl = data.secure_url;
        document.getElementById('bookImagePreview').innerHTML = `<img src="${uploadedImageUrl}" style="height: 100px; border-radius: 8px;">`;
      } else {
        alert('이미지 업로드 실패');
      }
    } catch (err) {
      console.error(err);
      alert('이미지 업로드 중 오류가 발생했습니다.');
    } finally {
      saveBtn.disabled = false;
      saveBtn.innerText = "저장";
    }
  });

  document.getElementById('bookForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!uploadedImageUrl) {
      alert("표지 이미지를 등록해야 합니다.");
      return;
    }

    const id = document.getElementById('bookIdInput').value;
    const bookData = {
      title: document.getElementById('bookTitleInput').value,
      author: document.getElementById('bookAuthorInput').value,
      genre: document.getElementById('bookGenreInput').value,
      rating: document.getElementById('bookRatingInput').value,
      characterQuote: document.getElementById('bookQuoteInput').value,
      cover: uploadedImageUrl,
      sceneImg: uploadedImageUrl, // Using same image for scene for simplicity
      blogReviewSnippet: "새로 등록된 도서입니다.",
      stats: "조회수 0"
    };

    try {
      if (id) {
        await DataStore.updateBook(id, bookData);
      } else {
        await DataStore.addBook(bookData);
      }
      alert('저장되었습니다.');
      document.getElementById('bookEditContainer').style.display = 'none';
      await loadBooksPanel();
    } catch (err) {
      alert('저장 실패');
    }
  });

  document.getElementById('deleteBookBtn').addEventListener('click', async () => {
    const id = document.getElementById('bookIdInput').value;
    if (!id) return;
    
    if (confirm('정말로 이 도서를 삭제하시겠습니까?')) {
      try {
        await DataStore.deleteBook(id);
        alert('삭제되었습니다.');
        document.getElementById('bookEditContainer').style.display = 'none';
        await loadBooksPanel();
      } catch (err) {
        alert('삭제 실패');
      }
    }
  });

  // Inquiries Panel
  async function loadInquiriesPanel() {
    const listContainer = document.getElementById('inquiriesListContainer');
    listContainer.innerHTML = '로딩중...';
    
    const inquiries = await DataStore.getInquiries();
    listContainer.innerHTML = '';
    
    if (inquiries.length === 0) {
      listContainer.innerHTML = '<p style="padding:1rem; text-align:center; color:gray;">들어온 문의가 없습니다.</p>';
      return;
    }

    inquiries.forEach(inq => {
      const item = document.createElement('div');
      item.style.padding = '1.5rem';
      item.style.borderBottom = '1px solid var(--border-color)';
      item.style.backgroundColor = 'var(--bg-secondary)';
      item.style.borderRadius = '8px';
      item.style.marginBottom = '1rem';
      
      const date = new Date(inq.createdAt).toLocaleString('ko-KR');
      
      item.innerHTML = `
        <div style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 0.5rem;">${date}</div>
        <h4 style="margin-bottom: 0.5rem;">${inq.publisher} - ${inq.name}</h4>
        <div style="margin-bottom: 1rem;"><a href="mailto:${inq.email}" style="color:var(--color-primary);">${inq.email}</a></div>
        <div style="padding: 1rem; background-color: var(--bg-primary); border-radius: 4px; font-size: 0.95rem; white-space: pre-wrap;">${inq.proposal}</div>
      `;
      listContainer.appendChild(item);
    });
  }
});
