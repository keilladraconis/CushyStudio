import { observer } from 'mobx-react-lite'
import { forwardRef } from 'react'
import SortableList, { SortableItem, SortableKnob } from 'react-easy-sort'
import { Widget } from 'src/controls/Widget'
import { Message } from 'src/rsuite/shims'
import { WidgetDI } from '../WidgetUI.DI'
import { Widget_list } from './WidgetList'
import { ErrorBoundary } from 'react-error-boundary'
import { ErrorBoundaryFallback } from 'src/widgets/misc/ErrorBoundary'
import { ListControlsUI } from 'src/controls/shared/ListControlsUI'
import type { Widget_listExt } from '../listExt/WidgetListExt'

export const WidgetList_LineUI = observer(function WidgetList_LineUI_<T extends Widget>(p: {
    widget: Widget_list<T> | Widget_listExt<T>
}) {
    return <ListControlsUI widget={p.widget} />
})

export const WidgetListUI = observer(function WidgetListUI_<T extends Widget>(p: { widget: Widget_list<T> }) {
    const widget = p.widget
    const subWidgets = widget.items
    const min = widget.config.min
    const WidgetUI = WidgetDI.WidgetUI
    if (WidgetUI == null) return <Message type='error'>Internal list failure</Message>
    // const isCollapsed = widget.state.collapsed ?? false
    // const isExpanded = !isCollapsed
    // const len = values.length
    // const indexWidth = len.toString().length
    return (
        <div className='_WidgetListUI' tw='flex-grow w-full'>
            {/* <ListControlsUI widget={p.widget} /> */}
            <SortableList onSortEnd={p.widget.moveItem} className='list' draggedItemClassName='dragged'>
                <div tw='flex flex-col gap-2'>
                    {subWidgets.map((subWidget, ix) => {
                        const { WidgetLineUI, WidgetBlockUI } = WidgetDI.WidgetUI(subWidget) // WidgetDI.WidgetUI(widget)
                        return (
                            <SortableItem key={subWidget.id}>
                                <div tw='flex flex-col'>
                                    <div tw='flex items-center'>
                                        <SortableKnob>
                                            <ListDragHandleUI widget={subWidget} ix={ix} />
                                        </SortableKnob>
                                        <div className='divider my-2 flex-1 border-top'>
                                            <div id={subWidget.id} tw='opacity-20 italic'>
                                                #{ix}:{subWidget.id}
                                            </div>
                                        </div>
                                        {WidgetLineUI && (
                                            <ErrorBoundary FallbackComponent={ErrorBoundaryFallback} onReset={(details) => {}}>
                                                <WidgetLineUI widget={subWidget} />
                                            </ErrorBoundary>
                                        )}

                                        {/* {(v.state.collapsed ?? false) && <WidgetUI widget={v} />} */}
                                        {/* {!(v.state.collapsed ?? false) && <div tw='flex-1' />} */}

                                        <div
                                            tw={[
                                                'btn btn-sm btn-narrower btn-ghost opacity-50',
                                                min && widget.items.length <= min ? 'btn-disabled' : null,
                                            ]}
                                            onClick={() => widget.removeItem(subWidget)}
                                        >
                                            <span className='material-symbols-outlined'>delete</span>
                                        </div>
                                        <ListItemCollapseBtnUI req={subWidget} />
                                    </div>
                                    {WidgetBlockUI && subWidget && (
                                        <ErrorBoundary FallbackComponent={ErrorBoundaryFallback} onReset={(details) => {}}>
                                            <div tw='ml-2 pl-2'>
                                                <WidgetBlockUI widget={subWidget} />
                                            </div>
                                        </ErrorBoundary>
                                    )}
                                    {/* {!(v.state.collapsed ?? false) && (
                                    <div
                                    // key={v.id}
                                    // tw='border-solid border-2 border-neutral-content'
                                    >
                                        <WidgetUI widget={v} />
                                    </div>
                                )} */}
                                </div>
                            </SortableItem>
                        )
                    })}
                </div>
            </SortableList>
        </div>
    )
})

const ListDragHandleUI = forwardRef<HTMLDivElement, { ix: number; widget: Widget }>((props, ref) => {
    const v = props.widget
    return (
        <div
            tw='btn btn-narrower btn-ghost btn-square btn-sm'
            ref={ref}
            onClick={() => (v.serial.collapsed = !Boolean(v.serial.collapsed))}
        >
            {/* <RevealUI cursor='cursor-move'> */}
            <span className='material-symbols-outlined'>menu</span>
            {/* <div tw='btn btn-sm btn-narrower btn-ghost opacity-50'>
                {v.state.collapsed ? ( //
                    <span className='material-symbols-outlined'>keyboard_arrow_right</span>
                ) : (
                    <span className='material-symbols-outlined'>keyboard_arrow_down</span>
                )}
            </div> */}
            {/* <div>{props.ix}</div> */}
            {/* </RevealUI> */}
        </div>
    )
})

export const ListItemCollapseBtnUI = observer(function ListItemCollapseBtnUI_(p: { req: Widget }) {
    const widget = p.req
    const isCollapsible = widget.isCollapsible
    if (!isCollapsible) return null
    return (
        <div
            tw='btn btn-ghost btn-square btn-sm'
            // style={{ width: `${indexWidth}rem` }}
            onClick={() => (widget.serial.collapsed = !Boolean(widget.serial.collapsed))}
        >
            {widget.serial.collapsed ? ( //
                <span className='material-symbols-outlined'>keyboard_arrow_right</span>
            ) : (
                <span className='material-symbols-outlined'>keyboard_arrow_down</span>
            )}
            {/* {ix} */}
        </div>
    )
})
