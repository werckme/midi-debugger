import * as MidiFileModule from "midifile";
import { DataFlowView } from "./renderer/DataFlowView";
import { PianoRollView } from "./renderer/PianoRollView";
import { ListView } from "./renderer/ListView";
import css from "./styles.lazy.css";
const MidiFile = MidiFileModule.default;

export class WmMidiFileDebugger {
    constructor() {
        window.wmDbg = this;
    }
    midifile = null;
    views = [];
    setMidiFile(arrayBuffer) {
        this.midifile = new MidiFile(arrayBuffer);
    }

    addListView(element) {
        const view = new PianoRollView(element);
        this.views.push(view);
    }

    update() {
        for(const view of this.views) {
            view.update(this.midifile);
        }
    }
}

css.use();