import { cssomSheet, tw } from 'twind';
import install from '@twind/with-web-components';
import config from '../twind.config';
import graph from '../core/graph.js';
import { selectState } from '../core/state.js';
import sort, { fileType, groupKey } from '../core/sort.js';

const withTwind = install(config);
const sheet = cssomSheet({ target: new CSSStyleSheet() });
sheet.target.replaceSync(`
  .declaration {
    background-color: ${tw.theme('colors.white')};
  }
  .declaration-hover {
    background-color: ${tw.theme('colors.gray.100')};
  }
  .declaration-select-impacted {
    background-color: ${tw.theme('colors.green.100')};
  }
  .declaration-select-changed {
    background-color: ${tw.theme('colors.blue.100')};
  }

  .joint-searching {
    width: 10px;
    stroke: ${tw.theme('colors.blue.400')};
    transform: rotate(-90deg);
  }
  .joint-searching-path {
    stroke-width: 20px;
    stroke-dasharray: 1000;
    stroke-linecap: round;
    animation: joint-searching-animation 1s linear infinite;
  }
  @keyframes joint-searching-animation {
    0% {
      stroke-dashoffset: 1000;
    }
    100% {
      stroke-dashoffset: 0;
    }
  }
  .joint-normal {
    background-color: ${tw.theme('colors.gray.300')};
  }
  .joint-select-impacted {
    background-color: ${tw.theme('colors.green.500')};
  }
  .joint-select-changed {
    background-color: ${tw.theme('colors.blue.500')};
  }

  .edge-select-impacted {
    stroke-dasharray: 7;
    stroke-linecap: round;
    animation: edge-animation 70s linear infinite;
  }
  @keyframes edge-animation {
    0% {
      stroke-dashoffset: 1000;
    }
    100% {
      stroke-dashoffset: 0;
    }
  }
  .edge-select-changed {
    stroke-dasharray: 7;
    stroke-linecap: round;
    animation: edge-animation-changed 70s linear infinite;
  }
  @keyframes edge-animation-changed {
    0% {
      stroke-dashoffset: 0;
    }
    100% {
      stroke-dashoffset: 1000;
    }
  }

  .connection-button-enable {
    fill: ${tw.theme('colors.blue.500')};
  }
  .connection-button-disable {
    fill: ${tw.theme('colors.gray.500')};
  }

  .sync-button-hover {
    background-color: ${tw.theme('colors.gray.200')};
  }
  .sync-button-select {
    background-color: ${tw.theme('colors.blue.500')};
  }
  .sync-button-select div {
    fill: ${tw.theme('colors.white')};
  }
`);

