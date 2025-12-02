// ===== 기본 설정 =====
const TOTAL_SHOTS = 5; // 총 촬영 횟수
const DURATION_SECONDS = 5; // 각 촬영 시간(초)

// ===== 페이지/버튼 DOM =====
const startPage = document.getElementById("start-page");
const framePage = document.getElementById("frame-page");
const recordPage = document.getElementById("record-page");
const resultPage = document.getElementById("result-page");

const goToFrameSelectBtn = document.getElementById("goToFrameSelectBtn");
const backToStartBtn = document.getElementById("backToStartBtn");
const backToStartFromFrameBtn = document.getElementById(
  "backToStartFromFrameBtn"
);
const backToCategoryBtn = document.getElementById("backToCategoryBtn");
const backToFrameBtn = document.getElementById("backToFrameBtn");
const frameConfirmBtn = document.getElementById("frameConfirmBtn");
const retryBtn = document.getElementById("retryBtn");

const categoryView = document.getElementById("category-view");
const frameView = document.getElementById("frame-view");
const categoryGridEl = document.getElementById("categoryGrid");
const frameGridEl = document.getElementById("frameGrid");

// ===== 촬영/캔버스 관련 DOM =====
const previewVideo = document.getElementById("previewVideo");
const previewCanvas = document.getElementById("previewCanvas");
const ctx = previewCanvas.getContext("2d");

const statusEl = document.getElementById("status");
const status1 = document.getElementById("status1");
const totalshot1 = document.getElementById("totalshot");
const shotLabelEl = document.getElementById("shotLabel");
const startBtn = document.getElementById("startBtn");

// ===== 결과 DOM =====
const combinedImageEl = document.getElementById("combinedImage");
const combinedVideoEl = document.getElementById("combinedVideo");

// ===== 상태 변수 =====
let stream = null;
let mediaRecorder = null;
let recordedChunks = [];
let countdownTimer = null;
let animationFrameId = null;

let currentShot = 0; // 0~4

// 각 촬영의 원본 영상 / 캡처 이미지
const recordedVideoUrls = new Array(TOTAL_SHOTS).fill(null);
const capturedDataUrls = new Array(TOTAL_SHOTS).fill(null);

// 프레임/오버레이 관련
let frameImagePath = "frame.png"; // 기본 프레임 파일명
let overlayImagePaths = [
  "overlay1.png",
  "overlay2.png",
  "overlay3.png",
  "overlay4.png",
  "overlay5.png",
];

const overlayImgs = [];
const overlayLoaded = [];

// 프레임 선택 상태
let selectedCategoryId = null;
let selectedFrameId = null;
let selectedFrameConfig = null;

