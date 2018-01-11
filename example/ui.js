UI.register({
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
    
	parameters : {
		width : 400,
		height: 600
	},
	
	styles : {
		wrap : {
			display: 'flex',
			flexDirection : 'column',
			margin: '40px auto',
			backgroundColor: '#fff',
			boxShadow : '0 0 5px rgba(0,0,0,0.4)',
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
			height: '30px',
			padding: '0 5px',
			border: '1px solid #999',
			borderRight: 'none',
			outline: 'none',
			boxShadow: '0 0 0 0 rgba(255,0,0,0.2)',
			transition: '0.15s',
			boxSizing: 'border-box',
			
			':focus' : {
				boxShadow: '0 0 0 3px rgba(200,50,100,0.2)'
			}
		},
		
		addButton : {
			height: '30px',
			backgroundColor: 'rgba(200,50,100,1)',
			padding: '0 15px',
			color: '#fff',
			border: 'none',
			outline: 'none',
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
	},
	
	onrender : function(inst, params)
	{
		// Apply parameters.
		inst.wrap.css({
			width : params.width + 'px',
			height : params.height + 'px'
		});
		
		// Add click event handler to the adding button.
		inst.addButton.on('click', function(){
			var text = inst.titleInput.val().trim();
			if(text === '') return;
			var newItem = inst.list.addOne().load({title : text});
			
			newItem.wrap.css({height:0});
			newItem.wrap.slideDown();
			inst.titleInput.val('');
		});
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
	},
	
	onrender : function(inst)
	{
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
	}
});