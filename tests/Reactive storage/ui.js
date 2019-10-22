UI.register({
	
	name : 'Tasks',
	
	scheme : {
		wrap : {
			toolbar: {
			    createButton: '',
                searchForm: {
			        searchInput: '@input [type = text]',
                    searchButton: '@button [type = submit] (text = Load)'
                }
            },
            items: '|Task'
		}
	},

    rules: {
	    searchForm: '@form'
    },

    params: {
	    url: 'http://ubp5.com/api/company-directions',
	    storage: null
    },

    methods: {
	    createStorage() {
            function Task(p) {
                this.id = p.id || null;
                this.name = p.name || '';
            }
            this.params().storage = new Storage(Task, {throttle: 50});
        },
	    getStorage() {
	        return this.params().storage;
        },
        searchTasks() {
	        let data = {name: this.searchInput.val().trim()};
	        let ajax = new Ajax({
                url: this.params().url,
                method: 'GET',
                data: data
	        });
	        ajax.fetch(response => this.getStorage().removeAll(false).addMultiple(response));
        }
    },

    onRender(inst) {
        inst.createStorage();

        inst.searchForm.on('submit', (inst, event) => {
            event.preventDefault();
            inst.searchTasks();
        });

        inst.getStorage().on('add', () => {
            inst.items.removeChildren();
            let entities = inst.getStorage().entities;
            for (let i = 0; i < entities.length; i++) {
                let row = inst.items.addOne({entity: entities[i]});
                row.load(entities[i]);
                entities[i].row = row;
            }
        });

        inst.getStorage().on('change', entity => {
            if (entity !== null && entity.row !== null) {
                entity.row.setChanged();
            }
        });

        inst.searchTasks();
    },
	
	styles : {
		wrap : {
			display : 'flex',
            flexDirection: 'column',
            padding: '1rem',
            border: '1px solid #333',
            backgroundColor: '#f9f9f9',

            toolbar: {
			    marginBottom: '0.5rem'
            }
		}
	}
});


UI.register({
    name: 'Task',

    scheme: {
        wrap: {
            id: '',
            name: '@input [type = text]'
        }
    },

    params: {
        entity: null
    },

    methods: {
        setChanged() {
            this.name.css({borderColor: '#900'});
        }
    },

    onRender(inst, params) {
        inst.name.on('input', value => {
            if (params.entity !== null) params.entity.name = value;
        });
    },

    styles: {
        wrap: {
            display: 'flex',
            alignItems: 'center',
            padding: '0.5rem',
            borderBottom: '1px solid #ddd',

            id: {
                width: '2rem',
                fontFamily: '"Open Sans", sans-serif'
            },

            name: {
                fontFamily: '"Open Sans", sans-serif',
                border: '1px solid #999',
                outline: 'none'
            }
        }
    }
});