// ===== 프레임 설정 (대분류 > 소분류 + 프리뷰 이미지) =====
const FRAME_CONFIG = [
  {
    id: "MMMM",
    label: "",
    desc: "",
    preview: "MMMM/category.png", // 대분류 프리뷰 이미지
    frames: [
      {
        id: "myemu",
        preview: "MMMM/thumb1.png", // 소분류 프리뷰 이미지
        frame: "MMMM/frame1.png", // 최종 합성에 사용할 frame 이미지
        overlays: [
          "MMMM/overlay1.png",
          "MMMM/overlay2.png",
          "MMMM/overlay3.png",
          "MMMM/overlay4.png",
          "MMMM/overlay5.png",
        ],
      },
      {
        id: "moi",
        preview: "MMMM/thumb2.png", // 소분류 프리뷰 이미지
        frame: "MMMM/frame2.png", // 최종 합성에 사용할 frame 이미지
        overlays: [
          "MMMM/overlay1.png",
          "MMMM/overlay2.png",
          "MMMM/overlay3.png",
          "MMMM/overlay4.png",
          "MMMM/overlay5.png",
        ],
      },
      {
        id: "3",
        preview: "MMMM/thumb3.png", // 소분류 프리뷰 이미지
        frame: "MMMM/frame3.png", // 최종 합성에 사용할 frame 이미지
        overlays: [
          "MMMM/overlay1.png",
          "MMMM/overlay2.png",
          "MMMM/overlay3.png",
          "MMMM/overlay4.png",
          "MMMM/overlay5.png",
        ],
      },
      {
        id: "4",
        preview: "MMMM/thumb4.png", // 소분류 프리뷰 이미지
        frame: "MMMM/frame4.png", // 최종 합성에 사용할 frame 이미지
        overlays: [
          "MMMM/overlay1.png",
          "MMMM/overlay2.png",
          "MMMM/overlay3.png",
          "MMMM/overlay4.png",
          "MMMM/overlay5.png",
        ],
      },
      {
        id: "5",
        preview: "MMMM/thumb5.png", // 소분류 프리뷰 이미지
        frame: "MMMM/frame5.png", // 최종 합성에 사용할 frame 이미지
        overlays: [
          "MMMM/overlay1.png",
          "MMMM/overlay2.png",
          "MMMM/overlay3.png",
          "MMMM/overlay4.png",
          "MMMM/overlay5.png",
        ],
      },
      // 여기에 다른 프레임 세트 추가 가능
    ],
  },
  {
    id: "MMMM2",
    label: "",
    desc: "",
    preview: "MMMM/category.png", // 대분류 프리뷰 이미지
    frames: [
      {
        id: "myemu",
        preview: "MMMM/thumb1.png", // 소분류 프리뷰 이미지
        frame: "MMMM/frame1.png", // 최종 합성에 사용할 frame 이미지
        overlays: [
          "MMMM/overlay1.png",
          "MMMM/overlay2.png",
          "MMMM/overlay3.png",
          "MMMM/overlay4.png",
          "MMMM/overlay5.png",
        ],
      },
      {
        id: "moi",
        preview: "MMMM/thumb2.png", // 소분류 프리뷰 이미지
        frame: "MMMM/frame2.png", // 최종 합성에 사용할 frame 이미지
        overlays: [
          "MMMM/overlay1.png",
          "MMMM/overlay2.png",
          "MMMM/overlay3.png",
          "MMMM/overlay4.png",
          "MMMM/overlay5.png",
        ],
      },
      {
        id: "3",
        preview: "MMMM/thumb3.png", // 소분류 프리뷰 이미지
        frame: "MMMM/frame3.png", // 최종 합성에 사용할 frame 이미지
        overlays: [
          "MMMM/overlay1.png",
          "MMMM/overlay2.png",
          "MMMM/overlay3.png",
          "MMMM/overlay4.png",
          "MMMM/overlay5.png",
        ],
      },
      {
        id: "4",
        preview: "MMMM/thumb4.png", // 소분류 프리뷰 이미지
        frame: "MMMM/frame4.png", // 최종 합성에 사용할 frame 이미지
        overlays: [
          "MMMM/overlay1.png",
          "MMMM/overlay2.png",
          "MMMM/overlay3.png",
          "MMMM/overlay4.png",
          "MMMM/overlay5.png",
        ],
      },
      {
        id: "5",
        preview: "MMMM/thumb5.png", // 소분류 프리뷰 이미지
        frame: "MMMM/frame5.png", // 최종 합성에 사용할 frame 이미지
        overlays: [
          "MMMM/overlay1.png",
          "MMMM/overlay2.png",
          "MMMM/overlay3.png",
          "MMMM/overlay4.png",
          "MMMM/overlay5.png",
        ],
      },
      // 여기에 다른 프레임 세트 추가 가능
    ],
  },
  {
    id: "MMMM3",
    label: "",
    desc: "",
    preview: "MMMM/category.png", // 대분류 프리뷰 이미지
    frames: [
      {
        id: "myemu",
        preview: "MMMM/thumb1.png", // 소분류 프리뷰 이미지
        frame: "MMMM/frame1.png", // 최종 합성에 사용할 frame 이미지
        overlays: [
          "MMMM/overlay1.png",
          "MMMM/overlay2.png",
          "MMMM/overlay3.png",
          "MMMM/overlay4.png",
          "MMMM/overlay5.png",
        ],
      },
      {
        id: "moi",
        preview: "MMMM/thumb2.png", // 소분류 프리뷰 이미지
        frame: "MMMM/frame2.png", // 최종 합성에 사용할 frame 이미지
        overlays: [
          "MMMM/overlay1.png",
          "MMMM/overlay2.png",
          "MMMM/overlay3.png",
          "MMMM/overlay4.png",
          "MMMM/overlay5.png",
        ],
      },
      {
        id: "3",
        preview: "MMMM/thumb3.png", // 소분류 프리뷰 이미지
        frame: "MMMM/frame3.png", // 최종 합성에 사용할 frame 이미지
        overlays: [
          "MMMM/overlay1.png",
          "MMMM/overlay2.png",
          "MMMM/overlay3.png",
          "MMMM/overlay4.png",
          "MMMM/overlay5.png",
        ],
      },
      {
        id: "4",
        preview: "MMMM/thumb4.png", // 소분류 프리뷰 이미지
        frame: "MMMM/frame4.png", // 최종 합성에 사용할 frame 이미지
        overlays: [
          "MMMM/overlay1.png",
          "MMMM/overlay2.png",
          "MMMM/overlay3.png",
          "MMMM/overlay4.png",
          "MMMM/overlay5.png",
        ],
      },
      {
        id: "5",
        preview: "MMMM/thumb5.png", // 소분류 프리뷰 이미지
        frame: "MMMM/frame5.png", // 최종 합성에 사용할 frame 이미지
        overlays: [
          "MMMM/overlay1.png",
          "MMMM/overlay2.png",
          "MMMM/overlay3.png",
          "MMMM/overlay4.png",
          "MMMM/overlay5.png",
        ],
      },
      // 여기에 다른 프레임 세트 추가 가능
    ],
  },
  // 다른 카테고리도 같은 형식으로 추가 가능
];

