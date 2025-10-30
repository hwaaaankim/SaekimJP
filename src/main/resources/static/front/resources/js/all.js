function systab_Click(_type, _numb) {
	if (_type === "suup") {
		const max = 6;
		const n = parseInt(_numb, 10);

		// 1) 탭 focus 토글
		for (let i = 1; i <= max; i++) {
			$("#li_systab" + i).toggleClass("focus", i === n);
			$("#sysTab" + i).toggleClass("focus", i === n);
		}

		// 2) AOS 초기화 (선택된 탭 외 모든 탭 파트 AOS 속성 제거)
		for (let i = 1; i <= max; i++) {
			if (i === n) continue;
			clearAOSForTab(i);
		}

		// 3) 선택된 탭 파트에 AOS 설정 (딜레이 순차 적용)
		applyAOSForTab(n);

		// 4) AOS 다시 초기화(재트리거)
		if (window.AOS) {
			try {
				AOS.init();
			} catch (e) {
				// 안전하게 무시
			}
		}
	} else if (_type === "level") {
		// 기존 3개 탭 로직 유지
		const n = String(_numb);
		$("#li_certiTab1").toggleClass("focus", n === "1");
		$("#li_certiTab2").toggleClass("focus", n === "2");
		$("#li_certiTab3").toggleClass("focus", n === "3");

		$("#certiTab1").toggleClass("focus", n === "1");
		$("#certiTab2").toggleClass("focus", n === "2");
		$("#certiTab3").toggleClass("focus", n === "3");

		if (window.AOS) {
			try {
				AOS.init();
			} catch (e) { }
		}
	}
}

/**
 * 특정 탭의 AOS 속성 제거 + 클래스 초기화
 * 탭 n에 대해:
 *  - 제목 소제목 본문 이미지 순으로 .part{n}1 ~ .part{n}4
 */
function clearAOSForTab(n) {
	const sels = [
		".subSTit.part" + n + "1",
		".subTit.part" + n + "2",
		".subTxt.part" + n + "3",
		".img_wrap.part" + n + "4"
	];

	sels.forEach(sel => {
		const $el = $(sel);
		// AOS 클래스 제거
		$el.removeClass("aos-init aos-animate");
		// AOS 속성 제거 (jQuery는 한 번에 여러 속성 제거가 되지 않으므로 각각)
		$el.removeAttr("data-aos");
		$el.removeAttr("data-aos-duration");
		$el.removeAttr("data-aos-delay");
	});
}

/**
 * 특정 탭의 요소들에 AOS 속성 부여
 * - 순서: subSTit(100ms), subTit(200ms), subTxt(300ms), img_wrap(400ms)
 * - 지속시간 1000ms 고정 (필요시 조정)
 */
function applyAOSForTab(n) {
	setAOS(".subSTit.part" + n + "1", 100);
	setAOS(".subTit.part" + n + "2", 200);
	setAOS(".subTxt.part" + n + "3", 300);
	setAOS(".img_wrap.part" + n + "4", 400);
}

function setAOS(selector, delay) {
	const $el = $(selector);
	// 이전 상태 정리
	$el.removeClass("aos-init aos-animate")
		.removeAttr("data-aos")
		.removeAttr("data-aos-duration")
		.removeAttr("data-aos-delay");

	// AOS 속성 재부여
	$el.attr("data-aos", "fade-up")
		.attr("data-aos-duration", "1000")
		.attr("data-aos-delay", String(delay));
}

function Scroll_Top() {
	$("html, body").animate({ scrollTop: 0 }, 400);
	return false;
}

function Class_Click(c) {
	var cl = $(c).attr("class");
	console.log(cl);
	if (cl == "") {
		$(c).addClass("open");
		$(".family-box").addClass(" open");
	} else {
		$(c).removeClass("open");
		$(".family-box").removeClass(" open");
	}
}

function openWindow(url, winName, features) {
	window.open(url, winName, features);
}

function openHamburger() {
	if ($(".mobile-gnb-wrap").hasClass("on")) {
		$("#header").removeClass("open");
		$(".ham").removeClass("on");
		$(".mobile-gnb-wrap").removeClass("on");
		$("#hamBody").removeClass("open");
		$("#hamHtml").removeClass("open");
	} else {
		$("#header").addClass("open");
		$(".ham").addClass("on");
		$(".mobile-gnb-wrap").addClass("on");
		$("#hamBody").addClass("open");
		$("#hamHtml").addClass("open");
	}
}

function openBook() {
	if ($(".series a").hasClass("open")) {
		$(".series a").removeClass("open");
		$(".series-box").removeClass("open");
	} else {
		$(".series a").addClass("open");
		$(".series-box").addClass("open");
	}
}

