import { observer } from 'mobx-react-lite'
import { createElement } from 'react'
import { Widget_custom } from 'src/controls/Widget'
import { PropsOf } from 'src/panels/router/Layout'
import { ImageUI } from 'src/widgets/galleries/ImageUI'

export const WidgetCustomUI = observer(function WidgetCustomUI_(p: { widget: Widget_custom<unknown> }) {
    const widget = p.widget

    return createElement(widget.input.Component, {
        widget: widget,
        extra: _commonUIComponents,
    })
})

// ------------------------------------------------------------------------

/** Common ui components */
const _commonUIComponents = {
    ImageUI: (p: PropsOf<typeof ImageUI>) => <ImageUI {...p} />,
}

export type UIKit = typeof _commonUIComponents