export default class ServiceGraph extends withTwind(HTMLElement) {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.adoptedStyleSheets = [sheet.target];
    this.shadowRoot.innerHTML = `
      <div id="panel" class="relative w-[5000px] h-[5000px]">
        <svg xmlns="http://www.w3.org/2000/svg" id="edges" class="absolute w-full h-full z-10 pointer-events-none"></svg>
        <div id="nodes" class="absolute w-full h-full"></div>
        <div class="fixed flex gap-x-2 z-50 right-2 top-2">
          <button id="sync-button" class="rounded-md border-1" title="Auto sync">
            <div class="fill-gray-500 m-2">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16"><path d="M1.705 8.005a.75.75 0 0 1 .834.656 5.5 5.5 0 0 0 9.592 2.97l-1.204-1.204a.25.25 0 0 1 .177-.427h3.646a.25.25 0 0 1 .25.25v3.646a.25.25 0 0 1-.427.177l-1.38-1.38A7.002 7.002 0 0 1 1.05 8.84a.75.75 0 0 1 .656-.834ZM8 2.5a5.487 5.487 0 0 0-4.131 1.869l1.204 1.204A.25.25 0 0 1 4.896 6H1.25A.25.25 0 0 1 1 5.75V2.104a.25.25 0 0 1 .427-.177l1.38 1.38A7.002 7.002 0 0 1 14.95 7.16a.75.75 0 0 1-1.49.178A5.5 5.5 0 0 0 8 2.5Z"></path></svg>
            </div>
          </button>
          <button id="settings-button" class="hover:bg-gray-200 rounded-md border-1" title="Settings">
            <div class="fill-gray-500 m-2">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16"><path d="M8 0a8.2 8.2 0 0 1 .701.031C9.444.095 9.99.645 10.16 1.29l.288 1.107c.018.066.079.158.212.224.231.114.454.243.668.386.123.082.233.09.299.071l1.103-.303c.644-.176 1.392.021 1.82.63.27.385.506.792.704 1.218.315.675.111 1.422-.364 1.891l-.814.806c-.049.048-.098.147-.088.294.016.257.016.515 0 .772-.01.147.038.246.088.294l.814.806c.475.469.679 1.216.364 1.891a7.977 7.977 0 0 1-.704 1.217c-.428.61-1.176.807-1.82.63l-1.102-.302c-.067-.019-.177-.011-.3.071a5.909 5.909 0 0 1-.668.386c-.133.066-.194.158-.211.224l-.29 1.106c-.168.646-.715 1.196-1.458 1.26a8.006 8.006 0 0 1-1.402 0c-.743-.064-1.289-.614-1.458-1.26l-.289-1.106c-.018-.066-.079-.158-.212-.224a5.738 5.738 0 0 1-.668-.386c-.123-.082-.233-.09-.299-.071l-1.103.303c-.644.176-1.392-.021-1.82-.63a8.12 8.12 0 0 1-.704-1.218c-.315-.675-.111-1.422.363-1.891l.815-.806c.05-.048.098-.147.088-.294a6.214 6.214 0 0 1 0-.772c.01-.147-.038-.246-.088-.294l-.815-.806C.635 6.045.431 5.298.746 4.623a7.92 7.92 0 0 1 .704-1.217c.428-.61 1.176-.807 1.82-.63l1.102.302c.067.019.177.011.3-.071.214-.143.437-.272.668-.386.133-.066.194-.158.211-.224l.29-1.106C6.009.645 6.556.095 7.299.03 7.53.01 7.764 0 8 0Zm-.571 1.525c-.036.003-.108.036-.137.146l-.289 1.105c-.147.561-.549.967-.998 1.189-.173.086-.34.183-.5.29-.417.278-.97.423-1.529.27l-1.103-.303c-.109-.03-.175.016-.195.045-.22.312-.412.644-.573.99-.014.031-.021.11.059.19l.815.806c.411.406.562.957.53 1.456a4.709 4.709 0 0 0 0 .582c.032.499-.119 1.05-.53 1.456l-.815.806c-.081.08-.073.159-.059.19.162.346.353.677.573.989.02.03.085.076.195.046l1.102-.303c.56-.153 1.113-.008 1.53.27.161.107.328.204.501.29.447.222.85.629.997 1.189l.289 1.105c.029.109.101.143.137.146a6.6 6.6 0 0 0 1.142 0c.036-.003.108-.036.137-.146l.289-1.105c.147-.561.549-.967.998-1.189.173-.086.34-.183.5-.29.417-.278.97-.423 1.529-.27l1.103.303c.109.029.175-.016.195-.045.22-.313.411-.644.573-.99.014-.031.021-.11-.059-.19l-.815-.806c-.411-.406-.562-.957-.53-1.456a4.709 4.709 0 0 0 0-.582c-.032-.499.119-1.05.53-1.456l.815-.806c.081-.08.073-.159.059-.19a6.464 6.464 0 0 0-.573-.989c-.02-.03-.085-.076-.195-.046l-1.102.303c-.56.153-1.113.008-1.53-.27a4.44 4.44 0 0 0-.501-.29c-.447-.222-.85-.629-.997-1.189l-.289-1.105c-.029-.11-.101-.143-.137-.146a6.6 6.6 0 0 0-1.142 0ZM11 8a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM9.5 8a1.5 1.5 0 1 0-3.001.001A1.5 1.5 0 0 0 9.5 8Z"></path></svg>
            </div>
          </button>
          <settings-popup id="settings-popup" class="absolute"></settings-popup>
        </div>
      </div>

      <template id="service-template">
        <div class="service absolute rounded-md hover:ring-2 cursor-move select-none">
          <div class="absolute rounded-md w-full h-full bg-white/50 backdrop-blur-md"></div>
          <div class="flex items-center">
            <button id="connection-button" class="relative hover:bg-gray-200 hover:rounded-full p-2" title="Add caller hint">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="13" height="13"><path d="M6.122.392a1.75 1.75 0 0 1 1.756 0l5.25 3.045c.54.313.872.89.872 1.514V7.25a.75.75 0 0 1-1.5 0V5.677L7.75 8.432v6.384a1 1 0 0 1-1.502.865L.872 12.563A1.75 1.75 0 0 1 0 11.049V4.951c0-.624.332-1.2.872-1.514ZM7.125 1.69a.248.248 0 0 0-.25 0l-4.63 2.685L7 7.133l4.755-2.758ZM1.5 11.049a.25.25 0 0 0 .125.216l4.625 2.683V8.432L1.5 5.677Zm11.672-.282L11.999 12h3.251a.75.75 0 0 1 0 1.5h-3.251l1.173 1.233a.75.75 0 1 1-1.087 1.034l-2.378-2.5a.75.75 0 0 1 0-1.034l2.378-2.5a.75.75 0 0 1 1.087 1.034Z"></path></svg>
            </button>
            <span class="name relative ml-1 mr-2 text-gray-500"></span>
          </div>
          <div class="errors relative"></div>
          <div class="flex">
            <div class="in">
            </div>
            <div class="out">
            </div>
          </div>
        </div>
      </template>

      <template id="error-template">
        <div class="error flex items-center rounded bg-red-100 text-red-700 mt-2 mx-3 px-4 py-2">
          <div class="fill-red-700">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16"><path d="M2.343 13.657A8 8 0 1 1 13.658 2.343 8 8 0 0 1 2.343 13.657ZM6.03 4.97a.751.751 0 0 0-1.042.018.751.751 0 0 0-.018 1.042L6.94 8 4.97 9.97a.749.749 0 0 0 .326 1.275.749.749 0 0 0 .734-.215L8 9.06l1.97 1.97a.749.749 0 0 0 1.275-.326.749.749 0 0 0-.215-.734L9.06 8l1.97-1.97a.749.749 0 0 0-.326-1.275.749.749 0 0 0-.734.215L8 6.94Z"></path></svg>
          </div>
          <span class="message ml-2"></span>
        </div>
      </template>

      <template id="file-template">
        <div class="file relative rounded bg-white border-1 drop-shadow m-5 py-1 z-30">
          <div class="flex mb-1 px-2 items-center">
            <p class="name"></p>
          </div>
          <ul class="declarations divide-y"></ul>
        </div>
      </template>

      <template id="declaration-template">
        <li class="declaration flex items-center h-6">
          <div class="joint-slot absolute left-1"></div>
          <p class="name w-full px-4 hover:text-blue-600 hover:underline hover:cursor-pointer"></p>
          <div class="joint-slot absolute right-1"></div>
        </li>
      </template>

      <template id="joint-template">
        <div class="joint flex items-center justify-center w-100 h-100 -top-1 mx-1">
          <div class="joint-inner absolute w-1.5 h-1.5 rounded-full"></div>
          <svg class="joint-searching absolute fill-none overflow-visible" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle class="joint-searching-path" cx="50" cy="50" r="50" /></svg>
        </div>
      </template>
    `;

