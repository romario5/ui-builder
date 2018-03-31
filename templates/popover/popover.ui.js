/**
 * Calendar realize Date selector.
 */
UI.register({
    name : 'Popover',

    scheme : {
        wrap : {
            header : {
                currentDay : '(text = 5)',
                monthSwitcher : '<<< Calendar switcher {arrowsSize = 0.45; labelSize = 0.95; loopAround = true}',
                yearSwitcher : '<<< Calendar switcher {arrowsSize = 0.45; labelSize = 0.75; loopAround = false}'
            },
			body : {
				labels : '|Calendar label',
				days : '|Calendar day'
			}
        }
    },
	
	
	params : {
		sizeFactor : 1,
		size : 14,
		selectedDate : '2018-12-05',
		weekStartsFrom : 'monday',
		
		// Selected date.
		_year : 2018,
		_month : 1,
		_day : 1,
		_dayOfWeek : 1,

		// Start date.
		_yearFrom : 1988,
		_monthFrom : 1,
		_dayFrom : 1,
		_dayOfWeekFrom : 1,

		// End date.
		_yearTo : 2088,
		_monthTo : 1,
		_dayTo : 1,
		_dayOfWeekTo : 1,
	},
	
	
	methods : {
		daysLabels : function(){
			var labels = {
				en : ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'],
				ru : ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
			}
			return labels[UI.getLanguage()];
		},

		setDate : function(date){
			var d = new Date(date.replace(' ', 'T'));
			var p = this.params();
			p._year = d.getFullYear();
			p._month = d.getMonth();
			p._day = d.getDate();
			p._dayOfWeek = d.getDay();
			this.monthSwitcher.inclusion().val(p._month);
			this.currentDay.text(p._day);
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
		
		buildMonth : function(month){
			var p = this.params();
			var d = new Date(p._year, month, 1);
			var dayOfWeek = d.getDay();
			var offset = this.getWeekOffset();
			var daysInMonth = 33 - new Date(p._year, month, 33).getDate();


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
				if(i === p._day && month == p._month){
					day.wrap.addClass('active');
				}
			}
			
			// Render empty days from previous month.
			var rows = Math.ceil((daysInMonth + prevMonthDays)/7);
			var t = rows * 7 - (daysInMonth + prevMonthDays);
			console.log('Day of week', dayOfWeek);
			console.log('Offset', offset);
			console.log('Days in month', daysInMonth);
			console.log('Total blocks', dayOfWeek + daysInMonth);
			console.log('Rows', rows);
			console.log('Total', t);

			for(var i = 0; i < t; i++){
				this.days.addOne().wrap.css({visibility: 'hidden'});
			}
		}
	},
	
	
	onrender : function(inst, params)
	{
		inst.monthSwitcher.inclusion().setOptions([
			'January', 'February', 'March', 'April', 
			'May', 'June', 'July', 'August', 
			'September', 'October', 'November', 'December'
		]);

		var years = [];
		for(var i = params._yearFrom; i <= params._yearTo; i++){
			years.push(i);
		}
		inst.yearSwitcher.inclusion().setOptions(years);
		inst.yearSwitcher.inclusion().val(params._year);

		inst.setDate(params.selectedDate);
		inst.buildMonth(params._month);
		
		params.sizeFactor = params.size / 14;
		
		inst.wrap.css({
			width: params.size + 'rem',
			minHeight: params.size * params.sizeFactor + 'rem',
		});

		inst.days.css({
			width: 1.7 * params.sizeFactor * 7  + 1 + 'rem'
		});

		// Render days labes.
		var labels = inst.daysLabels();
		for(var i = 0; i < labels.length; i++){
			inst.labels.addOne({label : labels[i]});
		}

		// Update month days when user change month.
		inst.monthSwitcher.inclusion().on('slideleft', function(newMonth){
			inst.buildMonth(newMonth);
			console.log('shitched to the left');
		});

		inst.monthSwitcher.inclusion().on('slideright', function(newMonth){
			inst.buildMonth(newMonth);
			console.log('shitched to the right');
		});


		// Update month when user changes year.
		inst.yearSwitcher.inclusion().on('change', function(index, newYear){
			var p = inst.params();
			p._year = newYear;
			inst.buildMonth(p._month);
		});

		// Set new day when user clicks on any day.
		inst.on('dayselect', function(dayIndex){
			inst.currentDay.text(dayIndex);
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
			boxShadow: '0 0 2px rgba(0,0,0,0.25)',
			
			header : {
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				lineHeight: 1.1,
				padding: '0.5rem',
				minHeight: '3rem',
				backgroundColor: '#07439f',
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
			},

			currentDay : {
				color: '#fff',
				fontSize: '2.5rem',
				fontFamily: 'sans-serif'
			}
		}
	}
});