// ===== 프레임 내 사진/영상 배치 좌표 (frame.png 기준, px 단위) =====
const photoLayoutPx = [
  { x: 100, y: 200, width: 640, height: 480 }, // 1
  { x: 100, y: 780, width: 640, height: 480 }, // 2
  { x: 100, y: 1360, width: 640, height: 480 }, // 3
  { x: 840, y: 200, width: 640, height: 480 }, // 4
  { x: 840, y: 780, width: 640, height: 480 }, // 5
];

// ===== 유틸: 이미지 로더 =====
function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

// ===== 오버레이 이미지 로딩 =====
function loadOverlays() {
  overlayImgs.length = 0;
  overlayLoaded.length = 0;

  for (let i = 0; i < TOTAL_SHOTS; i++) {
    const img = new Image();
    overlayImgs.push(img);
    overlayLoaded.push(false);

    img.onload = () => {
      overlayLoaded[i] = true;
      console.log(`오버레이 ${i + 1} 로드 완료: ${overlayImagePaths[i]}`);
    };

    img.src = overlayImagePaths[i];
  }
}

// ===== 카메라 + 캔버스 렌더링 =====
function drawLoop() {
  if (!stream) {
    animationFrameId = requestAnimationFrame(drawLoop);
    return;
  }

  const videoWidth = previewVideo.videoWidth;
  const videoHeight = previewVideo.videoHeight;

  if (videoWidth && videoHeight) {
    previewCanvas.width = videoWidth;
    previewCanvas.height = videoHeight;

    // 1) 웹캠 영상 좌우 반전
    ctx.save();
    ctx.translate(previewCanvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(
      previewVideo,
      0,
      0,
      previewCanvas.width,
      previewCanvas.height
    );
    ctx.restore();

    // 2) 현재 회차에 맞는 오버레이 덮기
    const overlayIndex = Math.min(currentShot, TOTAL_SHOTS - 1);
    const overlayImg = overlayImgs[overlayIndex];

    if (overlayImg && overlayLoaded[overlayIndex]) {
      ctx.drawImage(
        overlayImg,
        0,
        0,
        previewCanvas.width,
        previewCanvas.height
      );
    }
  }

  animationFrameId = requestAnimationFrame(drawLoop);
}

async function initCamera() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    throw new Error("이 브라우저는 웹캠을 지원하지 않습니다.");
  }

  // 이미 스트림이 있으면 재사용
  if (!stream) {
    stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: false,
    });
    previewVideo.srcObject = stream;
  }

  previewVideo.addEventListener(
    "loadedmetadata",
    () => {
      previewVideo.play();
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      drawLoop();
    },
    { once: true }
  );
}

