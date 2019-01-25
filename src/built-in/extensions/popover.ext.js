export default function () {

    /**
     * This extension accepts one element as target and another as popover
     * and adds popover behavior for the last one.
     * If popover is not given a new element will be created as the popover.
     * To get automatically created element call [getPopover()] method.
     * The popover will be displayed aside the target (first element).
     *
     * Options:
     *
     * // Apply extension.
     * let ext = Extension('Popover').applyTo(target, {
     *     side: 'top',
     *     hideOnBlur: true,
     *     fadingTime: 150,
     *     popover: inst.popover
     * });
     *
     * // Get popover element.
     * let popover = ext.getPopover();
     *
     * // Getting popover when extension was already applied.
     * let popoverElement = target.getExtension('Popover').getPopover();
     */
    Extension.register('Popover', {

        params: {
            side: 'top',
            hideOnBlur: true,
            fadingTime: 150,
            popover: null
        },

        onApply(ext, target, params) {

            // Check if popover is given. If not - create new popover.
            if (params.popover === null) {
                params.popover = document.createElement('div');
                // TODO Implement popover creation.
            }

            // Add events handlers for the target.
            // TODO Implement events handlers and make their attachments.
        }

    });

}