# UIBuilder

A small frontend library for quick generation and management of 
DOM structure blocks.

###Main concept
The idea is in reusing predefined interface parts schemes for building 
instances of this parts. All data generated is stored in the objects and 
can be quickly got by reference. 

Also objects that represents single DOM nodes has few very useful methods
implements jQuery syntax.


###Example:
Lets we have some list of users (see example in code).
The interface of the list we describe as one scheme:

```js
UIBuilder.UI.register({
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
```

All users will be contained in the list property.
To describe structure of the single user we will use next scheme:

```js
UIBuilder.UI.register({
    name : 'user',
    scheme : {
        wrap : {
            photo : '@img [width=50;height=50]',
            name : '@span',
            delBtn : ''
        }
    }
});
```

Then lets we have some container node in which we want to build our interface:
```html
<div id="container"></div>
```

Finally all that we must to do is say UIBuilder 
to build right scheme in the right container (node or another element of the scheme instance):
```js
var container = document.getElementById('container')
var users = UIBuilder('usersList').build(container);
```
And now we can add few users...
```js
var user_1 = users.list.addChild();             // First user...
user_1.photo.src('images/user_photo_1.png');
user_1.name.html('Miku Hatsune');
 
var user_2 = users.list.addChild();             // Second user...
user_2.photo.src('images/user_photo_2.png');
user_2.name.html('Megurine Luka');
 
var user_3 = users.list.addChild();             // Third user...
user_3.photo.src('images/user_photo_3.png');
user_3.name.html('ALYS');
```
