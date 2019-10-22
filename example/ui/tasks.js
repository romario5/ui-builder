UI.register({

    namespace: 'Tasks list',

    name : 'Tasks list',
	
    scheme : {
        wrap : {
            list : '|Task',
            toolbar : {
                titleInput : '@input [type = text]',
				addButton : '@button [type = button] (html = Add task)'
            }
        }
    },

    rules: {
        toolbar: '@form'
    },

	dependencies: {
    	list: 'Completable'
	},
    
	params : {
        storage: null,
		width : 400,
		height: 600
	},

    methods: {
        createTask() {
            let text = this.titleInput.val().trim();
            let storage = this.params().storage;
            if(text === '') return;

            let task = storage.createEntity({title: text});
            storage.add(task);

            let newItem = this.list.addOne().load(task);

            newItem.wrap.css({height:0});
            newItem.wrap.slideDown();
            this.titleInput.val('');

            let ajax = new Ajax({
                url: 'http://ubp5.com/test/redirect',
                method: 'GET',
                headers: {
                    'Access-Control-Allow-Origin': '*'
                }
            });

            ajax.on('redirect', e => {
                console.log(e);
            });

            ajax.send();
        }
    },

    onBeforeRender(config) {
        config.container = UI('Overlay').render().content;
    },
	
	onRender(inst, params) {

        inst.toolbar.on('submit', (inst, e) => {
            e.preventDefault();
            inst.createTask();
        });

		// Apply parameters.
		inst.wrap.css({
			width : params.width + 'px',
			height : params.height + 'px'
		});
		
		// Add click event handler to the adding button.
		inst.addButton.on('click', inst => inst.createTask());

	},

    styles : {
        wrap : {
            display: 'flex',
            flexDirection : 'column',
            backgroundColor: '#fff',
            boxShadow : '3px 3px 20px rgba(0,0,0,0.05)',
            padding: '20px'
        },

        toolbar : {
            display: 'flex',
            flexGrow: 0,
            flexShrink: 0,
            width: '100%',
            marginTop: '20px'
        },

        titleInput : {
            display: 'flex',
            flexGrow: 1,
            height: '36px',
            borderRadius: '3px 0 0 3px',
            padding: '0 5px',
            border: '1px solid #999',
            borderRight: 'none',
            outline: 'none',
            boxShadow: '0 0 0 0 rgba(255,0,0,0.2)',
            transition: '0.15s',
            boxSizing: 'border-box',

            fontSize: '0.9rem',

            ':focus' : {
                boxShadow: '0 0 0 3px rgba(200,50,100,0.2)',
                borderColor: 'rgb(237, 40, 105)'
            }
        },

        addButton : {
            height: '36px',
            borderRadius: '0 3px 3px 0',
            backgroundColor: 'rgba(200,50,100,1)',
            padding: '0 15px',
            color: '#fff',
            border: 'none',
            outline: 'none',
            fontSize: '0.9rem',
            boxShadow: '0 0 0 0 rgba(255,0,0,0.2)',
            transition: '0.15s',

            ':focus' : {
                boxShadow: '0 0 0 3px rgba(200,50,100,0.2)'
            },

            ':hover' : {
                backgroundColor: 'rgb(237, 40, 105)'
            }
        },

        list : {
            display: 'flex',
            flexDirection : 'column',
            flexGrow: 1,
            overflowY: 'auto'
        }
    }
});



UI.register({
    name : 'Task',
	
    scheme : {
        wrap : {
            checkbox : {
				chk : '@input [type = checkbox]',
				box : '@div'
			},
            title : '@span',
            deleteButton : "(html = &#x2715;)"
        }
    },
	
	rules : {
		checkbox : '@label'
	},
	
	methods: {
		complete() {

		},

		isCompleted() {

		}
	},
	
	onRender(inst) {
		// Add handler for deleting task.
		inst.deleteButton.on('click', function(taskInst){
			// Show collapsing animation.
			taskInst.wrap.animate({
				height : 0,
				opacity : 0,
				marginTop : 0,
				marginBottom : 0
			}, 250, function(){taskInst.remove();});
		});
	},

    onLoad(inst, task) {


        // inst.wrap.bindWith(task);

        inst.chk.on('change', inst => {
             task.completed = inst.chk.prop('checked');
        });
    },

    styles : {
        wrap : {
            display: 'flex',
            flexShrink: 0,
            margin: '5px',
            backgroundColor: '#f6f6f6'
        },

        title : {
            display: 'flex',
            alignItems: 'center',
            padding: '15px',
            flexGrow: 1,
            minHeight: '20px',
            fontFamily: 'Raleway, sans-serif'
        },

        deleteButton : {
            alignSelf: 'center',
            marginRight: '15px',
            cursor: 'default',
            color: '#999999',

            ':hover' : {
                color: '#000000'
            }
        },

        checkbox : {

            ' input' : {
                display: 'none'
            },

            ' div' : {
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                width: '20px',
                height: '20px',
                border: '1px solid #cccccc',
                backgroundColor: '#ffffff',
                margin: '15px',
                position: 'relative'
            },

            ' input:checked ~ div' : {
                borderColor : '#333'
            },

            ' input:checked ~ div::before' : {
                content: '',
                display: 'block',
                position: 'absolute',
                top: '4px',
                width: '14px',
                height: '6px',
                borderBottom: '2px solid #333',
                borderLeft: '2px solid #333',
                transform: 'rotate(-50deg)'
            }
        }
    }
});





UI.register({
	name : 'Round spinner',
	
	scheme : {
		wrap : {
			
		}
	},
	
	styles : {
		wrap : {
			width : '200px',
			height : '200px',
			backgroundColor : '#900'
		}
	},
	
	onrender : function(inst, params, event){
		console.log(event);
	},
	
	onfadein : function(inst, event){
		console.log(event);
	},
	
	onfadeout : function(inst, event){
		console.log(event);
	}
	
	
});



Interface.register('Completable', [
	'complete(value)',
	'isCompleted()'
]);