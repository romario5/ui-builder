UI.register({
	name : 'Test 2',
	
	scheme : {
		wrap : {
			toolbar : {
				title : '@h3 (text = Test 2)',
				btn : '<<< Run button'
			},
			progressBar : {
				bar : ''
			}
		}
	},
	
	styles : {
		wrap : {
			display: 'flex',
			flexDirection: 'column',
			border: '1px solid #ccc',
			padding: '15px',
			marginBottom: '15px'
		},
		toolbar : {
			display: 'flex',
			alignItems: 'center',
			marginBottom: '15px',
			
			title : {
				fontFamily: 'monospace'
			}
		},
		btn : {
			alignSelf: 'flex-start',
			marginLeft: '15px'
		},
		progressBar : {
			width: '100%',
			height: '20px',
			border: '1px solid #333',
			borderRadius: '3px'
		},
		bar : {
			width: 0,
			height: '20px',
			backgroundColor: '#59b0d8',
			borderRadius: '2px'
		}
	},
	
	onrender : function(inst, params){
		inst.btn.on('click', function(){
			inst.bar.css({width : 0});
			inst.bar.animate({
				width: '100%'
			}, 2000);
		});
	}
});