// ===== 1회 촬영 시작/종료 =====
function startRecordingForCurrentShot() {
  if (!stream) {
    throw new Error("카메라 스트림이 없습니다.");
  }
  if (currentShot >= TOTAL_SHOTS) {
    //statusEl.textContent = "이미 모든 촬영이 완료되었습니다.";
    startBtn.disabled = true;
    return;
  }

  recordedChunks = [];

  const shotIndex = currentShot;
  const shotNumForUI = shotIndex + 1;

  // 캔버스 스트림으로 녹화
  const canvasStream = previewCanvas.captureStream(30);
  mediaRecorder = new MediaRecorder(canvasStream);

  mediaRecorder.ondataavailable = (event) => {
    if (event.data && event.data.size > 0) {
      recordedChunks.push(event.data);
    }
  };

  mediaRecorder.onstop = async () => {
    // 1) 개별 영상 URL 저장
    const blob = new Blob(recordedChunks, { type: "video/webm" });
    const videoURL = URL.createObjectURL(blob);
    recordedVideoUrls[shotIndex] = videoURL;

    // 2) 마지막 프레임 캡쳐 → 합성용
    captureLastFrame(shotIndex);

    // 3) 카운트다운 정리
    if (countdownTimer) {
      clearInterval(countdownTimer);
      countdownTimer = null;
    }

    // 4) 다음 회차 or 합성
    currentShot++;

    if (currentShot < TOTAL_SHOTS) {
      const nextShotNum = currentShot + 1;
      shotLabelEl.textContent = String(nextShotNum);
      //statusEl.textContent = `총 ${TOTAL_SHOTS}번 중 ${nextShotNum}번째 촬영을 자동으로 시작합니다.`;
      //startBtn.textContent = "촬영 진행 중...";
      startBtn.disabled = true;

      setTimeout(() => {
        startRecordingForCurrentShot();
      }, 800);
    } else {
      // 모든 촬영 완료 → 결과 페이지 + 합성
      //statusEl.textContent = `${TOTAL_SHOTS}회 촬영이 끝났습니다. 프레임을 적용해 합성 중입니다...`;

      recordPage.classList.add("hidden");
      resultPage.classList.remove("hidden");
      startBtn.disabled = true;

      (async () => {
        try {
          await createCombinedImage();
          await createCombinedVideo();
          //statusEl.textContent = `${TOTAL_SHOTS}회 촬영 및 합성이 모두 완료되었습니다.`;
        } catch (err) {
          console.error(err);
          //statusEl.textContent = "합성 과정에서 오류가 발생했습니다.";
        }
      })();
    }
  };

  // 녹화 시작
  mediaRecorder.start();
  startBtn.disabled = true;

  // 카운트다운
  let remaining = DURATION_SECONDS;
  //statusEl.textContent = `${shotNumForUI}번째 촬영 녹화 중... (${remaining}초 남음)`;
  status1.textContent = `${remaining}`;
  countdownTimer = setInterval(() => {
    remaining -= 1;
    if (remaining > 0) {
      //statusEl.textContent = `${shotNumForUI}번째 촬영 녹화 중... (${remaining}초 남음)`;
      status1.textContent = `${remaining}`;
    } else {
      clearInterval(countdownTimer);
      countdownTimer = null;
      status1.textContent = `준비!`;
      //statusEl.textContent = `${shotNumForUI}번째 촬영 녹화를 종료하는 중...`;

      if (mediaRecorder && mediaRecorder.state === "recording") {
        mediaRecorder.stop();
      }
    }
  }, 1000);

  // 안전 장치
  setTimeout(() => {
    if (mediaRecorder && mediaRecorder.state === "recording") {
      mediaRecorder.stop();
    }
  }, DURATION_SECONDS * 1000);
}

