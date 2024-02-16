import type { UnifiedCanvasViewInfos } from '../types/RectSimple'
import type { KonvaEventObject } from 'konva/lib/Node'
import type { MediaImageL } from 'src/models/MediaImage'
import type { STATE } from 'src/state/state'

import Konva from 'konva'
import { makeAutoObservable } from 'mobx'
import { createRef } from 'react'
import { onWheelScrollCanvas } from '../behaviours/onWheelScrollCanvas'
import { onMouseMoveCanvas } from '../behaviours/onMouseMoveCanvas'
import { KonvaGrid1 } from './KonvaGrid1'
import { UnifiedSelection } from './UnifiedSelection'
import { UnifiedImage } from './UnifiedImage'
import { UnifiedMask, setupStageForPainting } from './UnifiedMask'
import { toastError } from 'src/utils/misc/toasts'
import type { DraftL } from 'src/models/Draft'

export class UnifiedCanvas {
    snapToGrid = true
    snapSize = 64
    rootRef = createRef<HTMLDivElement>()
    currentDraft: DraftL | null = null
    // ---------------------------------------------------
    undo = () => {
        const last = this.undoBuffer.pop()
        if (last == null) return toastError('Nothing to undo')
        last()
    }
    undoBuffer: (() => void)[] = []
    // ---------------------------------------------------

    activeSelection: UnifiedSelection
    private _activeMask: UnifiedMask
    get activeMask() { return this._activeMask } // prettier-ignore
    set activeMask(mask: UnifiedMask) {
        this._activeMask = mask
        for (const mask of this.masks) mask.layer.hide()
        if (mask == null) return
        mask.layer.show()
        mask.layer.moveToTop()
    }

    tool: 'generate' | 'mask' | 'paint' | 'move' = 'generate'
    brushMode: 'paint' | 'erase' = 'paint'
    maskToolSize: number = 32
    maskColor = 'red'
    maskOpacity = 0.5

    _isPaint = false
    _lastLine: Konva.Line | null = null

    get pointerPosition() {
        return {
            x: this.infos.viewPointerX,
            y: this.infos.viewPointerY,
        }
    }

    infos: UnifiedCanvasViewInfos = {
        canvasX: 0,
        canvasY: 0,
        scale: 1,
        viewPointerX: 0,
        viewPointerY: 0,
        viewportPointerX: 0,
        viewportPointerY: 0,
        isDown: false,
    }

    onWheel = (e: any) => {
        //
    }
    onKeyDown = (e: any) => {
        if (e.key === '1') { this.tool = 'generate' ; return } // prettier-ignore
        if (e.key === '2') { this.tool = 'mask' ; return } // prettier-ignore
        if (e.key === '3') { this.tool = 'paint' ; return } // prettier-ignore
        if (e.key === '4') { this.tool = 'move' ; return } // prettier-ignore

        if (e.key === 'z' && (e.ctrlKey || e.metaKey)) {
            this.undo()
        }
        // if (e.keyCode === 37) {
        //     circle.x(circle.x() - DELTA)
        // } else if (e.keyCode === 38) {
        //     circle.y(circle.y() - DELTA)
        // } else if (e.keyCode === 39) {
        //     circle.x(circle.x() + DELTA)
        // } else if (e.keyCode === 40) {
        //     circle.y(circle.y() + DELTA)
        // } else {
        //     return
        // }
        e.preventDefault()
    }

    // immutable base for calculations
    readonly base = Object.freeze({ width: 512, height: 512 })
    images: UnifiedImage[]
    masks: UnifiedMask[] = []
    selections: UnifiedSelection[] = []
    grid: KonvaGrid1
    TEMP = document.createElement('div')
    stage: Konva.Stage
    tempLayer: Konva.Layer
    constructor(public st: STATE, baseImage: MediaImageL) {
        this.stage = new Konva.Stage({ container: this.TEMP, width: 512, height: 512 })
        // this.stage.on('keydown', (ke) => {
        //     const e = ke.evt
        //     console.log(`[👙] e.key`, e.key)
        //     if (e.key === 'z' && (e.ctrlKey || e.metaKey)) {
        //         this.undo()
        //     }
        // })
        this.grid = new KonvaGrid1(this)
        this.images = [new UnifiedImage(this, baseImage)]
        this.stage.on('wheel', (e: KonvaEventObject<WheelEvent>) => onWheelScrollCanvas(this, e))
        this.stage.on('mousemove', (e: KonvaEventObject<MouseEvent>) => onMouseMoveCanvas(this, e))
        // ------------------------------
        // to hold the line currently being drawn
        this.tempLayer = new Konva.Layer()
        this.tempLayer.opacity(0.5)
        this.stage.add(this.tempLayer)
        // ------------------------------
        const selection = this.addSelection()
        this.activeSelection = selection
        const mask = this.addMask()
        this._activeMask = mask
        // this.activeMask = mask

        makeAutoObservable(this)
        setupStageForPainting(this)
    }

    addImage = (img: MediaImageL) => {
        this.images.push(new UnifiedImage(this, img))
    }

    addMask = (img?: MediaImageL): UnifiedMask => {
        const mask = new UnifiedMask(this, img)
        this.masks.push(mask)
        this.tool = 'mask'
        return mask
    }

    addSelection = (): UnifiedSelection => {
        const selection = new UnifiedSelection(this)
        this.selections.push(selection)
        return selection
    }
}
