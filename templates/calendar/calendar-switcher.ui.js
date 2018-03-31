/**
 * @event dayselect
 */
UI.register({
	name : 'Calendar switcher',

	scheme : {
		wrap : {
			arrowLeft : '',
			labelWrap: {
				label : ''
			},
			arrowRight: ''
		}
	},


	params : {
		width: 6,
		arrowsSize : 0.5,
		labelSize : 1.25,
		label : '',
		options : [],
		curIndex : 0,
		loopAround: true
	},


	methods : {
		setOptions : function(options){
			var p = this.params();
			this.params().options = options;
			if(options.indexOf(p.curIndex)){
				this.val(options[p]);
			}
		},

		val : function(index){
			var p = this.params();
			if(index === undefined){
				return p.options[p.curIndex];
			}
			if(p.curIndex < 0){
				p.curIndex = 0;
			}else if(p.options.length > index){
				p.curIndex = index;
			}

			this.label.text(p.options[p.curIndex]);
		},

		getPrevValue : function(){
			var p = this.params();
			if(p.curIndex === 0 && !p.loopAround){
				return p.options[0];
			}
			p.curIndex--;
			if(p.curIndex < 0) p.curIndex = p.options.length - 1;
			return p.options[p.curIndex];
		},

		getNextValue : function(){
			var p = this.params();
			p.curIndex++;
			if(p.curIndex > p.options.length - 1) p.curIndex = 0;
			return p.options[p.curIndex];
		},

		showPrevLabel : function(label){
			var oldLabel = this.label;
			var newLabel = oldLabel.clone();
			newLabel.text(label);
			this.labelWrap.node().insertBefore(newLabel.node(), oldLabel.node());
			newLabel.css({
				marginLeft: '-100%'
			});
			this.label = newLabel;
			setTimeout(function(){
				newLabel.css({
				marginLeft: '0%'
			});
			}, 50);
			this.label = newLabel;
			setTimeout(function(){
				oldLabel.node().parentNode.removeChild(oldLabel.node());
			}, 500);
		},

		showNextLabel : function(label){
			var oldLabel = this.label;
			var newLabel = oldLabel.clone();
			newLabel.text(label);
			this.labelWrap.node().appendChild(newLabel.node());
			oldLabel.css({
				marginLeft: '-100%'
			});
			this.label = newLabel;
			setTimeout(function(){
				oldLabel.node().parentNode.removeChild(oldLabel.node());
			}, 500);
		}
	},	


	onrender : function(inst, params){
		// Set label
		inst.label.text(params.label);

		// Apply size
		inst.arrowLeft.css({
			borderWidth: params.arrowsSize + 'rem 0',
			borderRightWidth: params.arrowsSize * 0.9 + 'rem'
		});
		inst.arrowRight.css({
			borderWidth: params.arrowsSize + 'rem 0',
			borderLeftWidth: params.arrowsSize * 0.9 + 'rem'
		});
		inst.label.css({
			fontSize : params.labelSize + 'rem',
			width : params.width + 'rem'
		});

		inst.labelWrap.css({
			width : params.width + 'rem'
		});


		// Trigger "slideleft" event on the calendar.
		inst.arrowLeft.on('click', function(){
			var p = inst.params();
			var oldIndex = p.curIndex;
			var value = inst.getPrevValue();
			var index = p.curIndex;

			if(!p.loopAround && oldIndex === index){
				return;
			}

			if(!p.loopAround && index === 0){
				this.css({visibility : 'hidden'});
			}else{
				this.css({visibility : 'visible'});
				inst.arrowRight.css({visibility : 'visible'});
			}
			
			inst.showPrevLabel(value);
			inst.triggerEvent('change', index, value);
			inst.triggerEvent('slideleft', index, value);
		});


		// Trigger "slideright" event on the calendar.
		inst.arrowRight.on('click', function(){
			var p = inst.params();
			var oldIndex = p.curIndex;
			var value = inst.getNextValue();
			var index = p.curIndex;

			if(!p.loopAround && oldIndex === index){
				return;
			}

			if(!p.loopAround && index === p.options.length - 1){
				this.css({visibility : 'hidden'});
			}else{
				this.css({visibility : 'visible'});
				inst.arrowLeft.css({visibility : 'visible'});
			}

			inst.showNextLabel(value);
			inst.triggerEvent('change', index, value);
			inst.triggerEvent('slideright', index, value);
		});
	},


	onload : function(inst, data, event){
		var options = Array.isArray(data) ? data : (data.hasOwnProperty('options') ? data.options : []);
		var value = data.hasOwnProperty('value') ? data.value : null;
		inst.setOptions(options);
		inst.val(value);
	},


	styles : {
		wrap : {
			display: 'flex',
			alignItems: 'center',

			arrowLeft: {
				width: 0,
				height: 0,
				borderWidth: '0.5rem 0',
				borderColor: 'transparent',
				borderStyle: 'solid',
				borderRight: '0.65rem solid rgba(255,255,255,0.25)',

				':hover' : {
					borderRightColor: 'rgba(255,255,255,0.5)'
				}
			},

			arrowRight: {
				width: 0,
				height: 0,
				borderWidth: '0.5rem 0',
				borderColor: 'transparent',
				borderStyle: 'solid',
				borderLeft: '0.65rem solid rgba(255,255,255,0.25)',

				':hover' : {
					borderLeftColor: 'rgba(255,255,255,0.5)'
				}
			},

			labelWrap : {
				display: 'flex',
				width: '5rem',
				overflow: 'hidden',
				margin: '0.05rem 0.5rem',
				userSelect: 'none',
				cursor: 'default',

				label : {
					width: '5rem',
					textAlign: 'center',
					color: '#fff',
					fontSize: '1rem',
					fontFamily: 'sans-serif',
					position: 'relative',
					left: 0,
					transition: '0.5s',
					flexShrink: 0,
					marginLeft: 0
				}
			}

		}
	}
})