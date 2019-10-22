UI.register({
	
	name : 'Example',
	
	scheme : {
		wrap : {
			
		}
	},
	
	params: {
		text: ''
	},
	
	onRender: (inst, params) => {
		inst.wrap.text(params.text);
	},
	
	styles : {
		wrap : {
			width: '100px',
			height: '100px',
			backgroundColor: '#333',
			margin: '10px',
			color: '#fff',
			display: 'flex',
			flexGrow: 0,
			flexShrink: 0,
			justifyContent: 'center',
			alignItems: 'center',
			fontSize: '36px'
		}
	}
});
