import path from 'node:path'
import * as fs from 'node:fs'
import { Readable } from 'node:stream';

import mime from 'mime-types'
import { json, redirect } from '@sveltejs/kit'

export function GET({ request, params, url}) {
    const fp = url.searchParams.get('path')
    
    if (fp == null) return json({
        error: 'No directory/file specified.',
        result: null,
    })

    if (!fs.existsSync(fp)) return json({
        error: 'Directory/file does not exist',
        result: null,
    })

    const nodejs_rstream = fs.createReadStream(fp ?? '')

    //@ts-ignore
    const web_rstream = Readable.toWeb(nodejs_rstream, {
        strategy: new CountQueuingStrategy({ highWaterMark: 100 })
    });
    
    //@ts-ignore
    return new Response(web_rstream, {
        headers: {
            "Content-Type": mime.lookup(path.extname(fp)) ?? 'application/octet-stream',
            "Content-Disposition": `filename="${path.basename(fp)}"`,
        }
    })
    
}