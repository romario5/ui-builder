UI.register({
    name : 'Alert',

    scheme : {
        wrap : {
            icon : '.icon icon-alert',
            text : ''
        }
    },

    params : {
        lifetime : 3000
    },

    styles : {
        wrap : {
            display: 'flex',
            padding: '10px',
            alignItems: 'center',
            height: '60px',
            minWidth: '150px',
            maxWidth: '300px',
            backgroundColor: '#fff',
            position: 'fixed',
            bottom: '-100px',
            right: '10px',
            zIndex: 1100,
            boxShadow: '1px 1px 3px rgba(0,0,0,0.25)'
        },
        icon : {
            fontSize: '24px',
            width: '20px',
            height: '40px',
            marginRight: '15px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,

            '.info' : {
                color: '#00c9e5'
            },
            '.warn' : {
                color: '#ffb500'
            },
            '.error' : {
                color: '#f90000'
            }
        }
    },

    onrender : function(inst, params){
        inst.wrap.animate({bottom: '10px'});
        setTimeout(function(){
            inst.wrap.fadeOut(1000, true, function(){this.remove();});
        }, params.lifetime);
    },

    onload : function(inst, data, event){
        var icons = ['info', 'warn', 'error'];
        if(!data.hasOwnProperty('icon')){
            data.icon = 'info';
        }
        if(icons.indexOf(data.icon) >= 0){
            inst.icon.addClass(data.icon);
            delete data.icon;
        }
    }
});


function AlertInfo(msg)
{
    UI('Alert').renderTo('body').load({text : msg});
}

function AlertWarn(msg)
{
    UI('Alert').renderTo('body').load({text : msg, icon : 'warn'});
}

function AlertError(msg)
{
    UI('Alert').renderTo('body').load({text : msg, icon : 'error'});
}