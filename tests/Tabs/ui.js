/**
 * UI of the tabs container.
 */
UI.register({
	
	name : 'Layout',
	
	scheme : {
		wrap : {
			tabsBar : '<<< Tabs'
		}
	},
	
	onRender(inst) {
		let tabs = inst.tabsBar.inclusion();

		inst.on('load', (data, event) => {
			event.preventDefault();

            let containerUI = UI('Data container');
			for(let p in data){
				if (data.hasOwnProperty(p)) {
                    let tab = tabs.addTab(p);
                    containerUI.renderTo(tab.getContent()).load(data[p]);
				}
			}
		});
	},

    styles: {
	    wrap: {
	        display: 'flex',
            flexDirection: 'column',
            margin: '15px 0',

            tabsBar: {
                display: 'flex',
                flexDirection: 'column',

                ' .labels': {
                    display: 'flex'
                },

                ' .labels > *': {
                    display: 'flex',
                    padding: '0.5rem 1rem',
                    margin: '0 0.25rem',
                    border: '1px solid #ccc'
                }
            }
        }
    }


});






UI.register({
	name : 'Data container',
	
	scheme : {
		wrap : {
			title : '@h2',
			text : '@p'
		}
	},
	
	styles : {
		wrap : {
			flexDirection: 'column',
			padding : '15px',
			border: '1px solid #ccc',
			borderTop: 'none'
		},
		
		title : {
			fontFamily: 'sans-serif',
			fontSize : '18px',
			fontWeight: 600,
			marginBottom: '10px'
		},
		
		text : {
			fontFamily: 'sans-serif',
			fontSize : '14px',
			margin: 0
		}
	}
});