// 캔버스 마지막 프레임 캡쳐
function captureLastFrame(shotIndex) {
  const width = previewCanvas.width || 640;
  const height = previewCanvas.height || 480;

  const tempCanvas = document.createElement("canvas");
  tempCanvas.width = width;
  tempCanvas.height = height;
  const tempCtx = tempCanvas.getContext("2d");

  tempCtx.drawImage(previewCanvas, 0, 0, width, height);

  const imageUrl = tempCanvas.toDataURL("image/png");
  capturedDataUrls[shotIndex] = imageUrl;
}

// ===== 프레임 합성: 이미지 =====
async function createCombinedImage() {
  const photoUrls = capturedDataUrls.filter((url) => !!url);
  if (photoUrls.length === 0) {
    console.warn("합성할 사진이 없습니다.");
    return;
  }

  const photoImages = await Promise.all(photoUrls.map((url) => loadImage(url)));
  const frameImg = await loadImage(frameImagePath);

  const canvas = document.createElement("canvas");
  canvas.width = frameImg.width;
  canvas.height = frameImg.height;
  const cctx = canvas.getContext("2d");

  const count = photoImages.length;
  for (let i = 0; i < count; i++) {
    const imgObj = photoImages[i];
    const slot = photoLayoutPx[i] || photoLayoutPx[photoLayoutPx.length - 1];

    cctx.drawImage(imgObj, slot.x, slot.y, slot.width, slot.height);
  }

  cctx.drawImage(frameImg, 0, 0, canvas.width, canvas.height);

  const finalUrl = canvas.toDataURL("image/png");
  combinedImageEl.src = finalUrl;
}

// ===== 프레임 합성: 동영상 =====
async function createCombinedVideo() {
  const frameImg = await loadImage(frameImagePath);

  const videos = recordedVideoUrls
    .filter((url) => !!url)
    .map((url) => {
      const v = document.createElement("video");
      v.src = url;
      v.muted = true;
      v.playsInline = true;
      return v;
    });

  if (videos.length === 0) {
    console.warn("합성할 동영상이 없습니다.");
    return;
  }

  // 비디오 로드 및 재생 준비
  await Promise.all(
    videos.map(
      (vid) =>
        new Promise((resolve) => {
          vid.onloadedmetadata = () => {
            vid.currentTime = 0;
            vid.play().then(resolve).catch(resolve);
          };
        })
    )
  );

  const canvas = document.createElement("canvas");
  canvas.width = frameImg.width;
  canvas.height = frameImg.height;
  const cctx = canvas.getContext("2d");

  const stream = canvas.captureStream(30);
  const recorder = new MediaRecorder(stream);
  const chunks = [];

  recorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) {
      chunks.push(e.data);
    }
  };

  const videoPromise = new Promise((resolve) => {
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: "video/webm" });
      const url = URL.createObjectURL(blob);
      resolve(url);
    };
  });

  recorder.start();

  const durationMs = DURATION_SECONDS * 1000;
  const startTime = performance.now();

  function render(now) {
    const elapsed = now - startTime;

    cctx.clearRect(0, 0, canvas.width, canvas.height);

    const count = videos.length;
    for (let i = 0; i < count; i++) {
      const vid = videos[i];
      const slot = photoLayoutPx[i] || photoLayoutPx[photoLayoutPx.length - 1];
      cctx.drawImage(vid, slot.x, slot.y, slot.width, slot.height);
    }

    cctx.drawImage(frameImg, 0, 0, canvas.width, canvas.height);

    if (elapsed < durationMs && recorder.state === "recording") {
      requestAnimationFrame(render);
    } else {
      recorder.stop();
      videos.forEach((v) => v.pause());
    }
  }

  requestAnimationFrame(render);

  const combinedUrl = await videoPromise;
  combinedVideoEl.src = combinedUrl;
}