    this.panel = this.shadowRoot.querySelector('#panel');
    this.nodes = this.shadowRoot.querySelector('#nodes');
    this.edges = this.shadowRoot.querySelector('#edges');
    this.serviceTemplate = this.shadowRoot.querySelector('#service-template');
    this.errorTemplate = this.shadowRoot.querySelector('#error-template');
    this.fileTemplate = this.shadowRoot.querySelector('#file-template');
    this.declarationTemplate = this.shadowRoot.querySelector('#declaration-template');
    this.jointTemplate = this.shadowRoot.querySelector('#joint-template');
    this.errors = [];
    this.callerHints = new Map();
    this.filesChangedKeys = [];
    this.searchingKeys = new Set();
    this.declarations = new Map();
    this.selectEntrypoint = '';
    this.selectEntrypointState = selectState.NORMAL;
    this.selectDeclaration = '';
    this.selectDeclarations = new Set();
    this.callbackStateChanged = () => {};
    this.callbackConnectionPressed = () => {};
    this.callbackDeclarationPressed = () => {};

    const syncButton = this.shadowRoot.querySelector('#sync-button');
    const handleSelectSyncButton = () => {
      if (this.enableSync) {
        syncButton.classList.add('sync-button-select');
        this.callbackStateChanged(selectState.SELECT);
      } else {
        this.unselectChanged();
        syncButton.classList.remove('sync-button-select');
        requestAnimationFrame(() => {
          this.edges.innerHTML = '';
          this.renderEdges(this.graphs, this.declarations);
        });
        this.callbackStateChanged(selectState.NORMAL);
      }
    };
    handleSelectSyncButton();
    syncButton.addEventListener('click', () => {
      this.enableSync = !this.enableSync;
      handleSelectSyncButton();
    });
    syncButton.addEventListener('mouseover', () => {
      syncButton.classList.add('sync-button-hover');
    });
    syncButton.addEventListener('mouseleave', () => {
      syncButton.classList.remove('sync-button-hover');
    });

