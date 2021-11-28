import * as MidiFileModule from "midifile";
import { DataFlowView } from "./renderer/DataFlowView";
import { PianoRollView } from "./renderer/PianoRollView";
import { ListView } from "./renderer/ListView";
import css from "./styles.lazy.css";
import { CheckboxFilterGroup } from './renderer/CheckboxFilterGroup';
import { getTracks } from "./renderer/MidiHelper";
import * as _ from 'lodash';

const MidiFile = MidiFileModule.default;

export class WmMidiFileDebugger {
    trackFilter = new CheckboxFilterGroup();
    trackFilterElement = null;
    filterItems = null;
    constructor() {
        window.wmDbg = this;
    }
    midifile = null;
    views = [];
    setMidiFile(arrayBuffer) {
        this.midifile = new MidiFile(arrayBuffer);
        this.midifile.trackNames = getTracks(this.midifile);
    }

    addListView(element) {
        const view = new ListView(element, this.trackFilter);
        this.views.push(view);
    }

    addPianoRollView(element) {
        const view = new PianoRollView(element, this.trackFilter);
        this.views.push(view);
    }

    update() {
        for(const view of this.views) {
            view.update(this.midifile);
        }
    }

    renderViews() {
        for(const view of this.views) {
            view.render(this.midifile);
        }
    }

    createFilter(element) {
        element.innerHTML = '';
        const filterItems = this.midifile.trackNames.map((x, idx) => ({name: `${x}(${idx})`, value: idx, class_: `wm-dbg-track-${idx}`}));
        const filterChanged = _(filterItems).isEqual(this.filterItems) === false;
        if (filterChanged) {
            this.filterItems = filterItems;
            this.trackFilterElement = this.trackFilter.createElement(this.filterItems);
        }
        this.trackFilter.onSelectionChanged = () => {
            this.renderViews();
        };
        element.appendChild(this.trackFilterElement);
    }
}

css.use();