UI.register({
	name : 'Task manager',
	
	scheme : {
		wrap : {
			items : '|Task',
			toolbar : {
				input : '@input',
				button : '@button [type = button] (text = Send)'
			}
		}
	},
	
	
	onrender : function(inst, params)
	{
		inst.button.on('click', function(){
			var text = inst.input.val();
			inst.items.addOne().name.text(text);
		});
	},
	
	
	styles : {
		wrap : {
			display: 'flex',
			flexDirection: 'column',
			width: '400px',
			height: '600px',
			border: '1px solid #ccc',
			margin: '20px',
			
			items : {
				display: 'flex',
				flexDirection: 'column',
				flexGrow: 1
			},
			
			toolbar : {
				display: 'flex',
				height: '60px',
				backgroundColor: '#f3f3f3',
				alignItems: 'center',
				
				input : {
					marginRight: '10px'
				}
			}
		}
	}
});





UI.register({
	name : 'Task',
	
	scheme : {
		wrap : {
			checkbox : '@input [type = checkbox]',
			name : '',
			deleteButton : '(text = x)'
		}
	},
	
	
	onrender : function(inst){
		inst.deleteButton.on('click', function(){
			inst.remove();
		});
	},
	
	
	styles : {
		wrap : {
			width: '320px',
			display: 'flex',
			backgroundColor: '#f90',
			padding: '10px',
			margin: '10px'
		},
		
		fields : {
			
			login : {
				margin: '10px'
			},
			password : {
				margin: '10px'
			}
		},
		
		deleteButton : {
			marginLeft: 'auto'
		}
	}
});