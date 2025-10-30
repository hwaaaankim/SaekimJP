var common = {

	stageData: { _y: 0, _w: 0, _h: 0 },
	agent: null,
	btnTopFlag: false,
	init: function() {

		common.agent = common.checkMedia();
		//서브메뉴 드롭다운
		$("#title_dept1").on("click", function() {
			if ($(this).hasClass('on')) {
				$(this).removeClass('on');
				$("#drList_dept1").slideUp();
			} else {
				$(this).addClass('on');
				$("#drList_dept1").slideDown();
			}
		})
		$("#title_dept2").on("click", function() {
			if ($(this).hasClass('on')) {
				$(this).removeClass('on');
				$("#drList_dept2").slideUp();
			} else {
				$(this).addClass('on');
				$("#drList_dept2").slideDown();
			}
		})
		$("#title_dept3").on("click", function() {
			if ($(this).hasClass('on')) {
				$(this).removeClass('on');
				$("#drList_dept3").slideUp();
			} else {
				$(this).addClass('on');
				$("#drList_dept3").slideDown();
			}
		})




		// history click event add
		$('#history').find('.active_title').on('click', function(e) {
			common.historyClickHand($(this).parents('li').index());
		});

		// history close
		$('body').on("click", function(e) {
			if ($(e.target).parents('.menu_cell').length == 0) {
				common.historyClickHand(-1);
			}
		});

		//mytest click event add
		$('.btn_id').on('mouseenter mouseleave focusin focusout', function(e) {
			if (e.type == 'mouseenter' || e.type == 'focusin') {
				$(this).find('.drop_down ul').stop(true).slideDown(80);
			} else {
				$(this).find('.drop_down ul').stop(true).slideUp(80);
			}
		});

		//dimd bg append
		$('#wrap').append('<div id="dimd"></div>');

		//GNB메뉴 마우스 인 이벤트 등록
		$('#gnb').find('> ul > li').on('mouseenter focusin', function(e) {
			var _parent = $('#header');


			if (_parent.find('.btn_all_menu').hasClass('open')) {
				_parent.find('.btn_all_menu').removeClass('open');
				_parent.find('.all_menu').removeClass('open');
			}

			_parent.find('.header_bottom').addClass('hover');
			$('#dimd').stop(true).fadeIn(200);
		});

		//GNB메뉴 마우스 아웃 이벤트 등록
		$('#gnb').on('mouseleave focusout', function() {
			$('#header').find('.header_bottom').removeClass('hover');
			$('#dimd').stop(true).fadeOut(200);
		});

		//딤드 클릭 이벤트 등록
		$('#dimd').click(function() {
			if ($('#header').find('.btn_all_menu').hasClass('open')) common.allMenuOpen();
		});

		//GNB메뉴 마우스 인 이벤트 등록
		$('#gnb_all').find('> ul > li').on('mouseenter mouseleave focusin focusout', function(e) {
			var _parent = $('#header');
			var _this = $(this);

			if (e.type == 'mouseenter' || e.type == 'focusin') {
				if (_this.find('.snb').length > 0) {
					_parent.addClass('open');
					$('#dimd').stop(true).fadeIn(180);
				}
			} else {
				if (_this.find('.snb').length > 0) {
					_parent.removeClass('open');
					$('#dimd').stop(true).fadeOut(180);
				}
			}
		});



		this.setStageData();
		this.scroll();
		this.resize();

	},

	//common scroll
	scroll: function() {
		this.setStageData();

		var btnTop = $('#btn_top');

		if (common.stageData._y >= 100) {
			if (!common.btnTopFlag) {
				btnTop.stop(true).fadeIn(180);
			}
			common.btnTopFlag = true;

		} else {
			if (common.btnTopFlag) {
				btnTop.stop(true).fadeOut(180);
			}
			common.btnTopFlag = false;
		}

		var fixHeader = $('#header'),
			fixHeaderBottom = fixHeader.find('.header_bottom'),
			fixHistory = $('#history');

		if (fixHeader.find('.header_bottom').length > 0) {
			if (common.stageData._y >= fixHeaderBottom.offset().top) {
				fixHeader.addClass('fix');
				fixHistory.addClass('fix');
			} else {
				fixHeader.removeClass('fix');
				fixHistory.removeClass('fix');
			}
		}

	},

	//common resize
	resize: function() {

		this.setStageData();
		this.scroll();

	},

	//line tab content sort
	tabSort: function(_t) {
		var _target = $(_t);
		var _parent = _target.parents('ul').next();
		_target.parent().addClass('actived').siblings().removeClass('actived');
		_parent.find('> div').eq(_target.parent().index()).show().siblings().hide();

		return false;
	},

	//tab content sort
	tabContentSort: function(_t) {
		var _target = $(_t);
		var _parent = _target.parents('.tab').next();
		_target.parent().addClass('actived').siblings().removeClass('actived');
		_parent.find('> div').eq(_target.parent().index()).show().siblings().hide();

		return false;
	},

	//tab content2 sort
	tabContent2Sort: function(_t) {
		var _target = $(_t);
		var _parent = _target.parents('.line_tab').next();
		_target.parent().addClass('actived').siblings().removeClass('actived');
		_parent.find('> div').eq(_target.parent().index()).show().siblings().hide();

		return false;
	},

	//tab content3 sort
	tabContent3Sort: function(_t) {
		var _target = $(_t);
		var _parent = _target.parents('.select_card_wrap').next();
		_target.parent().addClass('actived').siblings().removeClass('actived');
		_parent.find('> div').eq(_target.parent().index()).show().siblings().hide();

		return false;
	},

	//all menu click event
	allMenuOpen: function() {
		var _parent = $('#header');
		if (_parent.find('.btn_all_menu').hasClass('open')) {
			_parent.find('.btn_all_menu').removeClass('open');
			_parent.find('.all_menu').removeClass('open');
			$('#dimd').stop(true).fadeOut(180);
		} else {
			_parent.find('.btn_all_menu').addClass('open');
			_parent.find('.all_menu').addClass('open');
			$('#dimd').stop(true).fadeIn(180);
		}

	},

	//history click event handler

	historyClickHand: function(_index) {
		$('#history').find('.menu_cell').each(function() {
			if ($(this).index() == _index) {
				if ($(this).hasClass('open')) {
					$(this).removeClass('open');
					$(this).find('.menu_list').stop(true).slideUp(50);
				} else {
					$(this).addClass('open');
					$(this).find('.menu_list').stop(true).slideDown(50);
				}
			} else {
				$(this).removeClass('open');
				$(this).find('.menu_list').stop(true).slideUp(50);
			}
		});
	},

	//page scroll top move
	scrollTop: function() {
		$('html,body').stop().animate({ scrollTop: 0 }, 300);
	},

	//stage data set
	setStageData: function() {
		common.stageData._y = $(window).scrollTop();
		common.stageData._w = $(window).width();
		common.stageData._h = $(window).height();
	},

	//open Content Pop
	contentPopOpen: function(_class) {
		$('.' + _class).show();
	},

	//close Content Pop
	contentPopClose: function(_target) {
		$(_target).parents('.pop_parent').hide();
	},

	//open window Pop
	windowPopOpen: function(_url, _name, _width, _height) {

		window.open(_url, _name, 'width=' + _width + 'px, height=' + _height + 'px, top=0, left=0, resizable=yes, scrollbars=yes, location=no,  toolbar=no, status=no, menubar=no');

	},

	//page scroll disable add event handler
	parentScrollDisable: function() {
		$('body').on('scroll touchmove mousewheel', function(e) {
			e.preventDefault();
			e.stopPropagation();
			return false;
		});
	},

	//page scroll enable add event handler
	parentScrollEnable: function() {
		$('body').off('scroll touchmove mousewheel');
	},

	//html parameter check (httpUrl?num=1&page=1)
	getParameter: function(key) {
		var url = location.href;
		var spoint = url.indexOf("?");
		var query = url.substring(spoint, url.length);
		var keys = new Array;
		var values = new Array;
		var nextStartPoint = 0;
		while (query.indexOf("&", (nextStartPoint + 1)) > -1) {
			var item = query.substring(nextStartPoint, query.indexOf("&", (nextStartPoint + 1)));
			var p = item.indexOf("=");
			keys[keys.length] = item.substring(1, p);
			values[values.length] = item.substring(p + 1, item.length);
			nextStartPoint = query.indexOf("&", (nextStartPoint + 1));
		}
		item = query.substring(nextStartPoint, query.length);
		p = item.indexOf("=");
		keys[keys.length] = item.substring(1, p);
		values[values.length] = item.substring(p + 1, item.length);
		var value = "";
		for (var i = 0; i < keys.length; i++) {
			if (keys[i] == key) {
				value = values[i];
			}
		}
		return value;
	},

	//browser pc mobile check
	checkMedia: function() {
		var UserAgent = navigator.userAgent;
		var UserFlag = true;
		if (UserAgent.match(/iPhone|iPad|iPod|Android|Windows CE|BlackBerry|Symbian|Windows Phone|webOS|Opera Mini|Opera Mobi|POLARIS|IEMobile|lgtelecom|nokia|SonyEricsson/i) != null || UserAgent.match(/LG|SAMSUNG|Samsung/) != null) UserFlag = false
		return UserFlag
	},

	//get html scroll width
	getScrollBarWidth: function() {
		var inner = document.createElement('p');
		inner.style.width = "100%";
		inner.style.height = "200px";

		var outer = document.createElement('div');
		outer.style.position = "absolute";
		outer.style.top = "0px";
		outer.style.left = "0px";
		outer.style.visibility = "hidden";
		outer.style.width = "200px";
		outer.style.height = "150px";
		outer.style.overflow = "hidden";
		outer.appendChild(inner);

		document.body.appendChild(outer);
		var w1 = inner.offsetWidth;
		outer.style.overflow = 'scroll';
		var w2 = inner.offsetWidth;
		if (w1 == w2) w2 = outer.clientWidth;

		document.body.removeChild(outer);

		return (w1 - w2);
	}
};

