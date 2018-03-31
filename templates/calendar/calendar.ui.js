/**
 * Calendar realize Date selector.
 */
UI.register({
    name : 'Calendar',

    scheme : {
        wrap : {
            header : {
                monthSwitcher : '<<< Calendar switcher {arrowsSize = 0.45; labelSize = 1.1; loopAround = true; width = 7}',
                yearSwitcher : '<<< Calendar switcher {arrowsSize = 0.45; labelSize = 0.75; loopAround = false; width = 7}'
            },
			body : {
				labels : '|Calendar label',
				days : '|Calendar day'
			},
			value : '@input [type = hidden]'
        }
    },
	
	
	params : {
		name : null,

		// Format of the displayed date.
		//
		// The next keywords can be used in the format:
		//
		// YYYY - year with 4 digits (2018)
		// YY - year with 2 last digits (18)
		// MMMM - full month name (January)
		// MMM - short month name (Jan)
		// MM - month with leading zero (05)
		// M - month without leading zero (5)
		// DDDD - full day name (Monday)
		// DDD - short day name (Mo)
		// DD - day number with leading zero (05)
		// D - day number without leading zero
		//
		// All keywords can be written in lower case.
		format : 'DD MMMM YYYY',

		sizeFactor : 1,
		size : 14,
		selectedDate : '2018-12-05',
		weekStartsFrom : 'monday',

		_curYear : 1,
		_curMonth : 1,
		_curDay : 1,
		
		// Selected date.
		_year : 2018,
		_month : 1,
		_day : 1,

		// Start date.
		_yearFrom : 1988,
		_monthFrom : 1,
		_dayFrom : 1,

		// End date.
		_yearTo : 2088,
		_monthTo : 1,
		_dayTo : 1,

		_years : []
	},
	
	
	methods : {
		setWeekStartingDay : function(firstWeekDayName){
			this.params().weekStartsFrom = firstWeekDayName;
			this.purifyCurrentDate();
			this.renderDaysLabels();
		},

		setName : function(name){
			this.params().name = name;
			this.value.attr('name', name);
		},

		val : function(value){
			return this.value.val(value);
		},

		daysLabels : function(){
			var labels = {
				en : ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
				ru : ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Ппятница', 'Суббота', 'Воскресенье']
			}
			return labels[UI.getLanguage()];
		},

		daysShortLabels : function(){
			var labels = {
				en : ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'],
				ru : ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
			}
			return labels[UI.getLanguage()];
		},


		monthsLabels : function(){
			var labels = {
				en : [
					'January', 'February', 'March', 'April', 
					'May', 'June', 'July', 'August', 
					'September', 'October', 'November', 'December'
				],
				ru : [
					'Январь', 'Февраль', 'Март', 'Апрель', 
					'Май', 'Июнь', 'Июль', 'Август', 
					'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
				]
			}
			return labels[UI.getLanguage()];
		},


		monthsShortLabels : function(){
			var labels = {
				en : [
					'Jan.', 'Feb.', 'Mar.', 'Apr.', 
					'May.', 'Jun.', 'Jul.', 'Aug.', 
					'Sept.', 'Oct.', 'Nov.', 'Dec.'
				],
				ru : [
					'Янв.', 'Фев.', 'Мар.', 'Апр.', 
					'Май', 'Июн', 'Июл', 'Авг.', 
					'Сен.', 'Окт.', 'Нбр.', 'Дек.'
				]
			}
			return labels[UI.getLanguage()];
		},


		formatDate : function(format){
			var p = this.params();
			if(format === undefined) format = p.format;
			format = format.toUpperCase();
			
			var dt = new Date(p._year, p._month, p._day);
			var YYYY = '' + dt.getFullYear();

			var M = dt.getMonth();
			var MM = M;
			if(MM < 10) MM = '0' + MM;

			var D = dt.getDate();
			var DD = D;
			if(DD < 10) DD = '0' + DD;

			if(format.indexOf('YYYY') >= 0){
				format = format.replace('YYYY', YYYY);
			}else{
				format = format.replace('YY', YYYY.slice(-2));
			}
			
			if(format.indexOf('MMMM') >= 0){
				format = format.replace('MMMM', this.monthsLabels()[p._month]);
			}else if(format.indexOf('MMM') >= 0){
				format = format.replace('MMMM', this.monthsShortLabels()[p._month]);
			}else if(format.indexOf('MM') >= 0){
				format = format.replace('MM', MM);	
			}else{
				format = format.replace('M', M);	
			}
			
			if(format.indexOf('DDDD') >= 0){
				format = format.replace('DD', this.daysLabels()[dt.getDay()]);	
			}else if(format.indexOf('DDD') >= 0){
				format = format.replace('DD', this.daysShortLabels()[dt.getDay()]);	
			}else if(format.indexOf('DD') >= 0){
				format = format.replace('DD', DD);	
			}else{
				format = format.replace('D', D);
			}
			
			return format;
		},


		updateLabels : function(){
			this.monthSwitcher.inclusion().setOptions(this.monthsLabels());
		},

		setSelectedDate : function(date){
			var d = new Date(date.replace(' ', 'T'));
			this.purifySelectedDate(d.getFullYear(), d.getMonth(), d.getDate());
			var p = this.params();

			p._year = d.getFullYear();
			p._month = d.getMonth();
			p._day = d.getDate();
		},

		setCurrentDate : function(date){
			var d = new Date(date.replace(' ', 'T'));
			this.purifyCurrentDate(d.getFullYear(), d.getMonth(), d.getDate());
			var p = this.params();
			
			p._curYear = d.getFullYear();
			p._curMonth = d.getMonth();
			p._curDay = d.getDate();

			this.monthSwitcher.inclusion().val(p._curMonth);
			this.yearSwitcher.inclusion().val(p._years.indexOf(p._curYear));
		},
		
		getWeekOffset : function(){
			var offsets = {
				monday : -1,
				mo : -1,
				tuesday : -2,
				tu : -2,
				wednesday : -3,
				we : -3, 
				thursday : -4,
				th : -4,
				friday : -5,
				fr : -5,
				saturday : -6,
				sa : -6,
				sunday : 0,
				su : 0
			};
			return offsets[this.params().weekStartsFrom];
		},

		purifyCurrentDate : function(year, month, day)
		{
			var p = this.params();

			if(year === null || year === undefined) year = p._curYear;
			if(month === null || month === undefined) month = p._curMonth;
			if(day === null || day === undefined) day = p._day;

			var dateFrom = new Date(p._yearFrom, p._monthFrom, p._dayFrom);
			var dateTo = new Date(p._yearTo, p._monthTo, p._dayTo);
			var d = new Date(year, month, day);

			if(d.getTime() < dateFrom.getTime()){
				d = dateFrom;
			}
			if(d.getTime() > dateTo.getTime()){
				d = dateTo;
			}
			p._curYear = d.getFullYear();
			p._curMonth = d.getMonth();
			p._curDay = d.getDate();
		},

		purifySelectedDate : function(year, month, day)
		{
			var p = this.params();

			if(year === null || year === undefined) year = p._year;
			if(month === null || month === undefined) month = p._month;
			if(day === null || day === undefined) day = p._day;

			var dateFrom = new Date(p._yearFrom, p._monthFrom, p._dayFrom);
			var dateTo = new Date(p._yearTo, p._monthTo, p._dayTo);
			var d = new Date(year, month, day);

			if(d.getTime() < dateFrom.getTime()){
				d = dateFrom;
			}
			if(d.getTime() > dateTo.getTime()){
				d = dateTo;
			}
			p._year = d.getFullYear();
			p._month = d.getMonth();
			p._day = d.getDate();
		},
		
		buildMonth : function()
		{
			var p = this.params();
			var d = new Date(p._curYear, p._curMonth, 1);

			var dayOfWeek = d.getDay();
			var offset = this.getWeekOffset();
			var daysInMonth = 33 - new Date(p._curYear, p._curMonth, 33).getDate();

			// Clear days list.
			this.days.removeChildren();
			
			// Render empty days from previous month.
			var prevMonthDays = dayOfWeek + offset;
			if(prevMonthDays < 0) prevMonthDays = 7 + prevMonthDays;
			for(var i = 0; i < prevMonthDays; i++){
				this.days.addOne().wrap.css({visibility: 'hidden'});
			}
			
			for(i = 1; i <= daysInMonth; i++){
				var day = this.days.addOne({
					index : i,
					sizeFactor : p.sizeFactor
				});
				if(i == p._day && p._year == p._curYear && p._month == p._curMonth){
					day.wrap.addClass('active');
				}
			}
			
			// Render empty days from previous month.
			var rows = Math.ceil((daysInMonth + prevMonthDays)/7);
			var t = rows * 7 - (daysInMonth + prevMonthDays);

			for(var i = 0; i < t; i++){
				this.days.addOne().wrap.css({visibility: 'hidden'});
			}
		},

		renderDaysLabels : function(){
			this.labels.removeChildren();
			var labels = this.daysShortLabels();
			for(var i = 0; i < labels.length; i++){
				this.labels.addOne({label : labels[i]});
			}
		}
	},
	
	
	onrender : function(inst, params)
	{
		if(params.name !== null){
			inst.value.attr('name', params.name);
		}

		// Update months labels.
		inst.updateLabels();

		// Set days values.
		for(var i = params._yearFrom; i <= params._yearTo; i++){
			params._years.push(i);
		}
		inst.yearSwitcher.inclusion().setOptions(params._years);
		

		// Set initial data.
		inst.setSelectedDate(params.selectedDate);
		inst.setCurrentDate(params.selectedDate);
		inst.buildMonth(params._month);
		
		// Apply size.
		params.sizeFactor = params.size / 14;
		inst.wrap.css({
			width: params.size + 'rem',
			minHeight: params.size * params.sizeFactor + 'rem',
		});
		inst.days.css({
			width: 1.7 * params.sizeFactor * 7  + 1 + 'rem'
		});

		inst.renderDaysLabels();

		// Update month days when user change month.
		inst.monthSwitcher.inclusion().on('slideleft', function(month){
			inst.purifyCurrentDate(null, month);
			inst.buildMonth();
		});

		inst.monthSwitcher.inclusion().on('slideright', function(month){
			inst.purifyCurrentDate(null, month);
			inst.buildMonth();
		});


		// Update month when user changes year.
		inst.yearSwitcher.inclusion().on('change', function(index, year){
			inst.purifyCurrentDate(year);
			inst.buildMonth();
		});

		// Set new day when user clicks on any day.
		inst.on('dayselect', function(dayIndex)
		{
			var p = inst.params();
			dayIndex = parseInt(dayIndex);
			p._day = dayIndex;
			p._month = p._curMonth;
			p._year = p._curYear;
			var dateText = p._year + '-' + p._month + '-' + p._day;
			inst.val(dateText);
			inst.triggerEvent('change', inst.formatDate());
		});
	},
	
	
	styles : {
		wrap : {
			display: 'flex',
			flexDirection: 'column',
			width: '100%',
			minHeight: '100%',
			padding: '0.25rem',
			backgroundColor: '#fff',
			border: '1px solid #ccc',
			
			header : {
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				lineHeight: 1.1,
				padding: '0.5rem',
				minHeight: '3rem',
				backgroundColor: '#1d57b1',
				flexShrink: 0
			},
			
			body: {
				display: 'flex',
				flexDirection: 'column',
				userSelect: 'none',
				cursor: 'default',
				margin: '0 auto',
				
				labels : {
					display: 'flex',
					flexShrink: 0,
					marginTop: '1rem',
					justifyContent: 'center'
				},
				
				days : {
					display: 'flex',
					flexWrap: 'wrap',
					justifyContent: 'center'
				}
			}
		}
	}
});