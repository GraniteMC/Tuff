import path from 'node:path';
import * as fs from 'node:fs'

import ffs from 'fast-folder-size/sync'

import type {PageServerLoad, RouteParams} from "./$types";

export const load = (async ({ request, params, url }) => {
    const dir = url.searchParams.get('path') ?? process.cwd()

    const files = fs.readdirSync(dir)

    
    return {
        files: files.map(f => {
            const fp = path.join(dir, f)
            const isDir = (() => {
                    try {
                        return fs.lstatSync(fp).isDirectory() 
                    } catch (e) {
                        return false
                    }
                })()
            const bytesSize = (isDir ? /* Both return bytes */
                /* ffs(fp) ?? */ 0 : (() => {
                    try {
                        return fs.statSync(fp)
                    } catch (e) {
                        return { size: 0 }
                    }
                })().size)
            
            let size = bytesSize
            let sizeUnit = 'B'
            if (size > 1024) { size /= 1024; sizeUnit = 'KB' }
            if (size > 1024) { size /= 1024; sizeUnit = 'MB' }
            if (size > 1024) { size /= 1024; sizeUnit = 'GB' }
            
            let fixedSize = size ? size.toFixed(2) : '???'
            let displaySize = fixedSize.endsWith('.00') ? fixedSize.slice(0, -3) : fixedSize
            
            
            return {
                name: f,
                path: fp,
                isDir,
                size: displaySize,
                sizeUnit,
                

            }
        }),
        path: dir,
        parent_folder: path.dirname(dir),
    }
}) satisfies PageServerLoad;