//sample skin object
var skin = {

	dataName: ['TOEIC', 'TOEIC Speaking', 'TOEFL ITP', 'JPT', 'SJPT', 'TSC', 'JET', 'JET SPEAKING', 'JET KIDS', 'TOEIC BRIDGE', '상무한검', '일본어검정', 'KPE'],
	dataClass: ['TOEIC', 'TOEIC_SPEAKING', 'TOEFL_ITP', 'JPT', 'SJPT', 'TSC', 'JET', 'JET_SPEAKING', 'JET_KIDS', 'TOEIC_BRIDGE', 'SANGMUKO', 'JPL', 'KPE'],
	dataColor: ['#2172d5', '#1d61b4', '#223a5e', '#cf4350', '#2a6fa1', '#876645', '#df446f', '#09a5b4', '#ff803b', '#ecaa18', '#333e5c', '#c2403e', '#3e4452'],
	chartData: [],

	init: function() {

		var wrapping = $('#wrap');
		var skinD = document.createElement('div');
		var skinA = document.createElement('a');
		var skinU = document.createElement('ul');

		skinA.innerHTML = 'TYPE';
		skinA.setAttribute('href', 'javascript:;');

		skinD.className = "sampleSkin";

		for (var i = 0; i < skin.dataClass.length; i++) {
			var skinL = document.createElement('li');
			skinL.innerHTML = skin.dataName[i];
			skinL.setAttribute('style', 'background-color:' + skin.dataColor[i]);
			skinL.setAttribute('onclick', 'skin.change(' + i + ')');

			skinU.appendChild(skinL);
		}

		skinD.appendChild(skinA);
		skinD.appendChild(skinU);

		wrapping.append(skinD);

		skin.change(0);
	},

	change: function(_i) {
		var _target = $('.sampleSkin');
		$('html').removeClass().addClass(skin.dataClass[_i]);
		_target.find('> a').css('background-color', skin.dataColor[_i])
		_target.find('> ul > li').each(function() {
			if ($(this).index() == _i) {
				$(this).css({ 'background-color': skin.dataColor[_i], 'color': '#fff' });
			} else {
				$(this).css({ 'background-color': '#fff', 'color': '#555' });
			}
		});

		if (skin.chartData.length > 0) {
			for (var i = 0; i < skin.chartData.length; i++) {
				skin.chartData[i].updates();
			}
		}
	}

}

