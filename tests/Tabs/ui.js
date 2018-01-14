/**
 * UI of the tabs container.
 */
UI.register({
	
	name : 'Tabs',
	
	scheme : {
		wrap : {
			tabs : '|Tabs-tab',
			contents : '|Tabs-content'
		}
	},
	
	styles : {
		wrap : {
			margin: '15px 0'
		},
		tabs : {
			display : 'flex',
			padding: '0 10px',
			borderBottom : '1px solid #ccc'
		}
	},
	
	onrender : function(inst, params, event)
	{
		inst.on('load', function(data, event){
			event.preventDefault(); // Prevent default data loading process.
			
			for(var p in data){
				var content = this.contents.addOne();
				content.wrap.load(data[p]);
				var tab = this.tabs.addOne().load(p).wrap.makeTabFor(content.wrap);
			}
		});
	}
});





UI.register({
	
	name : 'Tabs-tab',
	
	scheme : {
		wrap : ''
	},
	
	styles : {
		wrap : {
			padding: '8px 15px',
			border: '1px solid #ccc',
			margin: '0 3px',
			position: 'relative',
			top: '1px',
			cursor: 'default',
			fontFamily: 'sans-serif',
			fontSize: '14px',
			backgroundColor : '#f9f9f9',
			
			':hover' : {
				backgroundColor : '#f3f3f3'
			},
			
			'.active' : {
				borderBottom: '2px solid #ffffff',
				backgroundColor : '#ffffff'
			},
			
			
		}
	}
});

UI.register({
	
	name : 'Tabs-content',
	
	scheme : {
		wrap : ''
	}
});



UI.register({
	
	name : 'Content',
	
	scheme : {
		wrap : {
			title : '@h2',
			text : '@p'
		}
	},
	
	styles : {
		wrap : {
			flexDirection: 'column',
			padding : '15px',
			border: '1px solid #ccc',
			borderTop: 'none'
		},
		
		title : {
			fontFamily: 'sans-serif',
			fontSize : '18px',
			fontWeight: 600,
			marginBottom: '10px'
		},
		
		text : {
			fontFamily: 'sans-serif',
			fontSize : '14px',
			margin: 0
		}
	}
});

