export default function () {

    Interface.register('Spinner', [
        'show()',
        'hide()'
    ]);

    Interface.register('Calendar', [
        'outputFormat(template)',
        'valueFormat(template)',
        'format(template)',
        'year(value)',
        'month(value)',
        'day(value)',
        'daysInMonth(monthIndex)'
    ]);

    Interface.register('Tabs', [
        'localization(category)',
        'addTab(label, target)',
        'activeTab(label)',
        'tabByLabel(label)',
        'hideTab(label)',
        'showTab(label)'
    ]);

    Interface.register('Overlay', [
        'trackProgress(ajax)',
        'setSkeleton(name)',
        'showSkeleton()',
        'hideSkeleton()',
        'close()'
    ]);

    Interface.register('Alert', [
        'info(title, message, image)',
        'warn(title, message, image)',
        'error(title, message, image)'
    ]);

}