var chart = {
	// 01 .세로형 2단 그래프
	barVerticalDefault: function(_obj) {

		var _this = this,
			_dataObject = _obj,
			_dataCanvas = document.getElementById(String(_dataObject.id)).getContext("2d"),
			_dataTarget = null,
			_barWidth = 14,
			_barDefaultBgColor = '#eee',
			_bodyPaddingTop = 30;

		//기본색상 설정
		var firstGradient = _dataCanvas.createLinearGradient(0, 0, 0, $(document.getElementById(String(_dataObject.id))).parent().height());
		firstGradient.addColorStop(0, "#555");
		firstGradient.addColorStop(1, "#555");

		//포인트 그라데이션 설정
		var LastGradient = _dataCanvas.createLinearGradient(0, 0, 0, $(document.getElementById(String(_dataObject.id))).parent().height());
		LastGradient.addColorStop(0, pointGradientFirst());
		LastGradient.addColorStop(1, pointGradientLast());

		//함수호출시 색상 지정했을 경우
		if (_dataObject.customColor) {
			firstGradient = _dataObject.bg[0];
			LastGradient = _dataObject.bg[1];
		}

		//1. data setting
		var _graphData = {
			labels: _dataObject.labels,
			datasets: [{
				backgroundColor: [firstGradient, LastGradient],
				hoverBackgroundColor: [firstGradient, LastGradient],
				borderWidth: 0,
				data: _dataObject.datas
			}, {
				//데이타 배경 값(default max)
				backgroundColor: _barDefaultBgColor,
				hoverBackgroundColor: _barDefaultBgColor,
				borderWidth: 0,
				data: [_dataObject.max, _dataObject.max]
			}]
		};

		//2. option setting
		/* 데이타값 생성 및 위치 설정 */

		var _graphOption = {
			layout: {
				padding: { left: 0, right: 0, top: _bodyPaddingTop, bottom: 0 }
			},
			responsive: true,
			maintainAspectRatio: false,
			legend: { display: false, labels: { fontSize: 0 } },
			tooltips: {
				enabled: false
			},
			animation: { duration: 1000 },
			scales: {
				xAxes: [{
					stacked: true,
					categoryPercentage: 1,
					barPercentage: 1,
					barThickness: _barWidth,
					gridLines: {
						display: false
					}
				}],
				yAxes: [{
					stacked: true,
					gridLines: {
						display: true,
						offsetGridLines: true,
						drawBorder: false,
						tickMarkLength: 0,
						color: '#e8e8e8',
						zeroLineColor: '#999'
					},
					ticks: {
						display: _dataObject.yLabelFlag,
						beginAtZero: true,
						stepSize: _dataObject.max / _dataObject.step,
						min: _dataObject.min,
						max: _dataObject.max,
						callback: function(value, index, values) {
							var _value = value;
							// 라벨 표기내용이 정수가 아닐 경우 또는 %를 붙이는 경우
							if (!_dataObject.numbering && _dataObject.unit != 'point') {
								_value = value + '%';
							} else if (_dataObject.unit == 'point') {
								_value = value + '점';
							}
							return _value;
						}
					}
				}]
			}
		}

		//  @ 기본셋팅 함수
		this.setting = function() {
			_dataTarget = new Chart(_dataCanvas, {
				type: 'bar',
				data: _graphData,
				options: _graphOption,
				plugins: [{
					afterDatasetsDraw: function(chart, options) {
						// 그래프 생성 완료후 데이타 라벨 생성
						_this.labelSet(chart);
					}
				}]
			});
		}

		// @ 데이타 라벨 생성
		this.labelSet = function(chart) {

			var ctx = chart.ctx;
			chart.data.datasets.forEach(function(dataset, i) {
				var meta = chart.getDatasetMeta(i);
				if (!meta.hidden) {
					//가이드라인이 아닌 실제 라인일 경우에만 라벨 생성
					if (i == 0) {
						meta.data.forEach(function(element, index) {
							//함수 호출시 폰트 색상 지정시 기본 블랙색상
							if (_dataObject.customColor) {
								ctx.fillStyle = "#000";
							} else {
								ctx.fillStyle = (index == 0) ? '#000' : pointGradientFirst();
							}
							// 함수 호출시 폰트 사이즈 지정시 설정 아니면 기본 22
							var fontSize = (_dataObject.labelsFontSize) ? _dataObject.labelsFontSize : 22;
							var fontStyle = 'normal';
							var fontFamily = 'Roboto';
							ctx.font = Chart.helpers.fontString(fontSize, fontStyle, fontFamily);
							var dataString = dataset.data[index].toString();
							ctx.textAlign = 'center';
							ctx.textBaseline = 'middle';

							var padding = 5;
							var position = element.tooltipPosition();
							ctx.fillText(dataString, position.x, 10);
						});
					}
				}

			});

			// chart.data.labels.forEach(function(labels, i) { // chart.data.datasets.forEach(function(dataset, i) { 에서 변경
			// 	var meta = chart.getDatasetMeta(i);
			// 	if (!meta.hidden) {
			// 		//가이드라인이 아닌 실제 라인일 경우에만 라벨 생성
			// 		if(i == 0){
			// 			meta.data.forEach(function(element, index) {
			// 				//함수 호출시 폰트 색상 지정시 기본 블랙색상
			// 				if(_dataObject.customColor){
			// 					ctx.fillStyle = "#000";
			// 				}else{
			// 					ctx.fillStyle = (index==0)?'#000':pointGradientFirst();
			// 				}
			// 				// 함수 호출시 폰트 사이즈 지정시 설정 아니면 기본 22
			// 				var fontSize = (_dataObject.labelsFontSize)?_dataObject.labelsFontSize:22;
			// 				var fontStyle = 'normal';
			// 				var fontFamily = 'Roboto';
			// 				ctx.font = Chart.helpers.fontString(fontSize, fontStyle, fontFamily);
			// 				var dataString = labels;// dataset.data[index].toString(); 에서 변경
			// 				ctx.textAlign = 'center';
			// 				ctx.textBaseline = 'middle';

			// 				var padding = 5;
			// 				var position = element.tooltipPosition();
			// 				ctx.fillText(dataString, position.x, 10);
			// 			});
			// 		}
			// 	}

			// });

		}

		// @ 그래프 업데이트 함수
		this.updates = function() {
			var _this = this;

			// 그래프 바 배경 색상 재설정
			LastGradient = null;
			LastGradient = _dataCanvas.createLinearGradient(0, 0, 0, $(document.getElementById(String(_dataObject.id))).parent().height());;
			LastGradient.addColorStop(0, pointGradientFirst());
			LastGradient.addColorStop(1, pointGradientLast());

			_graphData.datasets[0].backgroundColor[1] = LastGradient;
			_graphData.datasets[0].hoverBackgroundColor[1] = LastGradient;

			_dataTarget.destroy();

			_dataTarget = new Chart(_dataCanvas, {
				type: 'bar',
				data: _graphData,
				options: _graphOption,
				plugins: [{
					afterDatasetsDraw: function(chart, options) {
						_this.labelSet(chart);
					}
				}]
			});
		}
		this.setting();
	},

	// 02 .세로형 그래프(라벨 + Y축 그리드라인)
	barLabelVertical: function(_obj) {

		var _this = this,
			_dataObject = _obj,
			_dataCanvas = document.getElementById(String(_dataObject.id)).getContext("2d"),
			_dataTarget = null,
			_barWidth = 14,
			_bodyPaddingTop = 65,
			_pointIndex = _dataObject.datas.indexOf(Math.max.apply(null, _dataObject.datas)); //데이타값들 비교하여 가장 높은 값의 배열 인덱스값 추출

		// 그래프 바 배경 색상 설정
		var barGradient = _dataCanvas.createLinearGradient(0, 0, 0, $(document.getElementById(String(_dataObject.id))).parent().height());
		barGradient.addColorStop(0, pointGradientFirst());
		barGradient.addColorStop(1, pointGradientLast());

		//1. data setting
		var _graphData = {
			labels: _dataObject.labels,
			datasets: [{
				backgroundColor: barGradient,
				hoverBackgroundColor: barGradient,
				borderWidth: 0,
				data: _dataObject.datas
			}]
		};

		//2. option setting
		/* 데이타값 생성 및 위치 설정 */
		var _graphOption = {
			layout: {
				padding: { left: 0, right: 0, top: _bodyPaddingTop, bottom: 0 }
			},
			responsive: true,
			maintainAspectRatio: false,
			legend: { display: false },
			tooltips: {
				enabled: false
			},
			animation: { duration: 1000 },
			scales: {
				xAxes: [{
					categoryPercentage: 1,
					barPercentage: 1,
					barThickness: _barWidth,
					gridLines: {
						display: false,
						tickMarkLength: 25
					},
					ticks: {
						fontSize: 15,
						fontColor: '#777'
					}
				}],
				yAxes: [{
					gridLines: {
						display: true,
						offsetGridLines: true,
						drawBorder: false,
						tickMarkLength: 0,
						color: '#e8e8e8',
						zeroLineColor: '#999'
					},
					ticks: {
						beginAtZero: true,
						stepSize: _dataObject.max / _dataObject.step,
						min: _dataObject.min,
						max: _dataObject.max,
						fontSize: 15,
						fontColor: '#777',
						padding: 30
					}
				}]
			}
		}

		//  @ 기본셋팅 함수
		this.setting = function() {
			_dataTarget = new Chart(_dataCanvas, {
				type: 'bar',
				data: _graphData,
				options: _graphOption,
				plugins: [{
					afterDatasetsDraw: function(chart, options) {
						_this.labelSet(chart);
					}
				}]
			});
		}

		// @ 데이타 라벨 생성
		this.labelSet = function(chart) {

			var ctx = chart.ctx;
			chart.data.datasets.forEach(function(dataset, i) {
				var meta = chart.getDatasetMeta(i);
				if (!meta.hidden) {
					meta.data.forEach(function(element, index) {
						//데이타값중 가장 높은값의 인덱스일 경우 포인트색상 , 아닐경우 블랙색상 걸정
						ctx.fillStyle = (index != _pointIndex) ? '#000' : pointGradientFirst();
						var fontSize = 22;
						var fontStyle = 'normal';
						var fontFamily = 'Roboto';
						ctx.font = Chart.helpers.fontString(fontSize, fontStyle, fontFamily);
						var dataString = dataset.data[index].toString();
						ctx.textAlign = 'center';
						ctx.textBaseline = 'middle';

						var padding = 34;
						var position = element.tooltipPosition();
						ctx.fillText(dataString, position.x, position.y - (fontSize / 2) - padding);

						//2번째 라벨 생성
						//데이타값중 가장 높은값의 인덱스일 경우 포인트색상 , 아닐경우 블랙색상 걸정
						ctx.fillStyle = (index != _pointIndex) ? '#555' : pointGradientFirst();
						var fontSize02 = 15;
						var fontStyle02 = 'normal';
						var fontFamily02 = 'Roboto';
						ctx.font = Chart.helpers.fontString(fontSize02, fontStyle02, fontFamily02);
						var dataString02 = _dataObject.dataLevel[index].toString();
						ctx.textAlign = 'center';
						ctx.textBaseline = 'middle';

						var position = element.tooltipPosition();
						ctx.fillText(dataString02, position.x, position.y - (fontSize02 / 2) - (padding - 20));
					});
				}

			});

		}

		// @ 그래프 업데이트 함수
		this.updates = function() {
			var _this = this;

			LastGradient = null;
			LastGradient = _dataCanvas.createLinearGradient(0, 0, 0, $(document.getElementById(String(_dataObject.id))).parent().height());;
			LastGradient.addColorStop(0, pointGradientFirst());
			LastGradient.addColorStop(1, pointGradientLast());

			_graphData.datasets[0].backgroundColor = LastGradient;
			_graphData.datasets[0].hoverBackgroundColor = LastGradient;

			_dataTarget.destroy();

			_dataTarget = new Chart(_dataCanvas, {
				type: 'bar',
				data: _graphData,
				options: _graphOption,
				plugins: [{
					afterDatasetsDraw: function(chart, options) {
						_this.labelSet(chart);
					}
				}]
			});
		}

		this.setting();
	},

	// 03 .세로형 그래프(y축 % + 1,2,3등 컬러 따로지정)
	barListVertical: function(_obj) {

		var _this = this,
			_dataObject = _obj,
			_dataCanvas = document.getElementById(String(_dataObject.id)).getContext("2d"),
			_dataTarget = null,
			_barWidth = 20,
			_bodyPaddingTop = 40,
			_pointIndex = _dataObject.datas.indexOf(Math.max.apply(null, _dataObject.datas)),
			_fontColor = [];

		// 데이타 갯수가 6개 이상일시 그래프 바 넓이 15 , 아니면 20
		if (_dataObject.datas.length > 6) _barWidth = 15;
		var gradeArr = _dataObject.datas.slice(0);
		var bgArr = [];


		// 그래프 바 기본색상 블랙으로 설정
		for (var k = 0; k < _dataObject.datas.length; k++) {
			var defaultGradient = _dataCanvas.createLinearGradient(0, 0, 0, $(document.getElementById(String(_dataObject.id))).parent().height());
			defaultGradient.addColorStop(0, "#000");
			defaultGradient.addColorStop(1, "#888");
			bgArr.push(defaultGradient);
		}

		// 1 , 2 , 3등 색상 설정		
		if (_dataObject.great) {
			if (_dataObject.datas.length >= 3) {
				for (var i = 0; i < 3; i++) {
					var _index = gradeArr.indexOf(Math.max.apply(null, gradeArr));


					gradeArr[_index] = -1;
					var gradeGradient = _dataCanvas.createLinearGradient(0, 0, 0, $(document.getElementById(String(_dataObject.id))).parent().height());

					if (i == 0) {
						gradeGradient.addColorStop(0, '#2172D5');
						gradeGradient.addColorStop(1, '#3d9ad9');
					} else if (i == 1) {
						gradeGradient.addColorStop(0, '#ffae41');
						gradeGradient.addColorStop(1, '#ffc956');
					} else if (i == 2) {
						gradeGradient.addColorStop(0, '#e8503f');
						gradeGradient.addColorStop(1, '#f06752');
					}
					bgArr[_index] = gradeGradient;
				}
			}
		}

		// 1등 색상 설정
		if (_dataObject.winner) {
			var pointGradient = _dataCanvas.createLinearGradient(0, 0, 0, $(document.getElementById(String(_dataObject.id))).parent().height());
			pointGradient.addColorStop(0, pointGradientFirst());
			pointGradient.addColorStop(1, pointGradientLast());

			bgArr[_pointIndex] = pointGradient;
		}

		// custom background color
		if (_dataObject.gradients != undefined) {

			if (_dataObject.gradients.length > 0) {
				bgArr.length = 0;
				for (var _x = 0; _x < _dataObject.gradients.length; _x++) {
					var customGradient = _dataCanvas.createLinearGradient(0, 0, 0, $(document.getElementById(String(_dataObject.id))).parent().height());
					var customFontColor;
					if (_dataObject.gradients[_x] == 'black') {
						customGradient.addColorStop(0, "#000");
						customGradient.addColorStop(1, "#888");
						customFontColor = "#000";
					} else {
						customGradient.addColorStop(0, _dataObject.gradients[_x][0]);
						customGradient.addColorStop(1, _dataObject.gradients[_x][1]);
						customFontColor = _dataObject.gradients[_x][0];
					}
					bgArr.push(customGradient);
					_fontColor.push(customFontColor);
				}
			}
		}

		//1. data setting
		var _graphData = {
			labels: _dataObject.labels,
			datasets: [{
				backgroundColor: bgArr,
				hoverBackgroundColor: bgArr,
				borderWidth: 0,
				data: _dataObject.datas
			}]
		};

		//2. option setting
		/* 데이타값 생성 및 위치 설정 */
		var _graphOption = {
			layout: {
				padding: { left: 0, right: 0, top: _bodyPaddingTop, bottom: 0 }
			},
			responsive: true,
			maintainAspectRatio: false,
			legend: { display: false },
			tooltips: {
				enabled: false
			},
			animation: { duration: 1000 },
			scales: {
				xAxes: [{
					scaleLabel: {
						display: false
					},
					categoryPercentage: 1,
					barPercentage: 1,
					barThickness: _barWidth,
					gridLines: {
						display: false,
						tickMarkLength: 20
					},
					ticks: {
						fontSize: 15,
						fontColor: '#777'
					}
				}],
				yAxes: [{
					scaleLabel: {
						display: false

					},
					gridLines: {
						display: true,
						offsetGridLines: true,
						drawBorder: false,
						tickMarkLength: (_dataObject.yLabelFlag) ? 0 : 0,
						color: '#e8e8e8',
						zeroLineColor: '#999'
					},
					ticks: {
						beginAtZero: true,
						display: _dataObject.yLabelFlag,
						stepSize: _dataObject.max / _dataObject.step,
						min: _dataObject.min,
						max: _dataObject.max,
						fontSize: 15,
						fontColor: '#777',
						padding: 30,
						callback: function(value, index, values) {
							var _value = value;
							// 라벨 표기내용이 정수가 아닐 경우 또는 %를 붙이는 경우
							if (!_dataObject.numbering && _dataObject.unit != 'point') {
								_value = value + '%';
							} else if (_dataObject.unit == 'point') {
								_value = value + '점';
							}
							return _value;
						}
					}
				}]
			}
		}

		//  @ 기본셋팅 함수
		this.setting = function() {
			_dataTarget = new Chart(_dataCanvas, {
				type: 'bar',
				data: _graphData,
				options: _graphOption,
				plugins: [{
					afterDatasetsDraw: function(chart, options) {
						_this.labelSet(chart);
					}
				}]
			});
		}

		// @ 데이타 라벨 생성
		this.labelSet = function(chart) {

			if (_dataObject.dataValue) {
				var ctx = chart.ctx;
				chart.data.datasets.forEach(function(dataset, i) {
					var meta = chart.getDatasetMeta(i);
					if (!meta.hidden) {
						meta.data.forEach(function(element, index) {
							if (_dataObject.gradients != undefined) {
								ctx.fillStyle = _fontColor[index];
							} else {
								ctx.fillStyle = (index != _pointIndex) ? '#000' : pointGradientFirst();
							}
							var fontSize = 18;
							var fontStyle = 'normal';
							var fontFamily = 'Roboto';
							ctx.font = Chart.helpers.fontString(fontSize, fontStyle, fontFamily);
							var dataString = dataset.data[index].toString();
							ctx.textAlign = 'center';
							ctx.textBaseline = 'middle';

							var padding = 10;
							var position = element.tooltipPosition();
							ctx.fillText(dataString, position.x, position.y - (fontSize / 2) - padding);
						});
					}

				});
			}

		}

		// @ 그래프 업데이트 함수
		this.updates = function() {
			var _this = this;

			_dataTarget.destroy();

			_dataTarget = new Chart(_dataCanvas, {
				type: 'bar',
				data: _graphData,
				options: _graphOption,
				plugins: [{
					afterDatasetsDraw: function(chart, options) {
						_this.labelSet(chart);
					}
				}]
			});
		}

		this.setting();
	},

	// 04 . 가로형 그래프()
	barListHorizontal: function(_obj) {

		var _this = this,
			_dataObject = _obj,
			_dataCanvas = document.getElementById(String(_dataObject.id)).getContext("2d"),
			_dataTarget = null,
			_barWidth = 12,
			_barDefaultBgColor = '#eee',
			_bodyPaddingTop = 0,
			_dataTotal = _dataObject.labels.length;

		// 그래프 바 배경 색상 설정
		var barGradient = _dataCanvas.createLinearGradient(0, 0, $(document.getElementById(String(_dataObject.id))).parent().width(), 0);
		barGradient.addColorStop(0, pointGradientLast());
		barGradient.addColorStop(1, pointGradientFirst());

		// 그래프 가이드바 설정
		var guideBarArr = [];
		for (var i = 0; i < _dataObject.datas.length; i++) {
			guideBarArr.push(_dataObject.max);
		}

		//1. data setting
		var _graphData = {
			labels: _dataObject.labels,
			datasets: [{
				backgroundColor: barGradient,
				hoverBackgroundColor: barGradient,
				borderWidth: 0,
				data: _dataObject.datas
			}, {
				//데이타 배경 값(default max)
				backgroundColor: _barDefaultBgColor,
				hoverBackgroundColor: _barDefaultBgColor,
				borderWidth: 0,
				data: guideBarArr
			}]
		};

		//2. option setting
		/* 데이타값 생성 및 위치 설정 */
		var _graphOption = {
			layout: {
				padding: { left: 0, right: 0, top: _bodyPaddingTop, bottom: 0 }
			},
			responsive: true,
			maintainAspectRatio: false,
			legend: { display: false },
			tooltips: {
				enabled: false
			},
			animation: { duration: 1000 },
			scales: {
				xAxes: [{
					stacked: true,
					gridLines: {
						display: true,
						tickMarkLength: 20,
						offsetGridLines: true,
						zeroLineColor: '#e8e8e8'
					},
					ticks: {
						fontFamily: _dataObject.fontFamilys,
						fontSize: 15,
						fontColor: '#777',
						stepSize: _dataObject.max / _dataObject.step,
						min: _dataObject.min,
						max: _dataObject.max,
						callback: function(value, index, values) {
							var _label;
							// x축의 라벨표기를 최소와 최대의 내용만 표시할 경우
							if (_dataObject.minMaxGrid) {
								if (index == 0) {
									_label = _dataObject.minMaxLabel[0];
								} else if (index == values.length - 1) {
									_label = _dataObject.minMaxLabel[1];
								} else {
									_label = '';
								}
							} else {
								_label = Math.round(value);
							}
							return _label;
						}
					}
				}],
				yAxes: [{
					stacked: true,
					categoryPercentage: 1,
					barPercentage: 1,
					barThickness: _barWidth,
					gridLines: {
						display: true,
						offsetGridLines: true,
						drawBorder: false,
						tickMarkLength: 0,
						color: '#e8e8e8',
						zeroLineColor: '#fff'
					},
					ticks: {
						beginAtZero: true,
						fontFamily: _dataObject.fontFamilys,
						fontSize: 15,
						fontColor: '#777',
						padding: 30
					}
				}]
			}
		}

		//  @ 기본셋팅 함수
		this.setting = function() {
			_dataTarget = new Chart(_dataCanvas, {
				type: 'horizontalBar',
				data: _graphData,
				options: _graphOption
			});
		}

		// @ 그래프 업데이트 함수
		this.updates = function() {
			var _this = this;

			barGradient = null;
			barGradient = _dataCanvas.createLinearGradient(0, 0, $(document.getElementById(String(_dataObject.id))).parent().width(), 0);
			barGradient.addColorStop(0, pointGradientLast());
			barGradient.addColorStop(1, pointGradientFirst());

			_graphData.datasets[0].backgroundColor = barGradient
			_graphData.datasets[0].hoverBackgroundColor = barGradient;

			_dataTarget.destroy();

			_dataTarget = new Chart(_dataCanvas, {
				type: 'horizontalBar',
				data: _graphData,
				options: _graphOption
			});
		}

		this.setting();
	},

	// 05 .라인형 그래프(y축라벨 + 데이타 라벨)
	lineLabelVertical: function(_obj) {

		var _this = this,
			_dataObject = _obj,
			_dataCanvas = document.getElementById(String(_dataObject.id)).getContext("2d"),
			_dataTarget = null,
			_bodyPaddingTop = 0,
			_pointIndex = _dataObject.datas.indexOf(Math.max.apply(null, _dataObject.datas));

		//1. data setting
		var _graphData = {
			labels: _dataObject.labels,
			datasets: [{
				type: 'line',
				backgroundColor: 'transparent',
				hoverBackgroundColor: 'transparent',
				borderColor: pointGradientFirst(),
				borderWidth: 2,
				pointBorderWidth: 3,
				pointRadius: 3,
				pointBackgroundColor: pointGradientFirst(),
				pointBorderColor: pointGradientFirst(),
				pointHoverBackgroundColor: pointGradientFirst(),
				pointHoverBorderColor: pointGradientFirst(),
				pointHoverBorderWidth: 3,
				pointHoverRadius: 3,
				data: _dataObject.datas
			}, {
				type: 'bar',
				backgroundColor: 'transparent',
				hoverBackgroundColor: 'transparent',
				borderColor: 'transparent',
				borderWidth: 0,
				data: _dataObject.datas
			}]
		};

		//2. option setting
		/* 데이타값 생성 및 위치 설정 */
		var _graphOption = {
			elements: {
				line: {
					tension: 0, // disables bezier curves
				}
			},
			layout: {
				padding: { left: 0, right: 0, top: _bodyPaddingTop, bottom: 0 }
			},
			responsive: true,
			maintainAspectRatio: false,
			legend: { display: false },
			tooltips: {
				enabled: false
			},
			animation: { duration: 1000 },
			scales: {
				xAxes: [{
					categoryPercentage: 0.5,
					barPercentage: 0.5,
					gridLines: {
						display: false,
						offsetGridLines: true,
						tickMarkLength: 25
					},
					ticks: {
						fontSize: 15,
						fontColor: '#777'
					}
				}],
				yAxes: [{
					gridLines: {
						display: true,
						drawBorder: false,
						tickMarkLength: 0,
						offsetGridLines: false,
						color: '#e8e8e8',
						zeroLineColor: '#999'
					},
					ticks: {
						stepSize: _dataObject.max / _dataObject.step,
						min: _dataObject.min,
						max: _dataObject.max,
						fontSize: 15,
						fontColor: '#777',
						padding: 30
					}
				}]
			}
		}

		//  @ 기본셋팅 함수
		this.setting = function() {
			_dataTarget = new Chart(_dataCanvas, {
				type: 'bar',
				data: _graphData,
				options: _graphOption,
				plugins: [{
					afterDatasetsDraw: function(chart, options) {
						_this.labelSet(chart);
					}
				}]
			});
		}

		// @ 데이타 라벨 생성
		this.labelSet = function(chart) {

			var ctx = chart.ctx;
			chart.data.datasets.forEach(function(dataset, i) {
				var meta = chart.getDatasetMeta(i);
				if (!meta.hidden) {
					if (i == 0) {
						meta.data.forEach(function(element, index) {
							ctx.fillStyle = (index != _pointIndex) ? '#000' : pointGradientFirst();
							var fontSize = 24;
							var fontStyle = 'normal';
							var fontFamily = 'Roboto';
							ctx.font = Chart.helpers.fontString(fontSize, fontStyle, fontFamily);
							var dataString = dataset.data[index].toString();
							ctx.textAlign = 'center';
							ctx.textBaseline = 'middle';

							var padding = -40;
							var position = element.tooltipPosition();
							ctx.fillText(dataString, position.x, position.y - (fontSize / 2) - padding);

							ctx.fillStyle = (index != _pointIndex) ? '#555' : pointGradientFirst();
							var fontSize02 = 14;
							var fontStyle02 = 'normal';
							var fontFamily02 = 'Roboto';
							ctx.font = Chart.helpers.fontString(fontSize02, fontStyle02, fontFamily02);
							var dataString02 = _dataObject.dataLevel[index].toString();
							ctx.textAlign = 'center';
							ctx.textBaseline = 'middle';



							var position = element.tooltipPosition();
							ctx.fillText(dataString02, position.x, position.y - (fontSize02 / 2) - (padding - 20));
						});
					}
				}

			});

		}

		// @ 그래프 업데이트 함수
		this.updates = function() {
			var _this = this;

			_graphData.datasets[0].borderColor = pointGradientFirst(),
				_graphData.datasets[0].pointBackgroundColor = pointGradientFirst(),
				_graphData.datasets[0].pointBorderColor = pointGradientFirst(),
				_graphData.datasets[0].pointHoverBackgroundColor = pointGradientFirst(),
				_graphData.datasets[0].pointHoverBorderColor = pointGradientFirst(),

				_dataTarget.destroy();

			_dataTarget = new Chart(_dataCanvas, {
				type: 'bar',
				data: _graphData,
				options: _graphOption,
				plugins: [{
					afterDatasetsDraw: function(chart, options) {
						_this.labelSet(chart);
					}
				}]
			});
		}

		this.setting();
	},

	// 06 .pie 그래프
	pie: function(_obj) {

		var _this = this,
			_dataObject = _obj,
			_dataCanvas = document.getElementById(String(_dataObject.id)).getContext("2d"),
			_dataTarget = null;

		//1. data setting
		var _graphData = {
			labels: _dataObject.labels,
			datasets: [{
				backgroundColor: _dataObject.bg,
				borderWidth: 0,
				shadowOffsetX: 0,
				shadowOffsetY: 20,
				shadowBlur: 20,
				shadowColor: 'rgba(0,0,0,0.17)',
				hovershadowOffsetX: 0,
				hovershadowOffsetY: 20,
				hovershadowBlur: 20,
				hovershadowColor: 'rgba(0,0,0,0.17)',
				data: _dataObject.datas
			}]
		};


		//2. option setting
		/* 데이타값 생성 및 위치 설정 */
		var _graphOption = {
			layout: {
				padding: { left: 20, right: 20, top: 0, bottom: 20 }
			},
			responsive: true,
			maintainAspectRatio: false,
			legend: { display: false },
			pieceLabel: {
				render: (_dataObject.per) ? 'percentage' : 'value',
				fontSize: 22,
				fontStyle: 'normal',
				fontColor: '#fff',
				fontFamily: 'Roboto'
			},
			tooltips: {
				enabled: false
			},
			animation: { duration: 1000 }
		}

		//  @ 기본셋팅 함수
		this.setting = function() {
			_dataTarget = new Chart(_dataCanvas, {
				type: 'pie',
				data: _graphData,
				options: _graphOption
			});
		}

		// @ 데이타 라벨 생성
		this.labelSet = function(chart) {

			var ctx = chart.ctx;
			chart.data.datasets.forEach(function(dataset, i) {
				var meta = chart.getDatasetMeta(i);
				if (!meta.hidden) {
					meta.data.forEach(function(element, index) {
						ctx.fillStyle = '#fff';
						var fontSize = 22;
						var fontStyle = 'normal';
						var fontFamily = 'Roboto';
						ctx.font = Chart.helpers.fontString(fontSize, fontStyle, fontFamily);
						var dataString = dataset.data[index].toString();
						ctx.textAlign = 'center';
						ctx.textBaseline = 'middle';
						var padding = 34;
						var position = element.tooltipPosition();
						ctx.fillText(dataString, position.x, position.y - (fontSize / 2) - padding);
					});
				}
			});
		}

		// @ 그래프 업데이트 함수
		this.updates = function() {
			var _this = this;

			_dataTarget.destroy();

			_dataTarget = new Chart(_dataCanvas, {
				type: 'pie',
				data: _graphData,
				options: _graphOption
			});
		}

		this.setting();
	},
	// 07 .세로형 2라벨
	barVerticalTwo: function(_obj) {

		var _this = this,
			_dataObject = _obj,
			_dataCanvas = document.getElementById(String(_dataObject.id)).getContext("2d"),
			_dataTarget = null,
			_barWidth = 14,
			_bodyPaddingTop = 70,
			_bgArr = [],
			_pointIndex01 = _dataObject.datas[0].indexOf(Math.max.apply(null, _dataObject.datas[0])); //데이타값들 비교하여 가장 높은 값의 배열 인덱스값 추출
		_pointIndex02 = _dataObject.datas[1].indexOf(Math.max.apply(null, _dataObject.datas[1])); //데이타값들 비교하여 가장 높은 값의 배열 인덱스값 추출

		console.log(_pointIndex01);
		console.log(_pointIndex02);

		// 그래프 바 배경 색상 설정
		for (var _i = 0; _i < _dataObject.gradients.length; _i++) {
			var barGradient = _dataCanvas.createLinearGradient(0, 0, 0, $(document.getElementById(String(_dataObject.id))).parent().height());
			barGradient.addColorStop(0, _dataObject.gradients[_i][0]);
			barGradient.addColorStop(1, _dataObject.gradients[_i][1]);
			_bgArr.push(barGradient);
		}

		//1. data setting
		var _graphData = {
			labels: _dataObject.labels,
			datasets: [{
				backgroundColor: _bgArr[0],
				hoverBackgroundColor: _bgArr[0],
				borderWidth: 0,
				data: _dataObject.datas[0]
			}, {
				backgroundColor: _bgArr[1],
				hoverBackgroundColor: _bgArr[1],
				borderWidth: 0,
				data: _dataObject.datas[1]
			}]
		};

		//2. option setting
		/* 데이타값 생성 및 위치 설정 */
		var _graphOption = {
			layout: {
				padding: { left: 0, right: 0, top: _bodyPaddingTop, bottom: 0 }
			},
			responsive: true,
			maintainAspectRatio: false,
			legend: { display: false },
			tooltips: {
				enabled: false
			},
			animation: { duration: 1000 },
			scales: {
				xAxes: [{
					categoryPercentage: 1,
					barPercentage: 1,
					barThickness: _barWidth,
					gridLines: {
						display: false,
						tickMarkLength: 25
					},
					ticks: {
						fontSize: 15,
						fontColor: '#777'
					}
				}],
				yAxes: [{
					gridLines: {
						display: true,
						offsetGridLines: true,
						drawBorder: false,
						tickMarkLength: 0,
						color: '#e8e8e8',
						zeroLineColor: '#999'
					},
					ticks: {
						beginAtZero: true,
						stepSize: _dataObject.max / _dataObject.step,
						min: _dataObject.min,
						max: _dataObject.max,
						fontSize: 15,
						fontColor: '#777',
						padding: 30
					}
				}]
			}
		}

		//  @ 기본셋팅 함수
		this.setting = function() {
			_dataTarget = new Chart(_dataCanvas, {
				type: 'bar',
				data: _graphData,
				options: _graphOption,
				plugins: [{
					afterDatasetsDraw: function(chart, options) {
						_this.labelSet(chart);
					}
				}]
			});
		}

		// @ 데이타 라벨 생성
		this.labelSet = function(chart) {

			var ctx = chart.ctx;
			chart.data.datasets.forEach(function(dataset, i) {
				var meta = chart.getDatasetMeta(i);
				var _k = i;
				if (!meta.hidden) {
					meta.data.forEach(function(element, index) {
						var _pointIndex = (_k == 0) ? _pointIndex01 : _pointIndex02;
						var _pointColor = (_k == 0) ? pointGradientFirst() : _dataObject.gradients[1][1];

						//데이타값중 가장 높은값의 인덱스일 경우 포인트색상 , 아닐경우 블랙색상 걸정						
						ctx.fillStyle = (index != _pointIndex) ? '#000' : _pointColor;
						var fontSize = 22;
						var fontStyle = 'normal';
						var fontFamily = 'Roboto';
						ctx.font = Chart.helpers.fontString(fontSize, fontStyle, fontFamily);
						var dataString = dataset.data[index].toString();
						ctx.textAlign = 'center';
						ctx.textBaseline = 'middle';

						var padding = 30;
						var position = element.tooltipPosition();
						ctx.fillText(dataString, position.x, position.y - (fontSize / 2) - padding);

						//2번째 라벨 생성
						//데이타값중 가장 높은값의 인덱스일 경우 포인트색상 , 아닐경우 블랙색상 걸정

						ctx.fillStyle = (index != _pointIndex) ? '#555' : _pointColor;
						var fontSize02 = 15;
						var fontStyle02 = 'normal';
						var fontFamily02 = 'Roboto';
						ctx.font = Chart.helpers.fontString(fontSize02, fontStyle02, fontFamily02);
						var dataString02 = _dataObject.dataLevel[_k][index].toString();
						ctx.textAlign = 'center';
						ctx.textBaseline = 'middle';

						var position = element.tooltipPosition();
						ctx.fillText(dataString02, position.x, position.y - (fontSize02 / 2) - (padding - 20));


					});
				}

			});

		}

		// @ 그래프 업데이트 함수
		this.updates = function() {
			var _this = this;

			LastGradient = null;
			LastGradient = _dataCanvas.createLinearGradient(0, 0, 0, $(document.getElementById(String(_dataObject.id))).parent().height());;
			LastGradient.addColorStop(0, pointGradientFirst());
			LastGradient.addColorStop(1, pointGradientLast());

			_graphData.datasets[0].backgroundColor = LastGradient;
			_graphData.datasets[0].hoverBackgroundColor = LastGradient;

			_dataTarget.destroy();

			_dataTarget = new Chart(_dataCanvas, {
				type: 'bar',
				data: _graphData,
				options: _graphOption,
				plugins: [{
					afterDatasetsDraw: function(chart, options) {
						_this.labelSet(chart);
					}
				}]
			});
		}

		this.setting();
	}


}

