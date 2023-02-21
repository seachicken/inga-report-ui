import { setup, tw } from 'twind';
import * as colors from 'twind/colors';
import FileTree from './components/FileTree.js';
import LayerView from './components/LayerView.js';
import { fileType, getFilePoss } from './core/sort.js';
import tokens from './tokens.json';

setup({
  theme: {
    colors: {
      black: colors.black,
      green: tokens.global.green.value,
      gray: colors.trueGray,
      white: colors.white,
    },
  },
});

window.customElements.define('file-tree', FileTree);
window.customElements.define('layer-view', LayerView);

const report = window.inga_report;
const repoUrl = window.inga_repo_url;
const headSha = window.inga_head_sha;
const filePoss = getFilePoss(report);
let selectedFileIndex = filePoss.findIndex((p) => p.type === fileType.FILE);
const selectedEntorypoints = selectedFileIndex < 0 ? [] : [filePoss[selectedFileIndex]];
const selectedOrigins = selectedEntorypoints[0]?.declarations[0]?.origins || [];

document.querySelector('#app').innerHTML = `
  <header class="${tw`flex items-center w-full p-2 text-2xl bg-green`}">
    <img class="${tw`w-10`}" src="logo.png">
    <span class="${tw`ml-2 text-white`}">Inga</span>
  </header>
  <div class="${tw`flex h-screen`}">
    <nav class="${tw`w-64 pt-2 pl-2`}">
      <file-tree src=${JSON.stringify(filePoss)} defaultindex=${selectedFileIndex} onclick=></file-tree>
    </nav>
    <div id="separator" class="${tw`cursor-col-resize border-1`}"></div>
    <main class="${tw`flex`}">
      <div>
        <div class="${tw`flex items-center w-full ml-2`}">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="20" height="20"><path d="M2 1.75C2 .784 2.784 0 3.75 0h5.586c.464 0 .909.184 1.237.513l2.914 2.914c.329.328.513.773.513 1.237v8.586A1.75 1.75 0 0 1 12.25 15h-7a.75.75 0 0 1 0-1.5h7a.25.25 0 0 0 .25-.25V6H9.75A1.75 1.75 0 0 1 8 4.25V1.5H3.75a.25.25 0 0 0-.25.25V4.5a.75.75 0 0 1-1.5 0Zm-.5 10.487v1.013a.75.75 0 0 1-1.5 0v-1.012a3.748 3.748 0 0 1 3.77-3.749L4 8.49V6.573a.25.25 0 0 1 .42-.183l2.883 2.678a.25.25 0 0 1 0 .366L4.42 12.111a.25.25 0 0 1-.42-.183V9.99l-.238-.003a2.25 2.25 0 0 0-2.262 2.25Zm8-10.675V4.25c0 .138.112.25.25.25h2.688l-.011-.013-2.914-2.914-.013-.011Z"></path></svg>
          <span class="${tw`ml-2 text-2xl`}">Affected files</span>
        </div>
        <layer-view id="entorypoint-layer-view" origins=${JSON.stringify(selectedEntorypoints)} repourl=${repoUrl} headsha=${headSha}></layer-view>
      </div>
      <div>
        <div class="${tw`flex items-center w-full ml-2`}">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="20" height="20"><path d="M1 1.75C1 .784 1.784 0 2.75 0h7.586c.464 0 .909.184 1.237.513l2.914 2.914c.329.328.513.773.513 1.237v9.586A1.75 1.75 0 0 1 13.25 16H2.75A1.75 1.75 0 0 1 1 14.25Zm1.75-.25a.25.25 0 0 0-.25.25v12.5c0 .138.112.25.25.25h10.5a.25.25 0 0 0 .25-.25V4.664a.25.25 0 0 0-.073-.177l-2.914-2.914a.25.25 0 0 0-.177-.073ZM8 3.25a.75.75 0 0 1 .75.75v1.5h1.5a.75.75 0 0 1 0 1.5h-1.5v1.5a.75.75 0 0 1-1.5 0V7h-1.5a.75.75 0 0 1 0-1.5h1.5V4A.75.75 0 0 1 8 3.25Zm-3 8a.75.75 0 0 1 .75-.75h4.5a.75.75 0 0 1 0 1.5h-4.5a.75.75 0 0 1-.75-.75Z"></path></svg>
          <span class="${tw`ml-2 text-2xl`}">Files changed</span>
        </div>
        <layer-view id="origin-layer-view" origins=${JSON.stringify(selectedOrigins)} repourl=${repoUrl} headsha=${headSha}></layer-view>
      </div>
    </main>
  </div>
`;

const nav = document.querySelector('nav');
const fileTree = document.querySelector('file-tree');
const separator = document.querySelector('#separator');
const entorypointLayerView = document.querySelector('#entorypoint-layer-view');
const originLayerView = document.querySelector('#origin-layer-view');

fileTree.addEventListener('itemselect', (e) => {
  selectedFileIndex = e.detail.index;
  const entorypoints = [filePoss[selectedFileIndex]];
  entorypointLayerView.origins = JSON.stringify(entorypoints);
  originLayerView.origins = JSON.stringify(entorypoints[0]?.declarations[0]?.origins || []);
});

entorypointLayerView.addEventListener('itemselect', (e) => {
  const { declarations } = filePoss[selectedFileIndex];
  originLayerView.origins = JSON.stringify(declarations[e.detail.index].origins);
});

function risizeSeperator(e) {
  nav.style.flexBasis = `${e.x}px`;
}

separator.addEventListener('mousedown', () => {
  document.addEventListener('mousemove', risizeSeperator);
  document.addEventListener('mouseup', () => {
    document.removeEventListener('mousemove', risizeSeperator);
  });
});
