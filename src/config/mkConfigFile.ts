import type { ConfigFile } from './ConfigFile'

import { resolve } from 'pathe'
import { asAbsolutePath } from 'src/utils/fs/pathUtils'
import { JsonFile } from '../core/JsonFile'
import { STANDARD_HOST_ID } from './ComfyHostDef'

export const mkConfigFile = (): JsonFile<ConfigFile> => {
    return new JsonFile<ConfigFile>({
        path: asAbsolutePath(resolve('CONFIG.json')),
        maxLevel: 3,
        init: (): ConfigFile => ({
            mainComfyHostID: STANDARD_HOST_ID,
            theme: 'dark',
            //     galleryImageSize: 48,
        }),
    })
}