function openMobileGnbItem(menu) {
	if (menu == "engloo") {
		if ($(".mobile-gnb_list li:nth-child(1)").hasClass("open")) {
			$(".mobile-gnb_list li:nth-child(1)").removeClass("open");
		} else {
			$(".mobile-gnb_item").removeClass("open");
			$(".mobile-gnb_list li:nth-child(1)").addClass("open");
		}
	} else if (menu == "book") {
		if ($(".mobile-gnb_list li:nth-child(2)").hasClass("open")) {
			$(".mobile-gnb_list li:nth-child(2)").removeClass("open");
		} else {
			$(".mobile-gnb_item").removeClass("open");
			$(".mobile-gnb_list li:nth-child(2)").addClass("open");
		}
	} else if (menu == "program") {
		if ($(".mobile-gnb_list li:nth-child(3)").hasClass("open")) {
			$(".mobile-gnb_list li:nth-child(3)").removeClass("open");
		} else {
			$(".mobile-gnb_item").removeClass("open");
			$(".mobile-gnb_list li:nth-child(3)").addClass("open");
		}
	} else if (menu == "commu") {
		if ($(".mobile-gnb_list li:nth-child(4)").hasClass("open")) {
			$(".mobile-gnb_list li:nth-child(4)").removeClass("open");
		} else {
			$(".mobile-gnb_item").removeClass("open");
			$(".mobile-gnb_list li:nth-child(4)").addClass("open");
		}
	} else if (menu == "cam") {
		if ($(".mobile-gnb_list li:nth-child(5)").hasClass("open")) {
			$(".mobile-gnb_list li:nth-child(5)").removeClass("open");
		} else {
			$(".mobile-gnb_item").removeClass("open");
			$(".mobile-gnb_list li:nth-child(5)").addClass("open");
		}
	} else if (menu == "fran") {
		if ($(".mobile-gnb_list li:nth-child(6)").hasClass("open")) {
			$(".mobile-gnb_list li:nth-child(6)").removeClass("open");
		} else {
			$(".mobile-gnb_item").removeClass("open");
			$(".mobile-gnb_list li:nth-child(6)").addClass("open");
		}
	}
}

function moveToIceMall() {
	alert("로그인 후 이용해주세요.");
	location.href = "/front/join/login.php";
}

var main = {
	stageData: { _y: 0, _w: 0, _h: 0 },
	agent: null,
	btnTopFlag: false,

	init: function() {
		$(window).scroll(function() {
			var scroll = $(window).scrollTop();

			if ($(".bsc_container").length) {
				var bsc_container_location = 10;

				if (scroll >= bsc_container_location) {
					$("#header").addClass("scroll");
					$(".onepage-pagination").addClass("active");
				} else {
					$("#header").removeClass("scroll");
					$(".onepage-pagination").removeClass("active");
				}
			}

			var anchorSystem = 847;
			var anchorCurri = 5383;
			var anchorCerti = 7935;
			$("input:radio[name='bullet']").prop("checked", false);

			if (scroll >= anchorCerti) {
				$("#bullet01").removeClass("on");
				$("#bullet02").removeClass("on");
				$("#bullet03").addClass("on");
			} else if (scroll >= anchorCurri && scroll < anchorCerti) {
				$("#bullet03").removeClass("on");
				$("#bullet01").removeClass("on");
				$("#bullet02").addClass("on");
			} else if (scroll >= anchorSystem) {
				$("#bullet03").removeClass("on");
				$("#bullet02").removeClass("on");
				$("#bullet01").addClass("on");
			}
		});

		$(function() {
			$("#header").mouseenter(function() {
				$("#header").addClass("on");
			});
			$("#header").mouseleave(function() {
				$("#header").removeClass("on");
			});

			$(".opg-bullet").on({
				mouseover: function() {
					$(this).addClass("on");
				},
				mouseleave: function() {
					$(this).removeClass("on");
				},
			});
		});

		$(window).scroll(function() {
			if ($(".bsc_container").length) {
				var bsc_container_location = $(".bsc_container").position().top;
				if ($(this).scrollTop() > bsc_container_location) {
					$(".btn_top").fadeIn(function() {
						$(this).css("display", "flex");
					});
				} else {
					$(".btn_top").fadeOut();
				}
			} else {
				if ($(this).scrollTop() > 200) {
					$(".btn_top").fadeIn(function() {
						$(this).css("display", "flex");
					});
				} else {
					$(".btn_top").fadeOut();
				}
			}
		});

		this.setStageData();
		this.scroll();
		this.resize();
	},

	allListSort: function() {
		if ($(".item_02").find(".btn_more").hasClass("actived")) {
			$(".item_02").find(".hide").removeClass("actived");
			$(".item_02").find(".btn_more").removeClass("actived");
		} else {
			$(".item_02").find(".hide").addClass("actived");
			$(".item_02").find(".btn_more").addClass("actived");
		}
	},

	scroll: function() {
		this.setStageData();
		var btnTop = $("#btn_top");

		if (main.stageData._y >= 100) {
			if (!main.btnTopFlag) {
				btnTop.stop(true).fadeIn(300);
			}
			main.btnTopFlag = true;
		} else {
			if (main.btnTopFlag) {
				btnTop.stop(true).fadeOut(300);
			}
			main.btnTopFlag = false;
		}
	},

	resize: function() {
		this.setStageData();
		this.scroll();
	},

	setStageData: function() {
		main.stageData._y = $(window).scrollTop();
		main.stageData._w = $(window).width();
		main.stageData._h = $(window).height();
	},

	checkMedia: function() {
		var UserAgent = navigator.userAgent;
		var UserFlag = true;
		if (
			UserAgent.match(
				/iPhone|iPad|iPod|Android|Windows CE|BlackBerry|Symbian|Windows Phone|webOS|Opera Mini|Opera Mobi|POLARIS|IEMobile|lgtelecom|nokia|SonyEricsson/i
			) != null ||
			UserAgent.match(/LG|SAMSUNG|Samsung/) != null
		)
			UserFlag = false;
		return UserFlag;
	},
};

