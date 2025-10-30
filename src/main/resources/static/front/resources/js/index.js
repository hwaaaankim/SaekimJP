// ===== 엘리먼트 참조 =====
const topbarFill = document.querySelector('#main .mainv_container .progress-topbar__fill');
const progressCircle = document.querySelector('#main .mainv_container .autoplay-progress svg');
const progressContent = document.querySelector('#main .mainv_container .autoplay-progress span');

// ===== 타이밍 =====
const AUTOPLAY_DELAY = 5000; // 5초
const SPEED_MS = 800;  // 페이드 전환 속도

// ===== Swiper 초기화 =====
const swiper = new Swiper('.mySwiper', {
	slidesPerView: 1,
	spaceBetween: 30,
	centeredSlides: true,

	effect: 'fade',
	fadeEffect: { crossFade: true },
	speed: SPEED_MS,

	autoplay: {
		delay: AUTOPLAY_DELAY,
		// disableOnInteraction: false,
	},

	on: {
		init(s) {
			resetAllKB(s);
			// 초기 표시: 경과 0 → 숫자 1, 원형 0%, 상단바 0%
			updateTopbar(0);
			updateCircular(0);
			updateCountUp(0);
		},
		slideChangeTransitionStart(s) {
			resetAllKB(s);
			// 새 사이클 시작점 초기화
			updateTopbar(0);
			updateCircular(0);
			updateCountUp(0);
		},
		autoplayTimeLeft(s, time, progress) {
			// Swiper가 주는 time=남은 ms, progress=경과 비율(0→1)
			const elapsedMs = Math.max(0, AUTOPLAY_DELAY - time);
			const ratio = Math.max(0, Math.min(1, elapsedMs / AUTOPLAY_DELAY)); // 0→1 (경과)

			// 상단바/원형/숫자 모두 '경과' 기준으로 업데이트
			updateTopbar(ratio);      // 0→1로 차오름
			updateCircular(ratio);    // 시계방향으로 채워짐
			updateCountUp(elapsedMs); // 1→5로 증가

			// Ken Burns: 0→1로 증가 → scale 1→1.2
			const active = s.slides[s.activeIndex];
			if (active) {
				const bg = active.querySelector('.kb-bg');
				if (bg) bg.style.setProperty('--kb', ratio.toFixed(4));
			}
		},
	},
});

// ===== 헬퍼 =====
function resetAllKB(s) {
	s.slides.forEach(sl => {
		const bg = sl.querySelector('.kb-bg');
		if (bg) bg.style.setProperty('--kb', '0');
	});
}

// 상단바: 0~1
function updateTopbar(ratio01) {
	if (!topbarFill) return;
	topbarFill.style.width = (ratio01 * 100).toFixed(2) + '%';
}

// 원형: 0~1 (시계방향 채움)
function updateCircular(ratio01) {
	if (!progressCircle) return;
	// CSS에서 stroke-dashoffset이 (1 - --progress)로 계산되므로, 0→1로 증가시키면 채워집니다.
	progressCircle.style.setProperty('--progress', ratio01);
}

// 숫자: 1 → 5 증가 (경과 기준)
function updateCountUp(elapsedMs) {
	if (!progressContent) return;
	// 경과 초를 0~5로 환산해 1~5로 보여줌
	// 0ms~999ms => 1, 1000ms~1999ms => 2, ..., 4000ms~ => 5
	const sec = Math.min(5, Math.max(1, 1 + Math.floor(elapsedMs / 1000)));
	progressContent.textContent = String(sec);
}

(function() {
	const headerEl = document.querySelector('header');
	const topbarEl = document.querySelector('#main .mainv_container .progress-topbar');
	if (!headerEl || !topbarEl) return;

	function syncTopbarVisibility() {
		const hide = headerEl.classList.contains('scroll');
		topbarEl.classList.toggle('is-hidden', hide);
	}

	// 1) 초기 상태 반영
	syncTopbarVisibility();

	// 2) header class 변경 감시 (가장 정확)
	const mo = new MutationObserver(syncTopbarVisibility);
	mo.observe(headerEl, { attributes: true, attributeFilter: ['class'] });

	// 3) 혹시 모를 누락 대비(스크롤 이벤트로도 한 번 더 동기화)
	window.addEventListener('scroll', syncTopbarVisibility, { passive: true });
})();
var control = document.getElementById('control');
var bar = document.querySelector('.bar');
var value = document.querySelector('.value');
var order = 0;

var RADIUS = 170;
var CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function progress(per) {
	var progress = per / 100;
	var dashoffset = CIRCUMFERENCE * (1 - progress);

	if (per == 1) {
		$(".bg-list_item").removeClass("tl-bg2 tl-bg3 tl-bg4 tl-bg5");
		value.innerHTML = "담당의 상담";
	} else if (per == 20) {
		$(".bg-list_item").addClass("tl-bg2");
		value.innerHTML = "맞춤 전략수립";
	} else if (per == 40) {
		$(".bg-list_item").addClass("tl-bg3");
		value.innerHTML = "수술 진행";
	} else if (per == 60) {
		$(".bg-list_item").addClass("tl-bg4");
		value.innerHTML = "회복 관리";
	} else if (per == 80) {
		$(".bg-list_item").addClass("tl-bg5");
		value.innerHTML = "사후 관리";
	}
	bar.style.strokeDashoffset = dashoffset;
}

control.addEventListener('input', function(event) {
	progress(event.target.valueAsNumber);
});
control.addEventListener('change', function(event) {
	progress(event.target.valueAsNumber);
});

bar.style.strokeDasharray = CIRCUMFERENCE;
progress(0);
move();

var dayStudy = setInterval(move, 9000);
function handleVisibilityChange() {
	if (document.hidden) {
		clearInterval(dayStudy);
		return;
	}
};

function move() {
	var start = 0;
	var end = 100;
	var id = setInterval(frame, 80);

	function frame() {
		if (start >= end) {
			clearInterval(id);
		} else {

			if (document.hidden) {
				return;
			}

			start += 1;
			progress(start);
		}
	}
}

document.addEventListener("visibilitychange", handleVisibilityChange, false);
function sampleMessage() {
	alert('연결 페이지를 지정할 수 있습니다.');
}

document.querySelectorAll('.index-morebtn').forEach($btn => {
	$btn.addEventListener('click', () => {
		const key = $btn.getAttribute('data-target');
		// 예: 페이지 이동 규칙
		const map = {
			eyes: '/front/service/eyes',
			contour: '/front/service/contour',
			nose: '/front/service/nose',
			lifting: '/front/service/lifting',
		};
		const url = map[key] || '#';
		if (url && url !== '#') location.href = url;
	});
});