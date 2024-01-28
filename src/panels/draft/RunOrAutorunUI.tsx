import type { DraftL } from 'src/models/Draft'

import { observer } from 'mobx-react-lite'
import { RevealUI } from 'src/rsuite/reveal/RevealUI'
import { Button } from 'src/rsuite/shims'

export const RunOrAutorunUI = observer(function RunOrAutorunUI_(p: { className?: string; draft: DraftL }) {
    const draft = p.draft
    const icon = draft.shouldAutoStart ? 'pause' : 'play_arrow'
    return (
        <div tw='flex gap-1' className={p.className}>
            <RevealUI>
                <div tw='btn btn-sm virtualBorder btn-square'>
                    <span className='material-symbols-outlined'>timer</span>
                </div>

                <div tw='p-2'>
                    <div>ms to wait after a change</div>
                    <input
                        //
                        value={draft.st.project.data.autostartDelay}
                        onChange={(ev) => {
                            const val = parseInt(ev.target.value)
                            if (Number.isNaN(val)) return
                            draft.st.project.update({ autostartDelay: val })
                        }}
                        tw='input input-bordered input-sm'
                        type='number'
                        placeholder='ms'
                    />
                    <div>max ms to wait before running anyway</div>
                    <input
                        //
                        value={draft.st.project.data.autostartMaxDelay}
                        onChange={(ev) => {
                            const val = parseInt(ev.target.value)
                            if (Number.isNaN(val)) return
                            draft.st.project.update({ autostartMaxDelay: val })
                        }}
                        tw='input input-bordered input-sm'
                        type='number'
                        placeholder='ms'
                    />
                </div>
            </RevealUI>
            <div
                tw={['btn btn-sm virtualBorder self-start', draft.shouldAutoStart ? 'btn-active' : null]}
                // color={draft.shouldAutoStart ? 'green' : undefined}
                onClick={() => draft.setAutostart(!draft.shouldAutoStart)}
            >
                Autorun
                {draft.shouldAutoStart ? (
                    <div className='loading loading-spinner loading-sm' />
                ) : (
                    <span className='material-symbols-outlined'>repeat</span>
                )}
                {/* Auto */}
            </div>
            <Button
                tw='btn-sm btn-primary flex-1'
                className='self-start'
                icon={<span className='material-symbols-outlined'>{icon}</span>}
                onClick={() => {
                    draft.st.layout.FOCUS_OR_CREATE('Output', {}, 'RIGHT_PANE_TABSET')
                    draft.setAutostart(false)
                    draft.start()
                }}
            >
                Run
            </Button>
        </div>
    )
})
