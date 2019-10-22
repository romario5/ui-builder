export default function () {

    Interface.register('Identified', [
        'getId()',
        'setId(id)'
    ]);

    Interface.register('Translated', [
        'translation(field, lang)'
    ]);

    Interface.register('Progressive', [
        'getProgress()',
        'onComplete(callback)'
    ]);

    Interface.register('Yes/No', [
        'yes()',
        'no()',
        'onYes(callback)',
        'onNo(callback)',
        'onAnswer(callback)'
    ]);

    Interface.register('Draggable', [
        'getHandle()',
    ]);

}