function pointGradientFirst() {
	var _flag = $('html').attr('class');
	var _color;

	switch (_flag) {
		case 'TOEIC': _color = '#2172D5';
			break;
		case 'TOEIC_SPEAKING': _color = '#0f54a6';
			break;
		case 'TOEFL_ITP': _color = '#223a5e';
			break;
		case 'JPT': _color = '#cf4350';
			break;
		case 'SJPT': _color = '#2a6fa1';
			break;
		case 'TSC': _color = '#5f574f';
			break;
		case 'JET': _color = '#cd4561';
			break;
		case 'JET_SPEAKING': _color = '#09a5b4';
			break;
		case 'JET_KIDS': _color = '#ff803b';
			break;
		case 'TOEIC_BRIDGE': _color = '#ecaa18';
			break;
		case 'SANGMUKO': _color = '#333e5c';
			break;
		case 'JPL': _color = '#c2403e';
			break;
		case 'KPE': _color = '#3e4452';
			break;
		default: _color = '#2172D5';
	}


	return _color;
}

function pointGradientLast() {
	var _flag = $('html').attr('class');
	var _color;

	switch (_flag) {
		case 'TOEIC': _color = '#388cd3 ';
			break;
		case 'TOEIC_SPEAKING': _color = '#327ecb ';
			break;
		case 'TOEFL_ITP': _color = '#587a8f';
			break;
		case 'JPT': _color = '#ff9fa8';
			break;
		case 'SJPT': _color = '#77b4e0';
			break;
		case 'TSC': _color = '#8e8276';
			break;
		case 'JET': _color = '#dd6690';
			break;
		case 'JET_SPEAKING': _color = '#0bb7c4';
			break;
		case 'JET_KIDS': _color = '#ffceb3';
			break;
		case 'TOEIC_BRIDGE': _color = '#f0bb1d';
			break;
		case 'SANGMUKO': _color = '#8f9fca';
			break;
		case 'JPL': _color = '#fba3a1';
			break;
		case 'KPE': _color = '#a9b2c7';
			break;
		default: _color = '#76ccff';
	}


	return _color;
}

