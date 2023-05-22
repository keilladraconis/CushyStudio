import type { Runtime } from './Runtime'
import type { LATER } from 'LATER'

import { ComfyNode } from '../core/Node'
import { nanoid } from 'nanoid'

export interface NodeBuilder extends LATER<'ComfySetup'> {}

export class NodeBuilder {
    constructor(public flow: Runtime) {
        const schema = flow.st.schema
        // TODO: rewrite with a single defineProperties call
        // with propery object being defined on the client
        // to remove all this extra work

        // 🔴 remove this from here
        for (const node of schema.nodes) {
            // console.log(`node: ${node.name}`)
            Object.defineProperty(this, node.nameInCushy, {
                value: (inputs: any) =>
                    new ComfyNode(flow.graph, nanoid(), {
                        class_type: node.nameInComfy as any,
                        inputs,
                    }),
            })
        }
    }
}
