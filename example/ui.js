UIBuilder.register({
    name : 'usersList',
    scheme : {
        wrap : {
            list : '|user',
            toolbar : {
                link : '@a [target=_blank]',
            }
        }
    },
    rules : {
        wrap : '#list-wrap .dark-theme'
    }
});


UIBuilder.register({
    name : 'user',
    scheme : {
        wrap : {
            photo : '@img [width=50;height=50]',
            name : '@span',
            delBtn : ''
        }
    }
});