// 영역별 교재 표시
function changeBlueBox(genre) {

	$(".book-list__item").removeClass("on");

	if (genre == 'grammar') {
		$(".book-listTb ul:nth-child(1) li:nth-child(1)").addClass("on");
	} else if (genre == 'listen') {
		$(".book-listTb ul:nth-child(1) li:nth-child(2)").addClass("on");
	} else if (genre == 'speak') {
		$(".book-listTb ul:nth-child(1) li:nth-child(3)").addClass("on");
	} else if (genre == 'read') {
		$(".book-listTb ul:nth-child(1) li:nth-child(4)").addClass("on");
	} else if (genre == 'write') {
		$(".book-listTb ul:nth-child(1) li:nth-child(5)").addClass("on");
	} else if (genre == 'voca') {
		$(".book-listTb ul:nth-child(2) li:nth-child(1)").addClass("on");
	} else if (genre == 'middle') {
		$(".book-listTb ul:nth-child(2) li:nth-child(2)").addClass("on");
	} else if (genre == 'test') {
		$(".book-listTb ul:nth-child(2) li:nth-child(3)").addClass("on");
	} else if (genre == 'ksat') {
		$(".book-listTb ul:nth-child(2) li:nth-child(4)").addClass("on");
	} else if (genre == 'etc') {
		$(".book-listTb ul:nth-child(2) li:nth-child(5)").addClass("on");
	}
}

