<script lang="ts">
    import { tooltip } from 'svooltip';
    import 'svooltip/styles.css';
    import { copy } from 'svelte-copy';
    import { toast } from 'svoast';
    import { dialogs } from "svelte-dialogs";
    
    import type {PageData} from './$types';
    export let data: PageData

    import Sl from '$lib/Components/SL.svelte';

    async function launchCopiedToast() {
		toast.success('Copied to clipboard.');
	}    

    async function deleteFile(path: string) {
        // alert('deleting ' + path)
        const req = await fetch(`${window.location.origin}/delete`, {
            body: JSON.stringify({
                path: path
            }),
            headers: {
                "Content-type": "application/json; charset=UTF-8"
            },
            method: "POST",
        })
        const resp = await req.json()

        if (resp?.error) 
            toast.error(resp?.error)
        else if (resp?.result) 
            toast.success(resp?.result)   
    }

    let showDeleteConfirmationPrompt = false;
    let deleteConfirmationPromptFilepath = ''
    let deleteConfirmationRandomNumberGen = () => ((Math.floor(Math.random() * 89) + 10) * 100) + Math.floor(Math.random() * 99)
    let deleteConfirmationRandomNumber = 10
    let deleteConfirmationRandomNumberInputValue = ''

</script>

{#if showDeleteConfirmationPrompt}
    <div class="confirmation-prompt-container">
        <div class="confirmation-prompt">
            <div class="confirmation-message">
                <h2>Are you sure you want to delete <code>{deleteConfirmationPromptFilepath}</code>?</h2>
                <p>Enter <code> {deleteConfirmationRandomNumber} </code> then press enter to confirm.</p>
            </div>
            <input on:change={async () => {
                if (deleteConfirmationRandomNumberInputValue !== deleteConfirmationRandomNumber.toString())
                    return
                
                showDeleteConfirmationPrompt = false
                deleteConfirmationRandomNumberInputValue = ''

                toast.warning(`Deleting ${deleteConfirmationPromptFilepath}`)

                deleteFile(deleteConfirmationPromptFilepath)
            }} placeholder="00" bind:value={deleteConfirmationRandomNumberInputValue}/>
            <button on:click={() => {
                showDeleteConfirmationPrompt = false
                deleteConfirmationRandomNumberInputValue = ''
                toast.info(`Cancelled deletion of ${deleteConfirmationPromptFilepath}`)
            }} class="delete-popup-no-btn">No</button>
        </div>
    </div>
{/if}
<main>
    <div id="title">
        <h1 id="data-path-title">{data.path}</h1>

        <div id="tools">
            <ul class="horizontal">
                <li>
                    <Sl path={data.parent_folder}>
                        <i class="fa-solid fa-arrow-up"></i>
                    </Sl>
                </li>
                <li>
                    <button class="hidden-btn" use:copy={data.path} on:click={launchCopiedToast}>
                        <i class="fa-regular fa-clipboard"></i>
                    </button>
                </li>
                <!-- <li>
                    <i class="fa-solid fa-upload"></i>
                </li> -->
                <li>
                    <button class="hidden-btn" on:click={async () => {
                        const folderName = ((await dialogs.prompt(
                            [
                                { label: "Folder Name", type: "text", required: true },
                            ],
                            {
                                title: "Folder name"
                            }
                        )) ?? [null])[0]
                        if (!folderName) return toast.error('No folder specified!')
                        const path = data.path + '/' + folderName

                        toast.info('Creating folder')
                        
                        const req = await fetch(`${window.location.origin}/new_folder`, {
                            body: JSON.stringify({
                                path: path
                            }),
                            headers: {
                                "Content-type": "application/json; charset=UTF-8"
                            },
                            method: "POST",
                        })
                        const resp = await req.json()

                        if (resp.error) toast.error(resp.error)
                        else if (resp.result) toast.success(resp.result)

                        setTimeout(() => window.location.reload(), 500)
                    }}>
                        <i class="fa-solid fa-folder-plus"></i>
                    </button>
                </li>
            </ul>
        </div>
    </div>
    <table id="files">
        <tr>
            <th class="icon-th">Icon</th>
            <th class="name-th">File Name</th>
            <th class="size-th">Size</th>
            <th class="action-th">Actions</th>
        </tr>
        {#if data.files.length == 0}
            <tr class="no-files-found-row">
                <td class="icon-td">
                    <i class="fa-solid fa-question"></i>
                </td>
                <td class="name-td">
                    No files found...
                </td>
                <td class="size-td">
                    0 B
                </td>
                <td class="action-td">
                    
                </td>
            </tr>
        {/if}
        {#each data.files as file, index}
            <tr class={index % 2 == 0 ? 'row-greyed' : ''}>
                <td class="icon-td">
                    {#if file.isDir}
                        <i class="fa-solid fa-folder"></i>
                    {:else}
                    <i class="fa-solid fa-file"></i>
                    {/if}
                </td>
                <td class="name-td">
                    {#if file.isDir}
                    <a href={`/?path=${encodeURIComponent(file.path)}`} target="_self">{file.name}</a>
                    {:else}
                        <a href={`/download?path=${encodeURIComponent(file.path)}`} target="_blank">{file.name}</a>
                    {/if}
                </td>
                <td class="size-td">
                    {file.size} {file.sizeUnit}
                </td>
                <td class="action-td">
                    <ul class="horizontal">
                        <li>
                            <button class="delete-btn" on:click={() => {
                                deleteConfirmationPromptFilepath = file.path
                                showDeleteConfirmationPrompt = true
                                toast.attention('Waiting for deletion confirmation...')
                                deleteConfirmationRandomNumber = deleteConfirmationRandomNumberGen()
                            }}>
                                <i class="fa-solid fa-trash"></i>
                            </button>
                        </li>
                        <li>
                            <a target="_blank" href={
                                file.isDir ? `/zip?path=${encodeURIComponent(file.path)}` : `/download?path=${encodeURIComponent(file.path)}`
                            }>
                                <i class="fa-solid fa-download"></i>
                            </a>
                        </li>
                    </ul>
                </td>
            </tr>
        {/each}
    </table>
</main>

<style lang="scss">
    $APP-WIDTH: 70vw;
    $INNER-APP-WIDTH: calc(#{$APP-WIDTH} - 1em);
    $APP-HEIGHT: 80vh;

    main {
        background-color: #AAAAAAAA;
        border-radius: 1em;

        width: $APP-WIDTH;
        min-width: $APP-WIDTH;
        
        height: $APP-HEIGHT;
        min-height: $APP-HEIGHT;

        overflow-y: scroll;
        scrollbar-width: none;
    }

    code {
        background-color: #00000088;
        border-radius: 0.2em;
    }

    code, #title {
        font-family: 'JetBrains Mono Variable', sans-serif;
    }

    #title {
        background-color: #000000BB;
        color: white;
        
        padding: 0.5em;
        h1 { margin: none; }

        width: $INNER-APP-WIDTH;

        text-align: center;
    }

    i:hover {
        filter: brightness(0.8);
    }

    #tools {
        width: calc(#{$INNER-APP-WIDTH} - 10vw);
        height: 3em;

        // margin: 0 2em;
        margin: 0 auto;
        
        background-color: #333;
        border-radius: 0.8em;
        
    }
    
    ul.horizontal {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;

        margin: 0;
        padding: 0;

        height: 3em;
        
        li {
            flex: 1;
            list-style: none;
    
            align-self: center;
    
            font-size: 1.5em;
        }
    }


    #files {
        $TABLE-WIDTH: calc(#{$INNER-APP-WIDTH} - 10vw);
        $TABLE-UNIT: calc(#{$TABLE-WIDTH} / 100);

        width: $TABLE-WIDTH;
        max-width: calc(#{$INNER-APP-WIDTH} - 10vw);
        margin: 0.5em auto;

        border-collapse: collapse;
        table-layout:fixed;

        &, tr, td:not(.icon-td), th:not(.icon-th) {
            border: 1px solid black;
        }

        tr {
            width: $TABLE-WIDTH;
            height: 3em;

            &.row-greyed {
                background-color: #00000033;
            }

            i {
                color: white;
            }
        }

        .icon-th, .icon-td {
            // width: calc(#{$TABLE-UNIT} * 10);
            
            height: 3em;
            
            display: grid;
            place-content: center;
        }

        .name-td, .name-th {
            padding: 0 1em;

            width: calc((#{$TABLE-UNIT} * 50) - 2em);
        }
        
        .size-th, .size-td {
            text-align: right;
            
            padding: 0 1em;

            width: calc((#{$TABLE-UNIT} * 20) - 2em);
        }

        .action-th, .action-td {
            width: calc(#{$TABLE-UNIT} * 20);
            height: 3em;

            text-align: center;

            button {
                background-color: transparent;
                color: inherit;
                
                border: none;
                outline: none;

                width: inherit;
                height: inherit;

                display: inline-block;
                font-size: inherit;

                cursor: pointer;
            }
        }

    }

    a {
        text-decoration: none;
        color: inherit;

        cursor: pointer;
        
        &:hover {
            color: #35b2ff;
            text-decoration: underline;
        }
    }

    #copy-btn, .hidden-btn {
        background-color: transparent;
        color: inherit;
        
        outline: none;
        border: none;

        width: inherit;
        height: inherit;
        font-size: inherit;

        cursor: pointer;
    }

    .confirmation-prompt-container {
        min-width: 100%;
        width: 100%;
        
        min-height: 100%;
        height: 100%;

        z-index: 1000;
        display: grid;
        position: absolute;
        inset: 0;
        place-content: center;

        .confirmation-prompt {
            background-color: #333333BB;
            color: white;
            text-align: center;
            
            border-radius: 1em;

            display: grid;
            place-content: center;
            width: 50em;
            height: 25em;

            padding: 2em;

            button, input {
                margin: 1.5em 0;

                color: white;
                background-color: #333;
                text-align: center;

                outline: none;
                
                border: 1px solid black;
                border-radius: 0.5em;
            }

            .delete-popup-no-btn {
                height: 3em;
            }

        }
    }
</style>