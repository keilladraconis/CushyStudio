import { useSt } from './stContext'
import { observer } from 'mobx-react-lite'

export const MainActionsUI = observer(function MainActionsUI_() {
    const st = useSt()
    return (
        <div className='col gap grow'>
            {/* <div>Step: {st.project.currentStep}</div> */}
            <button className='success' onClick={() => st.run()}>
                Eval
            </button>
            {st.project.isRunning ? (
                <button className='success' onClick={() => (st.project.isRunning = false)}>
                    Abort
                </button>
            ) : null}
            {/* <button onClick={() => st.udpateCode()}>Preview</button> */}
        </div>
    )
})
