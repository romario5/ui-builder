UI.register({
	
	name : 'Form 1',
	
	scheme : {
		wrap : {
			login : '<<< Input {name = login}',
			pass : '<<< Input {name = pass; type = password}',
			rememberMe : '<<< Checkbox {name = remember-me; label = Remember me}',
			text: '<<< Test [name = name]',
			btn : '@button (html = Gather)',
			output : '@pre'
		}
	},
	
	styles : {
		wrap : {
			' > div' : {
				margin: '10px 0'
			}
		},
		btn : {
			margin: '10px 0 20px 0',
			padding : '5px 15px',
			fontSize : '14px',
			fontFamily : 'sans-serif'
		}
	},
	
	onrender : function(form, params)
	{
		form.btn.on('click', function(inst, event){
			inst.output.text(JSON.stringify(inst.wrap.gatherData()));
		});
	}
});


UI.register({
	
	name : 'Input',
	
	scheme : {
		input : '@input'
	},
	
	styles : {
		input : {
			height: '32px',
			boxSizing: 'border-box',
			padding : '3px 5px',
			borderRadius : '5px',
			outline: 'none',
			backgroundColor: '#fff',
			border: '1px solid #999',
			
			':focus' : {
				borderColor: '#333'
			}
		}
	},
	
	params : {
		bg : '#fff',
		border : 1
	},
	
	onrender : function(inst, params){
		
		if(params.hasOwnProperty('name')){
			inst.input.attr('name', params.name);
		}
		
		if(params.hasOwnProperty('type')){
			inst.input.attr('type', params.type);
		}
	}
});


UI.register({
	
	name : 'Checkbox',
	
	scheme : {
		wrap : {
			input : '@input [type = checkbox]',
			label : ''
		}
	},
	
	rules : {
		wrap : '@label'
	},
	
	styles : {
		wrap : {
			display : 'flex',
			alignItems : 'center'
		},
		input : {
			marginRight : '5px'
		},
		label : {
			fontSize : '14px',
			fontFamily : 'sans-serif'
		}
	},
	
	onrender : function(inst, params){
		
		if(params.hasOwnProperty('name')){
			inst.input.attr('name', params.name);
		}
		
		if(params.hasOwnProperty('label')){
			inst.label.text(params.label);
		}
		
		inst.input.val(params.hasOwnProperty('value') ? params.value : 'true');
	}
});



UI.register({
	name: 'Test',
	
	scheme: {
		wrap: {
			
		}
	},
	
	params: {
		name: ''
	},
	
	onRender(inst, params) {
		if (params.name !== '') inst.wrap.attr('name', params.name);
	},
	
	onGather(inst, data, event) {
		data.value('this is test');
		event.preventDefault();
	}
});