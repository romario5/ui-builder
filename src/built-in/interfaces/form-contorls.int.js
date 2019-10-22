export default function () {

    Interface.register('Form', [
        'validate()',
        'requireField(field)',
        'submit()',
        'reset()'
    ]);

    Interface.register('Input', [
        'val(value)',
        'disable()',
        'enable()',
        'focus()',
        'blur()',
        'name(value)',
        'placeholder(value)',
        'required(value)'
    ]);

    Interface.register('Button', [
        'text(value)',
        'disable()',
        'enable()',
        'focus()',
        'blur()',
        'onClick(handler)'
    ]);

    Interface.register('Labeled', [
        'label(value)'
    ]);

}