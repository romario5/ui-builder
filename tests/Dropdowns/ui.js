UI.register({
	
	name : 'Layout',
	
	scheme : {
		wrap : {
			dropdown_1 : '<<< Dropdown',
			dropdown_2 : '<<< Dropdown',
			dropdown_3 : '<<< Dropdown'
		}
	},
	
	styles : {
		wrap : {
			display : 'flex'
		}
	}
});





UI.register({
	
	name : 'Dropdown',
	
	scheme : {
		wrap : {
			label : '(html = Some test)',
			items : {
				link_1 : '@a [href = #anchor-1] (text = Link 1)',
				link_2 : '@a [href = #anchor-1] (text = Link 1)',
				link_3 : '@a [href = #anchor-3] (text = Link 1)',
			}
		}
	},
	
	styles : {
		wrap : {
			margin: '0 3px',
			position: 'relative',
			top: '1px',
			cursor: 'default',
			fontFamily: 'sans-serif',
			fontSize: '14px',
			
			':hover' : {
				backgroundColor : '#f9f9f9'
			},
			
			'.active' : {
				borderBottom: '2px solid #ffffff',
				backgroundColor : '#ffffff'
			},
		},
		label : {
			display: 'flex',
			border: '1px solid #ccc',
			padding : '5px 10px 5px 10px',
			position: 'relative',
			
			'::after' : {
				content: '',
				display: 'block',
				width: '8px',
				height: '8px',
				borderBottom: '1px solid #333',
				borderRight: '1px solid #333',
				transform: 'rotate(45deg)',
				marginLeft: '10px',
				marginTop: '1px'
			}
		},
		items : {
			position: 'absolute',
			backgroundColor: '#fff',
			top: '100%',
			display : 'flex',
			flexDirection : 'column',
			padding: '10px',
			minWidth: '60px',
			boxShadow: '1px 1px 3px rgba(0,0,0,0.25)'
		}
	},
	
	onrender : function(inst)
	{
		inst.label.makeDropdown(inst.items);
	}
});