// ===== 프레임 선택 UI 렌더링 =====
function renderCategories() {
  categoryGridEl.innerHTML = "";
  FRAME_CONFIG.forEach((cat) => {
    const card = document.createElement("div");
    card.className = "card";
    card.dataset.categoryId = cat.id;

    card.innerHTML = `
      <img src="${cat.preview}" alt="${cat.label}" />
    `;

    card.addEventListener("click", () => {
      onCategorySelected(cat);
    });

    categoryGridEl.appendChild(card);
  });
}

function onCategorySelected(category) {
  selectedCategoryId = category.id;
  selectedFrameId = null;
  selectedFrameConfig = null;
  frameConfirmBtn.disabled = true;

  // 소분류 카드 렌더링
  renderFrames(category);

  // UI 전환: 카테고리뷰 숨기고 프레임뷰 보여주기
  categoryView.classList.add("hidden");
  frameView.classList.remove("hidden");
}

function renderFrames(category) {
  frameGridEl.innerHTML = "";

  category.frames.forEach((frame) => {
    const card = document.createElement("div");
    card.className = "card";
    card.dataset.frameId = frame.id;

    card.innerHTML = `
      <img src="${frame.preview}" alt="${frame.label}" />
    `;

    card.addEventListener("click", () => {
      selectedFrameId = frame.id;
      selectedFrameConfig = frame;
      frameConfirmBtn.disabled = false;
      highlightFrameCards();
    });

    frameGridEl.appendChild(card);
  });
}

function highlightFrameCards() {
  const cards = frameGridEl.querySelectorAll(".card");
  cards.forEach((card) => {
    if (card.dataset.frameId === selectedFrameId) {
      card.classList.add("active");
    } else {
      card.classList.remove("active");
    }
  });
}

// ===== 이벤트 바인딩 =====

// 시작하기 → 프레임 선택 페이지
goToFrameSelectBtn.addEventListener("click", () => {
  startPage.classList.add("hidden");
  framePage.classList.remove("hidden");
});

// 대분류 화면에서 "처음으로"
backToStartBtn.addEventListener("click", () => {
  framePage.classList.add("hidden");
  startPage.classList.remove("hidden");
});

// 소분류 화면에서 "처음으로"
backToStartFromFrameBtn.addEventListener("click", () => {
  framePage.classList.add("hidden");
  startPage.classList.remove("hidden");

  // 상태 리셋
  frameView.classList.add("hidden");
  categoryView.classList.remove("hidden");
  frameConfirmBtn.disabled = true;
  selectedCategoryId = null;
  selectedFrameId = null;
  selectedFrameConfig = null;
  renderCategories();
});

// 소분류 화면에서 "대분류 다시 선택"
backToCategoryBtn.addEventListener("click", () => {
  frameView.classList.add("hidden");
  categoryView.classList.remove("hidden");
  frameConfirmBtn.disabled = true;
  selectedFrameId = null;
  selectedFrameConfig = null;
});

