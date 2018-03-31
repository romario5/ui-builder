/**
 * Calendar realize Date selector.
 */
UI.register({
    name : 'Calendar day',

    scheme : {
        wrap : ''
    },
	
	
	params : {
		sizeFactor :1,
		size : 1.5,
		index : 1
	},
	
	
	onrender : function(inst, params)
	{	
		inst.wrap.text(params.index);
		
		inst.wrap.css({
			width: params.size * params.sizeFactor + 'rem',
			height: params.size * params.sizeFactor + 'rem'
		});
		
		
		inst.wrap.on('click', function(){
			var items = this.parent().children();
			for(var i = 0; i < items.length; i++){
				items[i].wrap.removeClass('active');
			}
			this.addClass('active');

			inst.parentUII().triggerEvent('dayselect', this.text());
		});
	},
	
	
	styles : {
		wrap : {
			display: 'flex',
			justifyContent: 'center',
			alignItems: 'center',
			width: '1.5rem',
			height: '1.5rem',
			backgroundColor: '#fcfcfc',
			fontFamily: 'sans-serif',
			fontSize: '0.75rem',
			margin: '2px',
			border: '1px solid #f9f9f9',
			
			':hover' : {
				borderColor: '#ddd'
			},
			
			'.active' : {
				borderColor: '#fe9501'
			}
		}
	}
});