// 이벤트 공유 버튼
function copyEventUrl() {
	var nowUrl = window.location.href;
	navigator.clipboard.writeText(nowUrl).then(res => {
		alert("주소가 복사되었습니다.\n원하는 곳에 붙여넣기 해주세요.");
	})
}

// 지도 주소 복사
function copyAddr(addr) {
	navigator.clipboard.writeText(addr).then(res => {
		alert("주소가 복사되었습니다.\n원하는 곳에 붙여넣기 해주세요.");
	})
}

// 사업 설명회 개인 정보 아코디언 함수
function openPersonal() {
	if ($(".checkbox-cont").css("display") == "none") {
		$(".check-item").addClass("active");
		$(".checkbox-cont").slideDown();
	} else {
		$(".check-item").removeClass("active");
		$(".checkbox-cont").slideUp();
	}
}

// 가맹 상담 개인정보 아코디언 함수
function openPrivate(stance) {

	if (stance == 'one') {
		if ($(".cs-checkBox li:nth-child(1) .checkbox-cont").css("display") == "none") {
			$(".cs-checkBox li:nth-child(1)").addClass("active");
			$(".cs-checkBox li:nth-child(1) .checkbox-cont").slideDown();
		} else {
			$(".cs-checkBox li:nth-child(1)").removeClass("active");
			$(".cs-checkBox li:nth-child(1) .checkbox-cont").slideUp();
		}

	} else if (stance == 'two') {
		if ($(".cs-checkBox li:nth-child(2) .checkbox-cont").css("display") == "none") {
			$(".cs-checkBox li:nth-child(2)").addClass("active");
			$(".cs-checkBox li:nth-child(2) .checkbox-cont").slideDown();
		} else {
			$(".cs-checkBox li:nth-child(2)").removeClass("active");
			$(".cs-checkBox li:nth-child(2) .checkbox-cont").slideUp();
		}
	} else if (stance == 'three') {
		if ($(".cs-checkBox li:nth-child(3) .checkbox-cont").css("display") == "none") {
			$(".cs-checkBox li:nth-child(3)").addClass("active");
			$(".cs-checkBox li:nth-child(3) .checkbox-cont").slideDown();
		} else {
			$(".cs-checkBox li:nth-child(3)").removeClass("active");
			$(".cs-checkBox li:nth-child(3) .checkbox-cont").slideUp();
		}
	}

}

