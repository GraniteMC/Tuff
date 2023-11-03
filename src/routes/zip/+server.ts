import path from 'node:path'
import * as fs from 'node:fs'
import fsp from 'node:fs/promises'
import { Readable } from 'node:stream';

import JSZip from 'jszip'
import readdirp from "readdirp";

import { json, redirect } from '@sveltejs/kit'

export async function GET({ request, params, url }) {
    const folderPath = url.searchParams.get('path')

    if (folderPath == null) {
        return json({
            error: 'No directory specified.',
            result: null,
        });
    }

    try {
        await fsp.access(folderPath);
    } catch (error) {
        return json({
            error: 'Directory does not exist.',
            result: null,
        });
    }

    const zip = new JSZip();
    const files = await readdirp.promise(folderPath);

    for (const file of files) {
        const filePath = file.fullPath;
        const relativePath = file.path;

        const fileData = await fsp.readFile(filePath);
        zip.file(relativePath, fileData);
    }

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const blob = new Blob([zipBlob], { type: 'application/zip' });

    return new Response(blob, {
        status: 200,
        headers: new Headers({
            "Content-Type": "application/zip",
            "Content-Disposition": `attachment; filename=${path.basename(folderPath)}`,
        }),
    });
}