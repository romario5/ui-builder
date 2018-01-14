// Styles for the planet sattelite.
var circleStyle = {
	display : 'flex',
	top : '50%',
	left : '50%',
	margin : 'auto',
	borderTop : '2px solid rgba(0,0,0,0.5)',
	borderBottom : '2px solid transparent',
	borderLeft : '2px solid transparent',
	borderRight : '2px solid transparent',
	position : 'absolute'
};

UI.registerSpinner({
	name : 'Default spinner',
	
	scheme : {
		wrap : {
			planet : '',
			circle_1 : '',
			circle_2 : '',
			circle_3 : '',
		}
	},
	
	params : {
		radius : 2,
		height : 10,
		noFade : false
	},
	
	styles : {
		'@keyframes spinnerRotation' : {
			'0%' : {transform : 'rotate3d(-1.2, 1, -1, 75deg) rotate3d(0, 0, 1, 0deg)', zIndex : 0},
			'16%' : {transform : 'rotate3d(-1.2, 1, -1, 75deg) rotate3d(0, 0, 1, 57.6deg)', zIndex : 0},
			'50%' : {transform : 'rotate3d(-1.2, 1, -1, 75deg) rotate3d(0, 0, 1, 180deg)', zIndex : 2},
			'75%' : {transform : 'rotate3d(-1.2, 1, -1, 75deg) rotate3d(0, 0, 1, 270deg)', zIndex : 0},
			'100%' : {transform : 'rotate3d(-1.2, 1, -1, 75deg) rotate3d(0, 0, 1, 360deg)', zIndex : 0}
		},
		
		wrap : {
			display : 'flex',
			flexGrow : 1,
			width : '100%',
			height : '100%',
			backgroundColor : 'rgba(255,255,255,0.35)',
			transition : '0.25s',
			position : 'absolute',
			top : 0,
			left : 0,
			animation : 'spinnerFadeIn 0.25s linear',
			
			'.fade-in' : {
				opacity : 1,
				backgroundColor : 'rgba(255,255,255,1)'
			},
			
			'.fade-out' : {
				opacity : 0
			}
		},
		planet : {
			display : 'flex',
			justifyContent : 'center',
			alignItems : 'center',
			fontSize : '4rem',
			backgroundImage: 'radial-gradient(#444, #333)',
			margin : 'auto',
			zIndex : 1,
			backgroundColor : '#fff',
			opacity : 0.85,
		},
		circle_1 : circleStyle,
		circle_2 : circleStyle,
		circle_3 : circleStyle
	},
	
	onrender : function(spinner, params){
		
		// Apply parameters for each instance.
		spinner.wrap.css({height : params.height});
		
		spinner.planet.css({
			width : params.radius * 0.7 + 'rem',
			height : params.radius * 0.7 + 'rem',
			fontSize : params.radius * 0.8 + 'rem',
			borderRadius : params.radius + 'rem'
		});
		
		spinner.circle_1.css({
			width : params.radius + 'rem',
			height : params.radius + 'rem',
			borderRadius : params.radius + 'rem',
			marginLeft : -params.radius/2 + 'rem',
			marginTop : -params.radius/2 + 'rem',
			animation : 'spinnerRotation 0.5s linear infinite'
		});
		
		spinner.circle_2.css({
			width : params.radius * 1.2 + 'rem',
			height : params.radius * 1.2 + 'rem',
			borderRadius : params.radius * 1.2 + 'rem',
			marginLeft : -params.radius * 1.2/2 + 'rem',
			marginTop : -params.radius * 1.2/2 + 'rem',
			animation : 'spinnerRotation 0.75s linear infinite'
		});
		
		spinner.circle_3.css({
			width : params.radius * 1.4 + 'rem',
			height : params.radius * 1.4 + 'rem',
			borderRadius : params.radius * 1.4 + 'rem',
			marginLeft : -params.radius * 1.4/2 + 'rem',
			marginTop : -params.radius * 1.4/2 + 'rem',
			animation : 'spinnerRotation 0.95s linear infinite'
		});
		
		
		spinner.wrap.on('click', function(){
			spinner.UI().hideInside(this.__.node.parentNode);
		});
	},
	
	onfadein : function(inst, event){
		if(inst.params().noFade) event.preventDefault();
	},
	
	onfadeout : function(inst, event){
		if(inst.params().noFade){
			event.preventDefault();
			inst.remove();
		}
	},
});