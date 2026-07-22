// data.js - Firebase Data Layer
import { db, doc, getDoc, setDoc, collection, getDocs, addDoc, updateDoc, deleteDoc } from './firebase-config.js';

const defaultBooks = {
  "1": {
    id: "1",
    title: "달빛 세탁소",
    author: "김지은 저 · 달빛출판사",
    genre: "소설 / 힐링",
    rating: "4.9 / 5.0",
    characterQuote: "지친 마음에 묻은 얼룩을 말끔히 지워주는 밤의 이야기. 루미도 세탁소 벤치에서 눈물을 훔쳤어요.",
    cover: "./assets/book_cover1.png",
    sceneImg: "./assets/book_cover1.png",
    blogReviewSnippet: "누구나 가슴속에 지우지 못한 마음의 얼룩 하나쯤은 품고 살아갑니다. &lt;달빛 세탁소&gt;는 밤 12시가 되면 문을 열어 지친 이들의 마음을 깨끗이 씻어주는 특별한 공간입니다. 따스한 보일러 온기와 은은한 세제 향기 속에서 펼쳐지는 이야기를 통해 마음의 안식을 찾아보세요.",
    stats: "월간 조회수 12,400회 · 독자 추천 98%"
  },
  "2": {
    id: "2",
    title: "초록빛 내일",
    author: "이민준 저 · 그린북스",
    genre: "에세이 / 루틴",
    rating: "4.8 / 5.0",
    characterQuote: "복잡한 지하철 안에서도 나만의 아침 숲길을 만드는 10분 모닝 루틴.",
    cover: "./assets/book_cover2.png",
    sceneImg: "./assets/book_cover2.png",
    blogReviewSnippet: "매일 반복되는 지친 출근길, 마음 한구석에 조용한 숲을 가꾸는 정원사의 마음으로 쓴 에세이. 작가가 제안하는 10분 모닝 루틴과 아침 긍정 확언은 팍팍한 일상 속에서 나만의 초록빛 여유를 되찾게 해줍니다.",
    stats: "월간 조회수 8,900회 · 독자 추천 95%"
  },
  "3": {
    id: "3",
    title: "별이 지는 밤의 비밀",
    author: "박해일 저 · 시계탑미디어",
    genre: "미스터리 / 판타지",
    rating: "5.0 / 5.0",
    characterQuote: "시계탑 아래 숨겨진 거대 추리극! 밤새도록 페이지를 넘기느라 잠을 청할 수 없었습니다.",
    cover: "./assets/book_cover3.png",
    sceneImg: "./assets/book_cover3.png",
    blogReviewSnippet: "오래된 시계탑 마을에서 벌어지는 의문의 실종 사건과 별빛에 숨겨진 비밀. 치밀한 트릭과 예상을 뛰어넘는 반전이 숨 돌릴 틈 없이 펼쳐지는 고품격 추리 미스터리 판타지 소설입니다.",
    stats: "월간 조회수 15,100회 · 독자 추천 99%"
  },
  "4": {
    id: "4",
    title: "AI 시대의 몰입 독서법",
    author: "최영호 저 · 미래미디어",
    genre: "자기계발 / 자기성장",
    rating: "4.7 / 5.0",
    characterQuote: "정보의 홍수 속에서 내 생각의 지도를 구축하는 차세대 딥 리딩 전략!",
    cover: "./assets/book_cover4.png",
    sceneImg: "./assets/book_cover4.png",
    blogReviewSnippet: "단순한 정보 소비를 넘어, AI 시대를 살아가는 현대인을 위한 차세대 딥 리딩(Deep Reading) 가이드. 생각을 확장하고 지식을 내재화하는 독서 노트법과 몰입 기술을 체계적으로 다룹니다.",
    stats: "월간 조회수 10,200회 · 독자 추천 94%"
  }
};

export const DataStore = {
  async getHero() {
    try {
      const docRef = doc(db, 'site', 'hero');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) return docSnap.data();
      // default fallback
      return {
        title: "당신의 일상에<br>가장 빛나는 문장들.",
        subtitle: "네이버 도서 인플루언서 '루미'가 전하는 따뜻한 위로와 성장의 메시지.<br>매일 아침, 당신의 마음을 채우는 특별한 책 이야기를 만나보세요."
      };
    } catch (e) {
      console.error("Error fetching hero:", e);
      return {};
    }
  },

  async updateHero(heroData) {
    try {
      await setDoc(doc(db, 'site', 'hero'), heroData);
    } catch (e) {
      console.error("Error updating hero:", e);
      throw e;
    }
  },

  async getMetrics() {
    try {
      const docRef = doc(db, 'site', 'metrics');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) return docSnap.data();
      return { followers: 12000, reviews: 850, collaborations: 120 };
    } catch (e) {
      console.error("Error fetching metrics:", e);
      return {};
    }
  },

  async updateMetrics(metricsData) {
    try {
      await setDoc(doc(db, 'site', 'metrics'), metricsData);
    } catch (e) {
      console.error("Error updating metrics:", e);
      throw e;
    }
  },

  async getBooks() {
    const fetchFirestore = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'books'));
        const books = {};
        querySnapshot.forEach((doc) => {
          books[doc.id] = { id: doc.id, ...doc.data() };
        });
        if (Object.keys(books).length > 0) return books;
      } catch (e) {
        console.warn("Firestore getBooks error:", e);
      }
      return null;
    };

    const timeout = new Promise(resolve => setTimeout(() => resolve(null), 800));

    try {
      const result = await Promise.race([fetchFirestore(), timeout]);
      if (result) return { ...defaultBooks, ...result };
    } catch (e) {}

    return defaultBooks;
  },

  async getBook(id) {
    const strId = String(id);
    const fetchFirestore = async () => {
      try {
        const docRef = doc(db, 'books', strId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) return { id: docSnap.id, ...docSnap.data() };
      } catch (e) {
        console.warn("Firestore getBook error:", e);
      }
      return null;
    };

    const timeout = new Promise(resolve => setTimeout(() => resolve(null), 800));

    try {
      const result = await Promise.race([fetchFirestore(), timeout]);
      if (result) return result;
    } catch (e) {}

    return defaultBooks[strId] || null;
  },

  async addBook(bookData) {
    try {
      const docRef = await addDoc(collection(db, 'books'), bookData);
      return docRef.id;
    } catch (e) {
      console.error("Error adding book:", e);
      throw e;
    }
  },

  async updateBook(id, bookData) {
    try {
      const docRef = doc(db, 'books', id);
      await updateDoc(docRef, bookData);
    } catch (e) {
      console.error("Error updating book:", e);
      throw e;
    }
  },

  async deleteBook(id) {
    try {
      const docRef = doc(db, 'books', id);
      await deleteDoc(docRef);
    } catch (e) {
      console.error("Error deleting book:", e);
      throw e;
    }
  },

  async addInquiry(inquiryData) {
    try {
      inquiryData.createdAt = new Date().toISOString();
      const docRef = await addDoc(collection(db, 'inquiries'), inquiryData);
      return docRef.id;
    } catch (e) {
      console.error("Error adding inquiry:", e);
      throw e;
    }
  },

  async getInquiries() {
    try {
      const querySnapshot = await getDocs(collection(db, 'inquiries'));
      const inquiries = [];
      querySnapshot.forEach((doc) => {
        inquiries.push({ id: doc.id, ...doc.data() });
      });
      inquiries.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      return inquiries;
    } catch (e) {
      console.error("Error fetching inquiries:", e);
      return [];
    }
  }
};

window.DataStore = DataStore;
