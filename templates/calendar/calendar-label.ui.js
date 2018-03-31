/**
 * Calendar realize Date selector.
 */
UI.register({
    name : 'Calendar label',

    scheme : {
        wrap : ''
    },
	
	
	params : {
		size : 1,
		label: '1'
	},


	onrender : function(inst, params){
		inst.wrap.text(params.label);
	},
	
	
	styles : {
		wrap : {
			display: 'flex',
			justifyContent: 'center',
			alignItems: 'center',
			width: '1.5rem',
			height: '1.5rem',
			fontWeight: 600,
			fontFamily: 'sans-serif',
			fontSize: '0.75rem',
			margin: '2px'
		}
	}
});