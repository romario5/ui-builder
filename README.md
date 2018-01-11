# UIBuilder

A small frontend library for quick generation and management of 
DOM structure blocks.

### Main concept
The idea is in reusing predefined interface parts schemes for building 
instances of this parts. All data generated is stored in the objects and 
can be quickly got by reference. 

Also objects that represents single DOM nodes has few very useful methods
implements jQuery syntax.


### Example:
Lets create classic tasks list: input field and adding button. User can input text in the field and add task by clicking button.
#### The tasts list interface:

```js
UI.register({
    name : 'Tasks list',
	
    scheme : {
        wrap : {
            list : '|Task', // Task - is the name of UI that will be used as regular item of list.
            toolbar : {
                titleInput : '@input [type = text]',
				addButton : '@button [type = button] (html = Add task)'
            }
        }
    },
    
    // Some parameters
    parameters : {
        width : 400,
        height: 600
    },
	
    // Set interface appearance
    styles : {
        wrap : {
            display: 'flex',
            flexDirection : 'column',
            margin: '40px auto',
            backgroundColor: '#fff',
            boxShadow : '0 0 5px rgba(0,0,0,0.4)',
            padding: '20px'
        },
        
        // And so on...
    },
	
    // Function that will be called on each instance creation
    onrender : function(inst, params)
    {
        // Apply parameters.
        inst.wrap.css({
            width : params.width + 'px',
            height : params.height + 'px'
        });
        
        // Add click event handler to the adding button
        inst.addButton.on('click', function(){
            var text = inst.titleInput.val().trim();
            if(text === '') return;
            var newItem = inst.list.addOne().load({title : text});
            
            // Show sliding animation
            newItem.wrap.css({height:0});
            newItem.wrap.slideDown();

            // And empty input box
            inst.titleInput.val('');
        });
    }
});
```

#### Then lets describe scheme of the single task record:

```js
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
	
    // Additional rules
    rules : {
        checkbox : '@label'
    },
	
    // Again some styles...
    styles : {
        wrap : {
            display: 'flex',
            flexShrink: 0,
            margin: '5px',
            backgroundColor: '#f6f6f6'
        },
        
        // And so on...
    },
	
    // Lets set some manipulations with newly created instances.
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
```

Then lets we have some container node in which we want to render our interface:
```html
<div id="container"></div>
```

Now we can render our tasks list:
```js
var TasksList = UI('Tasks list').renderTo('#container', {width : 600, height : 400});
```

Also this lib can a lot:
- Gathering forms (and not only forms)
- Animating functions
- Data providers (basic generator, ajax data fetcher)
- Loading data to the elements or whole instance structures from given data or data providers.
- Common UI solutions such as tabs, spinner, dropdowns.
- Validation (will be implemented later)

More documentation will be ready soon. Enjoy :)
