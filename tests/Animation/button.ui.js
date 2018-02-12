UI.register({
	name : 'Run button',
	
	scheme : {
		button : '@button (text = Run)'
	},
	
	styles : {
		button : {
			border: 'none',
			backgroundColor: '#333',
			borderRadius: '3px',
			outline: 'none',
			padding: '8px 15px',
			color: '#fff',
			
			':hover' : {
				backgroundColor: '#444',
			}
		}
	}
});