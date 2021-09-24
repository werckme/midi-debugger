import * as MidiFileModule from "midifile";
import { DataFlowView } from "./renderer/DataFlowView";
import { ListView } from "./renderer/ListView";
import css from "./styles.lazy.css";
const MidiFile = MidiFileModule.default;

export class WmMidiFileDebugger {
    midifile = null;
    views = [];
    setMidiFile(arrayBuffer) {
        this.midifile = new MidiFile(arrayBuffer);
    }

    addListView(element) {
        //const view = new DataFlowView(element);
        const view = new ListView(element);
        this.views.push(view);
    }

    update() {
        for(const view of this.views) {
            view.update(this.midifile);
        }
    }
}

css.use();