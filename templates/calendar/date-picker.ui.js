UI.register({
	name : 'Date picker',


	scheme : {
		wrap : {
			date : '',
			calendarPopover : '<<< Calendar'
		}
	},


	params : {
		name : null,
		weekStartsFrom : 'monday',
		selectedDate : '1988-12-05'
	},


	onrender : function(inst, params){
		inst.date.makeDropdown(inst.calendarPopover);
		inst.wrap.makeDraggable({x: true, y: true});

		// Set "name" attribute.
		var calendar = inst.calendarPopover.inclusion();
		calendar.setName(params.name);
		calendar.setSelectedDate(params.selectedDate);
		calendar.setWeekStartingDay(params.weekStartsFrom);

		// Add custom expanding logic.
		inst.calendarPopover.on('expand', function(el, event)
		{
			// Avoid defauld expanding animation.
			event.preventDefault();

			// Update labels depending on current language.
			var calendar = inst.calendarPopover.inclusion();
			calendar.updateLabels();
			calendar.on('change', function(newDate){
				inst.date.text(newDate);
			});

			var box = inst.wrap.clientRect();

			// Window size without toolbars and scrollbars.
			var w = window.innerWidth;
			var h = window.innerHeight;

			// Show picker below the input when position is in the top part of the screen.
			if(box.top < h/2){
				this.css({
					display: 'flex',
					bottom: 'initial',
					top : box.top + box.height + 8 + 'px',
					right: w - box.left - box.width + 'px',
					opacity: 0
				});
				this.removeClass('arror-bottom').addClass('arrow-top');

			// Otherwise show picker above.	
			}else{
				this.css({
					display: 'flex',
					top: 'initial',
					bottom : h - box.top + 8 + 'px',
					right: w - box.left - box.width + 'px',
					opacity: 0
				});
				this.removeClass('arror-top').addClass('arrow-bottom');
			}

			this.fadeIn(100);
		});

		// Add custom collapsing logic.
		inst.calendarPopover.on('collapse', function(el, event)
		{
			// Avoid default collapsing animation.
			event.preventDefault();

			this.removeClass(['arrow-top', 'arrow-bottom']);
			this.fadeOut(100, function(){
				this.css({
					display: 'none',
					opacity: 0
				});
			});
			
		});
	},


	styles : {
		wrap : {
			position: 'relative',

			date : {
				display: 'flex',
				alignItems: 'center',
				width: '10rem',
				height: '1.5rem',
				border: '1px solid #999',
				backgroundImage: 'url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAANCAYAAACgu+4kAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyFpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNS1jMDIxIDc5LjE1NDkxMSwgMjAxMy8xMC8yOS0xMTo0NzoxNiAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIChXaW5kb3dzKSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDo4ODI5Rjc5MjMzMTkxMUU4OUIxQ0YyQ0I2MDI1OThFNyIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDo4ODI5Rjc5MzMzMTkxMUU4OUIxQ0YyQ0I2MDI1OThFNyI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjg4MjlGNzkwMzMxOTExRTg5QjFDRjJDQjYwMjU5OEU3IiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOjg4MjlGNzkxMzMxOTExRTg5QjFDRjJDQjYwMjU5OEU3Ii8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+YyFwcAAAAEFJREFUeNpiZGBgcGDAAf7\/\/3+AgQjggIsNNICBEGZioBAw4vMCscCBEvaoF6jhBWISC229ALUBvyJGRpzeBAgwAJqAQlUp+tRkAAAAAElFTkSuQmCC")',
				backgroundRepeat: 'no-repeat',
				backgroundPositionX: 'calc(100% - 0.25rem)',
				backgroundPositionY: 'center',
				cursor: 'default',
				fontFamily: 'sans-serif',
				padding: '0 0.25rem',
				fontSize: '0.8rem',

				'.dropdown-expanded' : {
					borderColor: '#fe9501'
				}
				
			},


			calendarPopover : {
				position: 'fixed',
				transition: '0.1s',
				display: 'none',
				opacity: 0,
				zIndex: 5,

				'.arrow-top::before' : {
					content: '',
					display: 'block',
					width: '0.5rem',
					height: '0.5rem',
					position: 'absolute',
					right: '0.5rem',
					top: '-0.25rem',
					borderWidth: '1px 0 0 1px',
					borderStyle: 'solid',
					borderColor: 'transparent',
					borderTopColor: '#ccc',
					borderLeftColor: '#ccc',
					transform: 'rotate(45deg)'
				},

				'.arrow-top::after' : {
					content: '',
					display: 'block',
					width: '0',
					height: '0',
					position: 'absolute',
					right: '0.42rem',
					top: '-0.6rem',
					borderWidth: '0.35rem',
					borderStyle: 'solid',
					borderColor: 'transparent',
					borderBottomColor: '#fff'
				},

				'.arrow-bottom::before' : {
					content: '',
					display: 'block',
					width: '0.5rem',
					height: '0.5rem',
					position: 'absolute',
					right: '0.5rem',
					bottom: '-0.22rem',
					borderWidth: '0 1px 1px 0',
					borderStyle: 'solid',
					borderColor: 'transparent',
					borderBottomColor: '#ccc',
					borderRightColor: '#ccc',
					transform: 'rotate(45deg)'
				},

				'.arrow-bottom::after' : {
					content: '',
					display: 'block',
					width: '0',
					height: '0',
					position: 'absolute',
					right: '0.42rem',
					bottom: '-0.6rem',
					borderWidth: '0.35rem',
					borderStyle: 'solid',
					borderColor: 'transparent',
					borderTopColor: '#fff'
				}
			}
		}
	}
});
