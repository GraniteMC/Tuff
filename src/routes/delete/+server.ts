import path from 'node:path'
import * as fs from 'node:fs'

import { json, redirect } from '@sveltejs/kit'

export async function POST({ request, cookies, url}) {
    const body = await request.json()
    const fp = body.path ?? null

    // console.log(`Received delete request for ${fp}`)
    
    if (fp == null) return json({
        error: 'No directory/file specified.',
        result: null,
    })

    if (!fs.existsSync(fp)) return json({
        error: 'Directory/file does not exist',
        result: null,
    })

    try {
        fs.rmSync(fp, { recursive: true, force: true });    

        return json({
            error: null,
            result: 'File/directory deleted successfully.'
        })
    } catch (e) {
        return json({
            error: 'Failed to delete file/directory.',
            result: null,
        })
    }
    
}