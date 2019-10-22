UI.register('Horizontal tabs').extends('Tabs', {

    namespace: 'Tasks list',


    styles: {
        wrap: {
            margin: '1rem',

            tabs: {
                display: 'flex',
                marginBottom: '0.5rem',

                ' > *': {
                    padding: '0.5rem 1rem',
                    border: '1px solid transparent',
                    borderBottomColor: Theme('colors.gray').default('#999'),
                    cursor: 'default',
                    userSelect: 'none',
                    borderRadius: '0.25rem 0.25rem 0 0'
                },

                ' > *:hover': {
                    backgroundColor: Theme('colors.lightestGray').default('#f9f9f9')
                },

                ' > .active': {
                    borderColor: Theme('colors.gray').default('#999'),
                    borderBottomColor: 'transparent'
                },

                ' > .active:hover': {
                    backgroundColor: '#fff'
                },
            }
        }
    }
});