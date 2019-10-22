export default function () {

    Extension.register('Active trigger', {
        params: {
            activeClass: 'active'
        },

        onApply(ext) {
            let target = ext.target,
                params = ext.params,
                activeClass = params.activeClass;

            params.handler = function(inst, event){
                let node = event.target,
                    targetNode = target.node();

                while(node.parentNode !== targetNode && node !== document.body && node !== null){
                    node = node.parentNode;
                }

                if(node.parentNode === targetNode){
                    let items = targetNode.childNodes;
                    for(let i = 0; i < items.length; i++){
                        items[i].classList.remove(activeClass);
                    }
                    node.classList.add(activeClass);
                }
            };

            target.on('click', params.handler);
        },

        onRemove(ext) {
            ext.target.off('click', ext.params.handler);
        }
    });

}

