UI.register({
	
	name : 'Form 1',
	
	scheme : {
		wrap : {
			login : '<<< Input {name = login}',
			pass : '<<< Input {name = pass; type = password}',
			rememberMe : '<<< Checkbox {name = remember-me; label = Remember me}',
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

	methods: {
		val(value) {
			return this.input.val(value);
		},
		name(value) {
			if (value !== undefined) {
				this.input.attr('name', value);
            }
            return this.input.attr('name');
		}
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

	methods: {
		checked() {
			return this.input.prop('checked');
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
    name: 'Block 1',

    scheme: {
        wrap: {
			field: '<<< Input'
        }
    },

    params: {
    	name: 'block',
        text: ''
    },

    onRender(inst, params) {
        inst.field.inclusion().val(params.text);
        inst.field.inclusion().name(params.name);
    }
});



UI.register({
	name: 'Test',
	
	scheme: {
		wrap: {
			blocks: '|Block 1 [name = name]',
            compactData : '<<< Checkbox {label = Compact data}',
            btn : '@button (html = Gather)',
			output: '@pre'
		}
	},
	
	params: {
		name: ''
	},
	
	onRender(inst, params) {
		if (params.name !== '') inst.wrap.attr('name', params.name);

		for (let i = 1; i <= 10; i++) {
            inst.blocks.addOne({text: 'Item ' + i});
		}

		inst.btn.on('click', inst => {
            inst.output.text(JSON.stringify(inst.wrap.gatherData(inst.compactData.inclusion().checked())));
        });
	},

	styles: {
		wrap: {
			blocks: {
				' > *': {
					marginBottom: '5px'
				}
			},

			btn : {
				margin: '10px 0 20px 0',
				padding : '5px 15px',
				fontSize : '14px',
				fontFamily : 'sans-serif'
			}
		}
	}
});