    const settingsPopup = this.shadowRoot.querySelector('#settings-popup');
    settingsPopup.onClose = () => settingsPopup.close();
    this.shadowRoot.querySelector('#settings-button').addEventListener('click', (e) => {
      settingsPopup.style.right = '7px';
      settingsPopup.style.top = `${e.currentTarget.getBoundingClientRect().bottom + 5}px`;
      settingsPopup.open();
      e.stopPropagation();
    });
  }

  get enableSync() {
    return this.getAttribute('enablesync') === 'true';
  }

  set enableSync(value) {
    this.setAttribute('enablesync', value);
  }

  set onStateChanged(callback) {
    this.callbackStateChanged = callback;
  }

  set onConnectionPressed(callback) {
    this.callbackConnectionPressed = callback;
  }

  set onDeclarationPressed(callback) {
    this.callbackDeclarationPressed = callback;
  }

  static get observedAttributes() {
    return ['src', 'errors', 'callerhints', 'fileschangedkeys', 'searchingkeys', 'state', 'enablesync', 'repourl', 'prnumber', 'entrypointselect'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'src') {
      this.graphs = JSON.parse(newValue);
      this.render();
    }
    if (name === 'errors') {
      this.errors = JSON.parse(newValue);
      this.render();
    }
    if (name === 'callerhints') {
      this.callerHints = new Map(Object.entries(JSON.parse(newValue)));
      this.render();
    }
    if (name === 'fileschangedkeys') {
      this.filesChangedKeys = JSON.parse(newValue);
      this.render();
    }
    if (name === 'searchingkeys') {
      this.searchingKeys = new Set(JSON.parse(newValue));
      this.render();
    }
    if (name === 'state') {
      if (!this.enableSync) {
        return;
      }

      this.state = JSON.parse(newValue);
      this.unselectChanged();
      this.selectChanged();
      this.scrollToDeclaration(this.selectDeclaration);
    }
    if (name === 'repourl') {
      this.repoUrl = newValue;
      if (this.repoUrl) {
        this.shadowRoot.querySelector('#sync-button').classList.add('hidden');
      }
      this.render();
    }
    if (name === 'prnumber') {
      this.prNumber = newValue;
      this.render();
    }
    if (name === 'entrypointselect') {
      const obj = JSON.parse(newValue);

      for (const dec of this.declarations.values()) {
        dec.classList.remove('declaration-hover', 'declaration-select-impacted');
        dec.querySelectorAll('.joint-inner')
          .forEach((j) => j.classList.remove(
            'joint-normal',
            'joint-select-impacted',
            'joint-select-changed',
          ));
      }

      switch (obj.state) {
        case selectState.NORMAL:
          if (this.selectEntrypointState === selectState.SELECT) {
            for (const dec of this.declarations.values()) {
              const file = dec.closest('.file');
              file.classList.remove('ring-2');
            }
            if (this.enableSync || this.selectDeclaration) {
              this.selectChanged();
            }
          }
          break;
        case selectState.OVER:
          if (this.selectEntrypointState === selectState.SELECT) {
            for (const dec of this.declarations.values()) {
              const file = dec.closest('.file');
              file.classList.remove('ring-2');
            }
            if (this.enableSync || this.selectDeclaration) {
              this.selectChanged();
            }
          }

          this.declarations.get(obj.posKey).classList.add('declaration-hover');
          break;
        case selectState.SELECT:
          this.unselectChanged();
          this.selectDeclarations = new Set();
          this.declarations.get(obj.posKey).classList.add('declaration-select-impacted');

          this.scrollToDeclaration(obj.posKey);
          for (const [key, dec] of this.declarations) {
            if (key === obj.posKey) {
              const file = dec.closest('.file');
              file.classList.add('ring-2');
              break;
            }
          }
          break;
        default:
      }

      requestAnimationFrame(() => {
        this.edges.innerHTML = '';
        this.renderEdges(this.graphs, this.declarations);
      });

      this.selectEntrypointState = obj.state;
      this.selectEntrypoint = obj.posKey;
    }
  }

  render() {
    this.nodes.innerHTML = '';
    for (let i = 0; i < this.graphs.length; i += 1) {
      this.renderGraph(this.graphs[i], i);
    }
    requestAnimationFrame(() => {
      this.edges.innerHTML = '';
      this.renderEdges(this.graphs, this.declarations);
    });

    for (const dec of this.declarations.values()) {
      dec.querySelectorAll('.joint-searching')
        .forEach((j) => j.classList.add('hidden'));
    }
  }

  renderGraph(g, i, depth = 0) {
    const serviceRoot = document.importNode(this.serviceTemplate.content, true);
    const service = serviceRoot.querySelector('.service');
    service.style.left = `${depth * 430 + 30}px`;
    service.style.top = `${i * 150 + 30}px`;
    service.querySelector('.name').innerHTML = g.service;

    const connectionButton = service.querySelector('#connection-button');
    connectionButton.classList.add(this.callerHints.get(g.service)
      ? 'connection-button-enable' : 'connection-button-disable');
    connectionButton.addEventListener('click', (e) => {
      e.stopPropagation();
      this.callbackConnectionPressed(g.service, e.currentTarget);
    });

    const error = this.errors.find((e) => e.service === g.service);
    if (error) {
      const errorRoot = document.importNode(this.errorTemplate.content, true);
      const errorDom = errorRoot.querySelector('.error');
      errorDom.querySelector('.message').innerHTML = 'Signature loading failed. Please recompile this project.';
      service.querySelector('.errors').appendChild(errorDom);
    }

    service.addEventListener('mousedown', (e) => {
      const panelRect = this.panel.getBoundingClientRect();
      const offsetX = panelRect.left + e.clientX - service.getBoundingClientRect().left;
      const offsetY = panelRect.top + e.clientY - service.getBoundingClientRect().top;

      const drag = (de) => {
        service.style.left = `${de.clientX - offsetX}px`;
        service.style.top = `${de.clientY - offsetY}px`;

        this.edges.innerHTML = '';
        this.renderEdges(this.graphs, this.declarations);
      };

      document.addEventListener('mousemove', drag);
      document.addEventListener('mouseup', () => {
        document.removeEventListener('mousemove', drag);
      });
    });

    this.nodes.appendChild(service);

    function isOut(target, conns) {
      if (!target) {
        return true;
      }
      return conns
        .some((c) => (!c.entrypoint || c.entrypoint.path !== target.path)
          && c.origins.some((o) => o.path === target.path));
    }

    const selfOrigins = [];
    for (const conn of g.innerConnections) {
      for (const origin of conn.origins.filter((o) => o.path === conn.entrypoint?.path)) {
        selfOrigins.push({ entrypoint: origin });
      }
    }
    const filePossIn = sort.getFilePoss(
      g.innerConnections
        .filter((c) => !isOut(c.entrypoint, g.innerConnections))
        .map((c) => ({ entrypoint: c.entrypoint }))
        .concat(selfOrigins),
    ).filter((p) => p.type === fileType.FILE);
    for (const filePosIn of filePossIn) {
      this.renderFile(filePosIn, 0, 0, service.querySelector('.in'));
    }

    const filePossOut = sort.getFilePoss(
      g.innerConnections
        .flatMap((c) => c.origins)
        .filter((p) => isOut(p, g.innerConnections))
        .map((p) => ({ origin: p })),
      groupKey.ORIGIN,
    ).filter((p) => p.type === fileType.FILE);
    for (const filePosOut of filePossOut) {
      this.renderFile(filePosOut, 0, 0, service.querySelector('.out'));
    }

    (g.neighbours || [])
      .forEach((c, ci) => c.neighbours.forEach((s) => this.renderGraph(s, ci, depth + 1)));
  }

  renderFile(pos, i, depth, parent) {
    const fileRoot = document.importNode(this.fileTemplate.content, true);
    const file = fileRoot.querySelector('.file');
    file.style.left = `${depth * 200}px`;
    file.style.top = `${i * 30}px`;
    file.querySelector('.name').innerHTML = pos.path.split('/').pop();
    parent.appendChild(file);

    for (const dec of pos.declarations) {
      const declarationRoot = document.importNode(this.declarationTemplate.content, true);
      const declaration = declarationRoot.querySelector('.declaration');
      declaration.querySelector('.name').innerHTML = dec.name;
      if (this.filesChangedKeys.some((k) => k === graph.getPosKey(dec))) {
        declaration.querySelector('.name').classList.add('text-blue-600');
      } else {
        declaration.querySelector('.name').classList.add('text-gray-700');
      }
      declaration.querySelector('.name').addEventListener('click', () => {
        if (this.repoUrl) {
          toSha256(dec.path).then((sha) => {
            window.open(`${this.repoUrl}/pull/${this.prNumber}/files#diff-${sha}R${dec.line}`, '_blank');
          });
        } else {
          this.callbackDeclarationPressed(dec);
        }
      });
      file.querySelector('.declarations').appendChild(declaration);

      for (const jointSlot of declaration.querySelectorAll('.joint-slot')) {
        const jointRoot = document.importNode(this.jointTemplate.content, true);
        const joint = jointRoot.querySelector('.joint');
        joint.classList.add('hidden');
        jointSlot.appendChild(joint);
      }

      this.declarations.set(graph.getPosKey(dec), declaration);
    }
  }

  renderEdges(graphs, declarations, parentKey = null) {
    for (const g of graphs) {
      let selected = false;
      const parentKeys = [];
      for (const innerConn of g.innerConnections) {
        if (this.selectEntrypoint) {
          if (parentKey) {
            selected = this.selectEntrypointState === selectState.SELECT
              && parentKey === graph.getPosKey(innerConn.entrypoint);
          } else {
            selected = this.selectEntrypointState === selectState.SELECT
              && this.selectEntrypoint === graph.getPosKey(innerConn.entrypoint);
          }
        }

        for (const origin of innerConn.origins) {
          this.renderEdge(
            innerConn.entrypoint,
            origin,
            declarations,
            this.selectDeclaration
              ? this.selectDeclarations.has(graph.getPosKey(innerConn.entrypoint))
                && this.selectDeclarations.has(graph.getPosKey(origin))
              : selected,
          );
          if (graph.getPosKey(innerConn.entrypoint) === this.selectEntrypoint) {
            parentKeys.push(graph.getPosKey(origin));
          }
        }
      }

      for (const connection of g.neighbours || []) {
        let newParentKey = null;
        for (const conn of connection.innerConnections) {
          this.renderEdge(
            conn.entrypoint,
            conn.origin,
            declarations,
            this.selectDeclaration
              ? this.selectDeclarations.has(graph.getPosKey(conn.entrypoint))
              : selected,
          );

          if (parentKeys.find((k) => k === graph.getPosKey(conn.entrypoint))) {
            newParentKey = graph.getPosKey(conn.origin);
          }
        }

        this.renderEdges(
          connection.neighbours,
          declarations,
          newParentKey,
        );
      }
    }
  }

  renderEdge(pos1, pos2, declarations, selected) {
    const dom1 = declarations.get(graph.getPosKey(pos1));
    const dom2 = declarations.get(graph.getPosKey(pos2));
    const edge = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    if (dom1 && dom2) {
      const panelRect = this.panel.getBoundingClientRect();
      const dom1Rect = dom1.getBoundingClientRect();
      const dom2Rect = dom2.getBoundingClientRect();
      const x1 = dom1Rect.right - panelRect.left;
      const y1 = dom1Rect.top + (dom2Rect.height / 2) - panelRect.top;
      const x2 = dom2Rect.left - panelRect.left;
      const y2 = dom2Rect.top + (dom1Rect.height / 2) - panelRect.top;
      edge.setAttribute('d', `M ${x1} ${y1} C ${x1 + 20} ${y1} ${x2 - 20} ${y2} ${x2} ${y2}`);
    }
    dom1?.querySelectorAll('.joint')[1].classList.remove('hidden');
    dom2?.querySelectorAll('.joint')[0].classList.remove('hidden');
    if (this.searchingKeys.has(graph.getPosKey(pos1))) {
      dom1?.querySelectorAll('.joint')[0].classList.remove('hidden');
      dom1?.querySelectorAll('.joint-searching')[0].classList.remove('hidden');
    }
    if (this.searchingKeys.has(graph.getPosKey(pos2))) {
      dom2?.querySelectorAll('.joint')[0].classList.remove('hidden');
      dom2?.querySelectorAll('.joint-searching')[0].classList.remove('hidden');
    }
    if (selected) {
      if (this.selectDeclaration) {
        dom1?.querySelectorAll('.joint-inner').forEach((j) => j.classList.add('joint-select-changed'));
        dom2?.querySelectorAll('.joint-inner').forEach((j) => j.classList.add('joint-select-changed'));
        edge.classList.add('edge-select-changed');
        edge.setAttribute('stroke', tw.theme('colors.blue.600'));
      } else {
        dom1?.querySelectorAll('.joint-inner').forEach((j) => j.classList.add('joint-select-impacted'));
        dom2?.querySelectorAll('.joint-inner').forEach((j) => j.classList.add('joint-select-impacted'));
        edge.classList.add('edge-select-impacted');
        edge.setAttribute('stroke', tw.theme('colors.green.500'));
      }
    } else {
      dom1?.querySelectorAll('.joint-inner').forEach((j) => j.classList.add('joint-normal'));
      dom2?.querySelectorAll('.joint-inner').forEach((j) => j.classList.add('joint-normal'));
      edge.setAttribute('stroke', tw.theme('colors.gray.300'));
    }
    edge.setAttribute('fill', 'transparent');
    edge.setAttribute('stroke-width', selected ? '3' : '2');
    this.edges.appendChild(edge);
  }

  selectChanged() {
    if (!this.state) {
      return;
    }

    this.selectDeclaration = graph.getPosKey(this.state.didChange);
    this.selectDeclarations = graph.findParentDeclarationKeys(this.state.didChange, this.graphs);
    for (const [key, dec] of this.declarations) {
      if (key === graph.getPosKey(this.state.didChange)) {
        dec.classList.add('declaration-select-changed');
        const file = dec.closest('.file');
        file.classList.add('ring-2');
        break;
      }
    }

    requestAnimationFrame(() => {
      this.edges.innerHTML = '';
      this.renderEdges(this.graphs, this.declarations);
    });
  }

  unselectChanged() {
    this.selectDeclaration = '';

    for (const dec of this.declarations.values()) {
      dec.classList.remove('declaration-select-changed');
      dec.querySelectorAll('.joint-inner')
        .forEach((j) => j.classList.remove(
          'joint-normal',
          'joint-select-impacted',
          'joint-select-changed',
        ));
      const file = dec.closest('.file');
      file.classList.remove('ring-2');
    }
  }

  scrollToDeclaration(targetKey) {
    for (const [key, dec] of this.declarations) {
      if (key === targetKey) {
        const panelRect = this.panel.getBoundingClientRect();
        this.scrollTo(
          dec.getBoundingClientRect().left - panelRect.left - (this.clientWidth / 2),
          dec.getBoundingClientRect().top - panelRect.top - (this.clientHeight / 2),
        );
        break;
      }
    }
  }
}

async function toSha256(str) {
  const buffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
  const hashArray = Array.from(new Uint8Array(buffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}