// 주교재 메뉴 클릭 함수
function openBook() {
	if ($(".series a").hasClass("open")) {
		$(".series a").removeClass("open");
		$(".series-box").removeClass("open");
	} else {
		$(".series a").addClass("open");
		$(".series-box").addClass("open");
	}
};

// 주교재 스와이퍼
const swiper = new Swiper('.book-preivew_swiper', {
	// Optional parameters
	direction: 'horizontal',
	observer: true,
	observeParents: true,
	slidesPerView: 'auto',
	autoHeight: true,
	speed: 300,

	// Navigation arrows
	navigation: {
		nextEl: '.swiper-button-next',
		prevEl: '.swiper-button-prev',
	},
	scrollbar: {
		el: '.swiper-scrollbar',
		draggable: true,
	},
});

//fileChange Event
function fileChange(_target) {
	var _t = $(_target);
	var _val = _t.val();
	_t.siblings("input[type='text']").val(_val);
}


/******************************************************
@ Init
******************************************************/
$(function() {

	common.init();

});



/******************************************************
@ Document Ready
******************************************************/
$(document).ready(function() {

});



/******************************************************
@ Window Load
******************************************************/
$(window).on("load", function() {

});



/******************************************************
@ Window Scroll
******************************************************/
$(window).on("scroll", function() {

	common.scroll();

});



/******************************************************
@ Window Resize
******************************************************/
$(window).on("resize", function() {

	common.resize();

});

/******************************************************
@ content_tab
******************************************************/
$(document).on("click", ".content_tab", function() {
	var _target = $(this);
	var _parent = _target.parents('.tab').next();
	_target.parent().addClass('actived').siblings().removeClass('actived');
	_parent.find('> div').eq(_target.parent().index()).show().siblings().hide();

	return false;
});

/******************************************************
@ content_linetab
******************************************************/
$(document).on("click", ".content_linetab", function() {
	var _target = $(this);
	var _parent = _target.parents('.line_tab').next();
	_target.parent().addClass('actived').siblings().removeClass('actived');
	_parent.find('> div').eq(_target.parent().index()).show().siblings().hide();

	return false;
});

/******************************************************
@ faq_open
******************************************************/
$(document).on("click", ".faq_Open", function() {
	var _target = $(this);
	_target.siblings().removeClass('open');
	$('.faq_answer').css('display', 'none');
	if (_target.hasClass('open')) {
		_target.removeClass('open');
		_target.next().css('display', 'none');
	} else {
		_target.addClass('open');
		_target.next().css('display', 'block');
	}
});



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