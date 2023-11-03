import path from 'node:path'
import * as fs from 'node:fs'

import { json, redirect } from '@sveltejs/kit'

export async function POST({ request, cookies, url}) {
    const body = await request.json()
    const fp = body.path ?? null

    if (fp == null) return json({
        error: 'No directory/file specified.',
        result: null,
    })

    if (fs.existsSync(fp)) return json({
        error: 'Directory/file already exists',
        result: null,
    })
    try {
        fs.mkdirSync(fp, { recursive: true })
        return json({
            error: null,
            result: `Successfully created folder ${fp}.`,
        })
    } catch (e) {
        return json({
            error: `Failed to create folder ${fp}`,
            result: null
        })
    }

    
    
    
}