$(".btn_id").on("mouseenter mouseleave focusin focusout", function(e) {
	if (e.type == "mouseenter" || e.type == "focusin") {
		$(this).find(".drop_down ul").stop(true).slideDown(150);
	} else {
		$(this).find(".drop_down ul").stop(true).slideUp(150);
	}
});

var content = {
	stageW: 0,
	stageH: 0,
	posY: 0,
	data: [],
	target: null,
	pageCur: -1,
	navCur: -1,
	len: -1,

	init: function() {
		var _this = this;

		agent = main.checkMedia();

		_this.target = $(".content");
		_this.len = _this.target.find("> div").length;
		_this.stageW = $(window).width();
		_this.stageH = $(window).height();
		_this.posY = $(window).scrollTop();

		_this.setData();
		_this.resize();
		_this.scroll();

		$(window).on("scroll", function() {
			content.scroll();
		});

		$(window).on("resize", function() {
			content.resize();
		});
	},

	resize: function() {
		this.stageW = $(window).width();
		this.stageH = $(window).height();
		this.action.pageResize();
	},

	scroll: function() {
		this.posY = $(window).scrollTop();
		this.event.activeHandler(this.posY);
	},

	moveContent: function(_index) {
		var _y = this.target.find("> div").eq(_index).offset().top;
		content.action.move(_y);
	},

	setData: function() {
		content.target.find("> div").each(function() {
			var _index = $(this).index(),
				_target = $(this);

			content.data[_index] = {
				index: _index,
				target: _target,
				flag: true,

				init: function() {
					var _this = this;
				},

				play: function(posY) {
					var _this = this;

					if (agent && _this.flag == true) {
						var _i = 0;
						_this.target.find(".e_wrap").each(function() {
							var _delay = _i * 0.15 + 0.5;
							$(this)
								.css({ "transition-delay": _delay + "s" })
								.addClass("open");
							_i++;
						});

						if (_this.index == 0) {
						} else if (_this.index == 1) {
						}

						_this.target.addClass("open");
					}
					_this.flag = false;
				},

				reset: function() {
					var _this = this;
					if (agent) {
						_this.target.removeClass("open");

						_this.target.find(".e_wrap").each(function() { });

						if (_this.index == 0) {
						} else if (_this.index == 1) {
						}
					}
					_this.flag = true;
				},
			};

			content.data[_index].init();
			content.data[_index].reset();
			if (
				content.posY > content.target.offset().top &&
				content.posY >= $(this).offset().top - content.stageH - 100
			)
				content.data[_index].play();
		});
	},

	action: {
		move: function(_y) {
			$("html , body").stop(true).animate({ scrollTop: _y }, 600);
		},

		pageHandler: function(_y) {
			if (content.pageCur >= 0) {
				content.data[content.pageCur].play(_y);
			}
		},

		pageResize: function() { },
	},

	event: {
		navHandler: function(index) { },

		activeHandler: function(index) {
			var _bottomHeight = content.stageH - 100,
				_topHeight = 110;

			content.target.find("> div").each(function() {
				if ($(this).index() != content.len - 1) {
					if (
						index >= $(this).offset().top - _bottomHeight &&
						index <= $(this).next().offset().top - _bottomHeight
					) {
						content.pageCur = $(this).index();
					}
					if (
						index >= $(this).offset().top - _topHeight &&
						index <= $(this).next().offset().top - _topHeight
					) {
						content.navCur = $(this).index();
					}
				} else {
					if (index >= $(this).offset().top - _bottomHeight) {
						content.pageCur = $(this).index();
					}
					if (index >= $(this).offset().top - _topHeight) {
						content.navCur = $(this).index();
					}
				}
			});

			content.action.pageHandler(index);
		},
	},
};

$(function() {
	main.init();

	content.init();
});

$(document).ready(function() { });

$(window).on("load", function() { });

$(window).on("scroll", function() {
	main.scroll();
});

$(window).on("resize", function() {
	main.resize();
});
