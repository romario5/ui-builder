UI.register({
	name : 'Test 1',
	
	scheme : {
		wrap : {
			toolbar : {
				title : '@h3 (text = Test 1)',
				btn : '<<< Run button'
			},
			content : {
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
		content : {
			width: '100%',
			height: '50px',
			position: 'relative'
		},
		bar : {
			width: '50px',
			height: '50px',
			backgroundColor: '#59b0d8',
			position: 'absolute',
			top: 0,
			left: 0,
			transform: 'rotate(0deg)',
			borderRadius: '3px'
		}
	},
	
	
	onrender : function(inst, params){
		inst.btn.on('click', function(){
			
			// Calculate end left value.
			var w = inst.content.outerWidth() - inst.bar.outerWidth();
			
			// Create animation and run it.
			new Animation(4000).run(function(k){
				inst.bar.css({
					left: w*k +'px',
					transform: 'rotate(' + (1440*k) + 'deg)'
				});
			});
		});
	}
});