// 촬영 화면에서 "프레임 다시 선택"
backToFrameBtn.addEventListener("click", () => {
  // 녹화/카운트다운 중이면 정리
  if (countdownTimer) {
    clearInterval(countdownTimer);
    countdownTimer = null;
  }
  if (mediaRecorder && mediaRecorder.state === "recording") {
    mediaRecorder.stop();
  }

  // 버튼/상태 초기화
  startBtn.disabled = true;
  //startBtn.textContent = `1번 촬영 시작 (${DURATION_SECONDS}초)`;
  currentShot = 0;
  shotLabelEl.textContent = "1";

  // 페이지 전환: 촬영 -> 프레임 선택(소분류 화면 유지)
  recordPage.classList.add("hidden");
  framePage.classList.remove("hidden");
  categoryView.classList.add("hidden");
  frameView.classList.remove("hidden");
});

// 프레임 확정 → 촬영 페이지 + 카메라 준비
frameConfirmBtn.addEventListener("click", async () => {
  if (!selectedFrameConfig) return;

  // 선택된 프레임/오버레이 설정
  frameImagePath = selectedFrameConfig.frame;
  overlayImagePaths = selectedFrameConfig.overlays.slice(0, TOTAL_SHOTS);
  loadOverlays();

  framePage.classList.add("hidden");
  recordPage.classList.remove("hidden");

  //statusEl.textContent = "카메라를 준비 중입니다...";
  startBtn.disabled = true;

  try {
    await initCamera();
    currentShot = 0;
    shotLabelEl.textContent = "1";
    totalshot1.textContent = `${TOTAL_SHOTS}`;
    //statusEl.textContent =
    // `총 ${TOTAL_SHOTS}번 중 1번째 촬영입니다. 버튼을 누르면 ` +
    //`${DURATION_SECONDS}초 동안 촬영이 시작되고 이후 자동으로 진행됩니다.`;
    startBtn.innerHTML = `<span class="hover-underline">Click to Start!</span>`;
    startBtn.disabled = false;
  } catch (err) {
    console.error(err);
    //statusEl.textContent = "카메라를 사용할 수 없습니다: " + err.message;
    startBtn.disabled = false;
  }
});

// 촬영 시작 버튼
startBtn.addEventListener("click", () => {
  for (let i = 0; i < TOTAL_SHOTS; i++) {
    if (recordedVideoUrls[i]) {
      URL.revokeObjectURL(recordedVideoUrls[i]);
      recordedVideoUrls[i] = null;
    }
    capturedDataUrls[i] = null;
  }
  combinedImageEl.removeAttribute("src");
  combinedVideoEl.removeAttribute("src");

  currentShot = 0;
  //shotLabelEl.textContent = "1";
  //startBtn.textContent = "촬영 진행 중...";
  startRecordingForCurrentShot();
});

// 결과 페이지에서 "같은 프레임으로 다시 촬영"
retryBtn.addEventListener("click", () => {
  currentShot = 0;

  for (let i = 0; i < TOTAL_SHOTS; i++) {
    if (recordedVideoUrls[i]) {
      URL.revokeObjectURL(recordedVideoUrls[i]);
      recordedVideoUrls[i] = null;
    }
    capturedDataUrls[i] = null;
  }

  combinedImageEl.removeAttribute("src");
  combinedVideoEl.removeAttribute("src");

  resultPage.classList.add("hidden");
  recordPage.classList.remove("hidden");
  status1.textContent = "준비!";
  shotLabelEl.textContent = "1";
  //statusEl.textContent =
  //`총 ${TOTAL_SHOTS}번 중 1번째 촬영입니다. 버튼을 누르면 ` +
  //`${DURATION_SECONDS}초 동안 촬영이 시작되고 이후 자동으로 진행됩니다.`;
  startBtn.innerHTML = `<span class="hover-underline">Click to Start!</span>`;
  startBtn.disabled = false;
});

// 페이지 로드시 대분류 카드 렌더링
window.addEventListener("load", () => {
  renderCategories();
});
